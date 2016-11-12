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

var groupInfoProps = ['createtime','creator','description','gname','id','members','type'];

/*************** Group操作 ****************/
/**
 * 添加团
 * */
function addGroup(groupInfo){
	var deferred = when.defer(),
		addGroupPromise = deferred.promise;
	groupInfo.members = [{user:groupInfo.creator,money:0,grant:GRANT.Captain,state:'normal'}];
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
			return findGroupByIdPromise;
		}).then(function(evt){
			if(!evt){
				return;
			}
			return findOneGroup({id:groupId});
		}).done(function(doc){
			if(!doc){
				return;
			}
			var result={};
			if(doc){
				var grant;
				for(var i= 0,len=groupInfoProps.length;i<len;i++){
					var prop = groupInfoProps[i];
					var value = doc[prop];
					if(prop ==='members'){
						var members = [];
						for(var j= 0,len0=value.length;j<len0;j++){
							var member=value[j];
							if(member.state==='normal'){
								members.push({
									'user_name':member.user.user_name,
									'grant':member.grant,
									'money':member.money,
									'provider':member.user.provider,
									'userId':member.user['user_id']
								});
							}
							if(member.user.provider === provider && member.user.user_id === userId){
								grant = members[j].grant;
							}
						}
						value=members;
					}
					if(value){
						result[prop]=value;
					}
					if(grant){
						result.grant = grant;
					}
				}
			}
			deferred.resolve(result);
		});
	}).catch(function(evt){
		deferred.reject(evt);
		return findGroupByIdPromise;
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
				var result = {
					id:docs[i].id,
					groupName:docs[i].gname,
					members:docs[i].members.length,
					description:docs[i].description,
					createTime:docs[i].createtime,
					type:docs[i].type,
					grant:grant,
					updateTime:docs[i].lastModifyTime
				};
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
	findGroup({"members.user.provider":provider,"members.user.user_id":userId,'members.state':'normal'})
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
				var result = {
					id:docs[i].id,
					groupName:docs[i].gname,
					members:docs[i].members.length,
					description:docs[i].description,
					createTime:docs[i].createtime,
					type:docs[i].type,
					grant:grant,
					updateTime:docs[i].lastModifyTime
				};
				results.push(result);
			}
			deferred.resolve(results);
		}).catch(function(err){
			deferred.reject(err);
		});
	return findGroupByMember;
}

/**
 * 判断用户是否存在于团内
 * @param groupId  团队id
 * @param provider 用户的提供者
 * @param userId 用户id
 * @returns {*}
 */
function existMember(groupId,provider,userId){
    var deferred = when.defer(),
        findGroupByIdPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
        return findGroupByIdPromise;
    }).then(function(evt){
        if(!evt){
            return;
        }
        return findOneGroup({id:groupId});
    }).done(function(doc){
        if(!doc){
            return;
        }
        if(doc){
            var members = doc.members;
            for(var j= 0,len0=members.length;j<len0;j++){
                var member=members[j];
                if(member.user.provider === provider && member.user.user_id == userId){
                    deferred.resolve(member);
                }
            }
        }
        deferred.reject('member is not exist');
    });
    return findGroupByIdPromise;
}

/**
 * 根据用户（即创建者或者成员）查找团
 * */
function findGroupByUser(provider,userId){
	var deferred = when.defer(),
		findGroupByUserPromise = deferred.promise;
	try{
		findGroup({$or:[{'creator.provider':provider,'creator.user_id':userId},
			{"members.user.provider":provider,"members.user.user_id":userId,'members.state':'normal'}]})
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
					var result = {
						id:docs[i].id,
						groupName:docs[i].gname,
						members:docs[i].members.length,
						description:docs[i].description,
						createTime:docs[i].createtime,
						type:docs[i].type,
						grant:grant,
						updateTime:docs[i].lastModifyTime
					};
					results.push(result);
				}
				deferred.resolve(results);
			}).catch(function(evt){
				deferred.reject(evt);
				return findGroupByUserPromise;
			});
	}catch(e){
		console.error(e);
	}
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
 * 成员权限默认为最低权限,memberInfo应该至少拥有这样的属性：{user_id:1}
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
	var queryDoc = {id:groupId},
		updateDoc = {'$pull':{members:{'user.provider':memberInfo.provider,'user.user_id':memberInfo.user_id}}};
	return updateMemberWithCheck(OPERATE.Manage,queryDoc,groupId, provider,userId,updateDoc);
}

