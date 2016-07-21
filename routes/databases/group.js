var DbUtil = require('./dbutil');
var when = require('when');
var COL = 'groups';
var GRANT = {
	Captain:'CAPTAIN',
	ViceCapTain:'VICECAPTAIN',
	TeamMember:'TEAMMEMBER'
};
var OPERATE = {
	View:'VIEW', //查看团及余额和接收消息,和退出团
	Count:'COUNT',//更新团的余额信息
	Manage:'MANAGE' //团员管理，删除团,
};

var OPERATE_GRANT_MAP = {
	VIEW:[GRANT.TeamMember,GRANT.ViceCapTain,GRANT.Captain],
	COUNT:[GRANT.ViceCapTain,GRANT.Captain],
	MANAGE:[GRANT.Captain]
};

/*************** Group操作 ****************/
function addGroup(groupInfo){
	var deferred = when.defer(),
		addGroupPromise = deferred.promise;
	groupInfo.members = [{user:creator,money:0,grant:GRANT.Captain}];
	var getGroupColPromise = DbUtil.connect().then(function(db){
		return DbUtil.getCollection(db, COL);
	}).catch(function(evt){
		var createGroupColPromise = createGroupCollection(evt.db);
		insertGroup(createGroupColPromise,deferred,groupInfo);
	});
	insertGroup(getGroupColPromise,deferred, groupInfo);
	return addGroupPromise;
}

function findGroupById(groupId,provider,userId){
	var deferred = when.defer(),
		findGroupByIdPromise = deferred.promise;
	var operate = OPERATE.View;
	checkGrant(operate,groupId,provider,userId).then(function(){
		DbUtil.connect().then(function(db){
			return DbUtil.getCollection(db, COL);
		}).catch(function(err){
			deferred.reject(err);
		}).then(function(evt){
			if(!evt){
				return;
			}
			return findOneGroup({id:groupId});
		}).done(function(evt){
			if(!evt){
				return;
			}
			deferred.resolve(evt.doc);
			evt.db.close();
		});
	}).catch(function(){
		deferred.reject();
	});
	return findGroupByIdPromise;
}

function findGroupByCreator(provider,userId){
	var deferred = when.defer(),
		findGroupByMember = deferred.promise;
	findGroup({creator:{provider:provider,user_id:userId}})
		.then(function(docs){
			var results =[];
			for(var i = 0, len = docs.length; i < len; i++){
				var doc = docs[i];
				var members = doc.members,
					grant;
				for(var j = 0, len0 = members.length; j < len0; j++){
					if(members[j].user.provider === provider && members[j].user.user_id === userId){
						grant = members[j].grant;
						break;
					}
				}
				var result = {id:docs[i].id,groupName:docs[i].gname,members:docs[i].members.length,grant:grant};
				results.push(result);
			}
			deferred.resolve(results);
		}).catch(function(err){
			deferred.reject(err);
		});
	return findGroupByMember;
}

function findGroupByMember(provider,userId){
	var deferred = when.defer(),
		findGroupByMember = deferred.promise;
	findGroup({"members.user.provider":provider,"members.user.user_id":userId})
		.then(function(docs){
			var results =[];
			for(var i = 0, len = docs.length; i < len; i++){
				var doc = docs[i];
				var members = doc.members,
					grant;
				for(var j = 0, len0 = members.length; j < len0; j++){
					if(members[j].user.provider === provider && members[j].user.user_id === userId){
						grant = members[j].grant;
						break;
					}
				}
				var result = {id:docs[i].id,groupName:docs[i].gname,members:docs[i].members.length,grant:grant};
				results.push(result);
			}
			deferred.resolve(results);
		}).catch(function(err){
			deferred.reject(err);
		});
	return findGroupByMember;
}

function findGroupByUser(provider,userId){
	var deferred = when.defer(),
		findGroupByUserPromise = deferred.promise;
	findGroup({$or:[{creator:{provider:provider,user_id:userId}},
		{"members.user.provider":provider,"members.user.user_id":userId}]})
		.then(function(docs){
			var results =[];
			for(var i = 0, len = docs.length; i < len; i++){
				var doc = docs[i];
				var members = doc.members,
					grant;
				for(var j = 0, len0 = members.length; j < len0; j++){
					if(members[j].user.provider === provider && members[j].user.user_id === userId){
						grant = members[j].grant;
						break;
					}
				}
				var result = {id:docs[i].id,groupName:docs[i].gname,members:docs[i].members.length,grant:grant};
				results.push(result);
			}
			deferred.resolve(results);
	}).catch(function(err){
			deferred.reject(err);
		});
	return findGroupByUserPromise;
}

function deleteGroup(groupId,provider,user_id){
	var deferred = when.defer(),
		deleteGroupPromise = deferred.promise;
	var operate = OPERATE.Manage;
	checkGrant(operate,groupId,provider,user_id).then(function(){
		DbUtil.connect().then(function(db){
			return DbUtil.getCollection(db, COL);
		}).catch(function(err){
			deferred.reject(err);
		}).then(function(evt){
			if(!evt){
				return;
			}
			return DbUtil.deleteDoc(evt.db,evt.col,{id:groupId});
		}).done(function(evt){
			if(!evt){
				return;
			}
			deferred.resolve(evt.doc);
			evt.db.close();
		});
	}).catch(function(){
		deferred.reject();
	});
	return deleteGroupPromise;
}

/*********************  成员操作  **********************/
//新加的团员权限默认为最低权限
function addMember(groupId,provider,userId,userInfo,money){
	var updateDoc = {$push:{members:{user:userInfo,money:money,grant:GRANT.TeamMember,state:'normal'}}};
	return updateMember(OPERATE.Manage,{id:groupId},groupId, provider,userId,updateDoc);
}

