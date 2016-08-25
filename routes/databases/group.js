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
	Manage:'MANAGE' //团员管理，删除团,授权副团长,
};

var OPERATE_GRANT_MAP = {
	VIEW:[GRANT.TeamMember,GRANT.ViceCapTain,GRANT.Captain],
	COUNT:[GRANT.ViceCapTain,GRANT.Captain],
	MANAGE:[GRANT.Captain]
};

/*************** Group操作 ****************/
/**
 * 添加团
 * */
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
/**
 * 根据ID查找团
 * */
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
/**
 * 根据创建者查找团
 * */
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
/**
 * 根据成员查找团
 * */
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
/**
 * 根据用户（即创建者或者成员）查找团
 * */
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
/**
 * 删除团
 * */
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
/**
 * 添加成员
 * 成员权限默认为最低权限,memberInfo应该至少拥有这样的属性：{provider:'a',user_id:1}
 * */
function addMember(groupId,provider,userId,memberInfo,money){
	var updateDoc = {$push:{members:{user:memberInfo,money:money,grant:GRANT.TeamMember,state:'normal'}}};
	return updateMemberWithCheck(OPERATE.Manage,{id:groupId},groupId, provider,userId,updateDoc);
}

function addMemberByInvite(groupId,memberInfo,money){
	var updateDoc = {$push:{members:{user:memberInfo,money:money,grant:GRANT.TeamMember,state:'normal'}}};
	return updateMember({id:groupId},updateDoc);
}

/**
 * 删除成员
 * 成员实际上不是真的删掉，只是把团员的state属性改成delete状态,userInfo应该至少拥有这样的属性：{provider:'a',user_id:1}
 * */
function deleteMember(groupId,provider,userId,memberInfo){
	var queryDoc = {id:groupId,'members.user.provider':memberInfo.provider,'members.user.user_id':memberInfo.userId},
		updateDoc = {'members.$.state':'delete'};
	return updateMemberWithCheck(OPERATE.View,queryDoc,groupId, provider,userId,updateDoc);
}

/**
 * 授权成员为副团长
 * */
function authorizeToBeViceCapTain(groupId,provider,userId,memberInfo){
	return authorize(groupId,provider,userId,memberInfo,false);
}

/**
 * 收回副团长的授权
 * */
function deauthorizeViceCapTain(groupId,provider,userId,memberInfo){
	return authorize(groupId,provider,userId,memberInfo,true);
}

/**
 * 更新成员余额
 * 成员的余额,memberInfos的信息应该是这样：[{provider:'a',user_id:1,money:10},{provider:'b',user_id:2,money:100}];
 * */
function updateMoney(groupId,provider,userId,memberInfos){
	var deferred = when.defer(),
		updateMoneyPromise = deferred.promise;
	checkGrant(OPERATE.Count,groupId,provider,userId).then(function(){
		var promises = [];
		for(var i = 0, len = memberInfos.length; i < len; i++){
			var memberInfo = memberInfos[i];
			var queryDoc = {id:groupId,'members.user.provider':memberInfo.provider,'members.user.user_id':memberInfo.userId},
				updateDoc = {'members.$.money':memberInfo.money};
			var promise = updateMember(queryDoc, updateDoc);
			promises.push(promise);
		}
		when.all(promises).then(function(){
			deferred.resolve();
		}).catch(function(){
			deferred.reject();
			console.log('update Money failed.date:'+new Date().getTime());
		});
	}).catch(function(){
		deferred.reject();
	});
	return updateMoneyPromise;
}


/*************** 内部的函数 *****************/
/**
 * 授权或取消授权成员为副团长
 * */
function authorize(groupId,provider,userId,memberInfo,reverse){
	var grant = reverse ? GRANT.TeamMember : GRANT.ViceCapTain;
	var queryDoc = {id:groupId,'members.user.provider':memberInfo.provider,'members.user.user_id':memberInfo.userId},
		updateDoc = {'members.$.grant':grant};
	//只有团长有权限执行此操作
	return updateMemberWithCheck(OPERATE.Manage,queryDoc,groupId, provider,userId,updateDoc);
}
function createGroupCollection(db){
	var deferred = when.defer();
	DbUtil.createCollection(db,COL).then(function(evt){
		deferred.resolve({db:evt.db,col:evt.col});
	}).catch(function(evt){
		deferred.rejected({db:evt.db,err:evt.err});
	});
	return deferred.promise;
}
function updateMemberWithCheck(operate,queryDoc, groupId, provider,userId,updateDoc){
	var deferred = when.defer(),
		updateMemberPromise = deferred.promise;
	checkGrant(operate,groupId,provider,userId).then(function(){
		updateMember(queryDoc,updateDoc).then(function(doc){
			deferred.resolve(doc);
		}).catch(function(evt){
			deferred.reject(evt);
		});
	}).catch(function(evt){
		deferred.reject(evt);
	});
	return updateMemberPromise;
}
function updateMember(queryDoc, updateDoc){
	var deferred = when.defer(),
		updateMemberPromise = deferred.promise;
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
		return DbUtil.insertDoc(evt.db,evt.col,[groupInfo]);
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
	addMemberByInvite:addMemberByInvite,
	deleteMember:deleteMember,
	updateMoney: updateMoney,
	authorize: authorizeToBeViceCapTain,
	deauthorize: deauthorizeViceCapTain
};