/**
 * 离开团队
 * @param groupId 团队Id
 * @param provider 用户的提供者
 * @param userId 用户在提供者处的ID
 * @returns {*}
 */
function leaveGroup(groupId,provider,userId){
	var queryDoc = {id:groupId},
		updateDoc = {'$pull':{members:{'user.provider':provider,'user.user_id':userId}}};
	return updateMember(queryDoc, updateDoc);
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
 * @param groupId 团ID
 * @param provider 用户的提供者
 * @param userId 用户在提供者处的id
 * @param memberInfos 成员的余额,memberInfos的信息应该是这样：[{provider:'a',user_id:1,money:10},{provider:'b',user_id:2,money:100}];
 * @param balance 组里面所剩余额
 * @returns {*}
 */
function updateMoney(groupId,provider,userId,memberInfos,balance){
	var deferred = when.defer(),
		updateMoneyPromise = deferred.promise;
		console.info('updateMoney begin checkGrant')
	checkGrant(OPERATE.Count,groupId,provider,userId).then(function(){
		var promises = [];
		for(var i = 0, len = memberInfos.length; i < len; i++){
			var memberInfo = memberInfos[i];
			var queryDoc = {id:groupId,'members.user.provider':memberInfo.provider,'members.user.user_id':memberInfo.user_id};
			var updateDoc;
			if(balance || balance === 0){
				updateDoc = {'$set':{'members.$.money':memberInfo.money,'balance':balance}};
			}else{
				updateDoc = {'$set':{'members.$.money':memberInfo.money}};
			}
			var promise = updateMember(queryDoc, updateDoc);
			promises.push(promise);
		}
		console.info('updateMoney checkGrant end')
		when.all(promises).then(function(){
			console.info('updateMoney end')
			deferred.resolve();
		}).catch(function(){
			deferred.reject();
			console.log('update Money failed.date:'+new Date().getTime());
		});
	}).catch(function(){
		console.log('updateMoney begin checkGrant failed.date:'+new Date().getTime());
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
	var queryDoc = {id:groupId,'members.user.provider':memberInfo.provider,'members.user.user_id':memberInfo.user_id},
		updateDoc = {'$set':{'members.$.grant':grant}};
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
		console.log('updateMember begin update');
		return DbUtil.updateDoc(evt.db,evt.col,queryDoc,updateDoc);
	}).done(function(evt){
		console.log('updateMember update end');
		deferred.resolve(evt.doc);
		evt.db.close;
	});
	return updateMemberPromise;
}

function findGroup(query){
	var deferred = when.defer(),
		findGroupPromise = deferred.promise;
	DbUtil.connect().then(function(db){
		return DbUtil.getCollection(db, COL);
	}).catch(function(evt){
		deferred.reject(evt);
		return findGroupPromise;
	}).then(function(evt){
		if(!evt){
			return;
		}
		return DbUtil.queryDoc(evt.db,evt.col,query,function(evt){
			deferred.reject(evt);
		});
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
		groupInfo.createtime = new Date().getTime();
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
			var queryGrant = {'members.grant': OPERATE_GRANT_MAP[operate][grant]};
			grants.push(queryGrant);
		}
		var filter = {id:groupId,'members.user.provider':provider,'members.user.user_id':userId,$or:grants};
		return DbUtil.queryDoc(evt.db,evt.col,filter,function(evt){
			deferred.reject(evt);
		});
	}).done(function(evt){
		if(!evt){
			return;
		}
		if(evt.docs.length > 0 ){
			deferred.resolve(evt.docs);
		}else{
			deferred.reject('checkGrant Failed');
		}
		evt.db.close();
	});
	return checkGrantPromise;
}

module.exports = {
	addGroup: addGroup,
	findGroupByMember: findGroupByMember,
	existMember: existMember,
	findGroupByCreator: findGroupByCreator,
	findGroupByUser: findGroupByUser,
	findGroupById: findGroupById,
	deleteGroup: deleteGroup,
	addMember:addMember,
	addMemberByInvite:addMemberByInvite,
	deleteMember:deleteMember,
	leaveGroup:leaveGroup,
	updateMoney: updateMoney,
	authorize: authorizeToBeViceCapTain,
	deauthorize: deauthorizeViceCapTain
};