//删除团员实际上不是真的删掉，只是把团员的state属性改成delete状态
function deleteMember(groupId,provider,userId,userInfo){
	var queryDoc = {id:groupId,'members.user.provider':userInfo.provider,'members.user.user_id':userInfo.userId},
		updateDoc = {'members.$.state':'delete'};
	return updateMember(OPERATE.View,queryDoc,groupId, provider,userId,updateDoc);
}

//更新成员的余额,userInfoes的信息应该是这样：[{provider:'a',user_id:1,money:10},{provider:'b',user_id:2,money:100}];
function updateMoney(groupId,provider,userId,userInfoes){
	var deferred = when.defer(),
		updateMoneyPromise = deferred.promise;
	var promises = [];
	for(var i = 0, len = userInfoes.length; i < len; i++){
		var userInfo = userInfoes[i];
		var queryDoc = {id:groupId,'members.user.provider':userInfo.provider,'members.user.user_id':userInfo.userId},
			updateDoc = {'members.$.money':userInfo.money};
		var promise = updateMember(OPERATE.View,queryDoc,groupId, provider,userId,updateDoc);
		promises.push(promise);
	}
	when.all(promises).then(function(){
		deferred.resolve();
	}).catch(function(){
		deferred.reject();
		console.log('update Money failed.date:'+new Date().getTime());
	});
	return updateMoneyPromise;
}

/*************** 内部的函数 *****************/
function createGroupCollection(db){
	var deferred = when.defer();
	DbUtil.createCollection(db,COL).then(function(evt){
		deferred.resolve({db:evt.db,col:evt.col});
	}).catch(function(evt){
		deferred.rejected({db:evt.db,err:evt.err});
	});
	return deferred.promise;
}
function updateMember(operate,queryDoc, groupId, provider,userId,updateDoc){
	var deferred = when.defer(),
		updateMemberPromise = deferred.promise;
	checkGrant(operate,groupId,provider,userId).then(function(){
		DbUtil.connect().then(function(db){
			return DbUtil.getCollection(db, COL);
		}).catch(function(evt){
			deferred.reject(evt);
		}).then(function(evt){
			return DbUtil.updateDoc(evt.db,evt.col,queryDoc,updateDoc);
		}).done(function(evt){
			deferred.resolve(evt.doc);
			evt.db.close;
		}).catch(function(evt){
			deferred.reject(evt);
			evt.db.close;
		});
	}).catch(function(){
		deferred.reject();
	});
	return updateMemberPromise;
}
function findGroup(query){
	var deferred = when.defer(),
		findGroupPromise = deferred.promise;
	DbUtil.connect().then(function(db){
		return DbUtil.getCollection(db, COL);
	}).catch(function(err){
		deferred.reject(err);
	}).then(function(evt){
		if(!evt){
			return;
		}
		return DbUtil.queryDoc(evt.db,evt.col,query);
	}).done(function(evt){
		if(!evt){
			return;
		}
		deferred.resolve(evt.docs);
		evt.db.close();
	});
	return findGroupPromise;
}
function findOneGroup(query,options){
	var deferred = when.defer(),
		findOneGroupPromise = deferred.promise;
	DbUtil.connect().then(function(db){
		return DbUtil.getCollection(db, COL);
	}).catch(function(err){
		deferred.reject(err);
	}).then(function(evt){
		if(!evt){
			return;
		}
		return DbUtil.queryOneDoc(evt.db,evt.col,query,options);
	}).done(function(evt){
		if(!evt){
			return;
		}
		deferred.resolve(evt.doc);
		evt.db.close();
	});
	return findOneGroupPromise;
}
function insertGroup(promise, deferred,groupInfo){
	promise.then(function(evt){
		if(!evt){
			return;
		}
		return DbUtil.insertDoc(evt.db,evt.col,[userInfo]);
	}).done(function(evt){
		if(!evt){
			return;
		}
		var type = evt.type,
			db = evt.db,
			doc = evt.doc;
		if(type === 'insert'){
			deferred.resolve(doc);
		}
		db.close();
	});
}

function checkGrant(operate,groupId,provider,userId){
	var deferred = when.defer(),
		checkGrantPromise = deferred.promise;
	DbUtil.connect().then(function(db){
		return DbUtil.getCollection(db, COL);
	}).catch(function(err){
		deferred.reject(err);
	}).then(function(evt){
		if(!evt){
			return;
		}
		var grants = [];
		for(grant in OPERATE_GRANT_MAP[operate]){
			var queryGrant = {'members.grant': grant};
			grants.push(queryGrant);
		}
		var filter = {id:groupId,'members.user.provider':provider,'members.user.user_id':userId,$or:grants};
		return DbUtil.queryDoc(evt.db,evt.col,filter);
	}).done(function(evt){
		if(!evt){
			return;
		}
		deferred.resolve(evt.doc);
		evt.db.close();
	}).catch(function(evt){
		if(!evt){
			return;
		}
		deferred.resolve(evt.doc);
		evt.db.close();
	});
	return checkGrantPromise;
}

module.exports = {
	addGroup: addGroup,
	findGroupByMember: findGroupByMember,
	findGroupByCreator: findGroupByCreator,
	findGroupByUser: findGroupByUser,
	findGroupById: findGroupById,
	deleteGroup: deleteGroup,
	addMember:addMember,
	deleteMember:deleteMember,
	updateMoney: updateMoney,
	OPERATE:OPERATE
};