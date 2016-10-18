var DbUtil = require('./dbutil');
var when = require('when');
var COL = 'users';

function addUser(userInfo){
    var deferred = when.defer(),
        addUserPromise = deferred.promise;
    var getUserColPromise = DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(evt){
        var createUserColPromise = createUserCollection(evt.db);
        insertUser(createUserColPromise,deferred,userInfo);
    });
    insertUser(getUserColPromise,deferred, userInfo);
    return addUserPromise;
}

function findUser(provider,userId){
    var deferred = when.defer(),
        findUserPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.queryOneDoc(evt.db,evt.col,{provider:provider,user_id:userId});
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findUserPromise;
}

function findUsers(query){
    var deferred = when.defer(),
        findUserByNamePromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.queryDoc(evt.db,evt.col,{'$or':[{user_name:query},{user_id:query}]});
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.docs);
        evt.db.close();
    });
    return findUserByNamePromise;
}

function deleteUser(provider,userId){
    var deferred = when.defer(),
        deleteUserPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.deleteDoc(evt.db,evt.col,{provider:provider,user_id:userId});
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return deleteUserPromise;
}

function createUserCollection(db){
    var deferred = when.defer();
    DbUtil.createCollection(db,COL).then(function(evt){
        deferred.resolve({db:evt.db,col:evt.col});
    }).catch(function(evt){
        deferred.rejected({db:evt.db,err:evt.err});
    });
    return deferred.promise;
}

function insertUser(promise, deferred,userInfo){
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

module.exports = {
    addUser: addUser,
    findUser: findUser,
    findUsers: findUsers,
    deleteUser: deleteUser
};