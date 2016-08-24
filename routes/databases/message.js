var DbUtil = require('./dbutil');
var when = require('when');
var COL = 'messages';

function createMessage(message){
    var deferred = when.defer(),
        createMessagePromise = deferred.promise;
    var getMessageColPromise = DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(evt){
        var createMessageColPromise = createMessageCollection(evt.db);
        insertMessage(createMessageColPromise,deferred,message);
    });
    insertMessage(getMessageColPromise,deferred, message);
    return createMessagePromise;
}

function findMessage(provider,userId,isReaded){
    var deferred = when.defer(),
        findMessagePromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.queryDoc(evt.db,evt.col,{provider:provider,user_id:userId,readed:isReaded});
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findMessagePromise;
}

function updateMessageState(messageId,isReaded){
    var deferred = when.defer(),
        updateMessageStatePromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(evt){
        deferred.reject(evt);
    }).then(function(evt){
        var queryDoc = {id:messageId},
            updateDoc = {readed:isReaded};
        return DbUtil.updateDoc(evt.db,evt.col,queryDoc,updateDoc);
    }).done(function(evt){
        deferred.resolve(evt.doc);
        evt.db.close;
    }).catch(function(evt){
        deferred.reject(evt);
        evt.db.close;
    });
    return updateMessageStatePromise;
}

/********************* 内部函数 *************************/
function createMessageCollection(db){
    var deferred = when.defer();
    DbUtil.createCollection(db,COL).then(function(evt){
        deferred.resolve({db:evt.db,col:evt.col});
    }).catch(function(evt){
        deferred.rejected({db:evt.db,err:evt.err});
    });
    return deferred.promise;
}
function insertMessage(promise, deferred,message){
    promise.then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.insertDoc(evt.db,evt.col,[message]);
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
    createMessage: createMessage,
    findMessage: findMessage,
    updateMessageState: updateMessageState
};