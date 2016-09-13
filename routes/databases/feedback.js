var DbUtil = require('./dbutil');
var when = require('when');
var COL = 'feedback';

/**
 * 创建反馈信息
 * @param feedback
 * @returns {*}
 */
function createFeedback(feedback){
    var deferred = when.defer(),
        createFeedbackPromise = deferred.promise;
    var getFeedbackColPromise = DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(evt){
        var createFeedbackColPromise = createFeedbackCollection(evt.db);
        insertFeedback(createFeedbackColPromise,deferred,feedback);
    });
    insertFeedback(getFeedbackColPromise,deferred, feedback);
    return createFeedbackPromise;
}

/**
 * 根据时间来查询反馈信息
 * @param from 起始时间
 * @param to 结束时间
 * @param isReaded 是否已读
 * @returns {*}
 */
function findFeedbackByDateTime(from,to,isReaded){
    var deferred = when.defer(),
        findFeedbackPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        var queryDoc = {'datetime':{'$gt':from,'$lt':to},readed:isReaded};
        return DbUtil.queryDoc(evt.db,evt.col,queryDoc,function(evt){
            deferred.reject(evt);
        });
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findFeedbackPromise;
}

/**
 * 根据是否已读来查询反馈信息
 * @param isReaded
 * @returns {*}
 */
function findFeedback(isReaded){
    var deferred = when.defer(),
        findFeedbackPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.queryDoc(evt.db,evt.col,{readed:isReaded},function(evt){
            deferred.reject(evt);
        });
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findFeedbackPromise;
}

/**
 * 根据反馈信息Id查询信息的详细信息
 * @param feedbackId 信息id
 * @param isReaded readed状态，默认为false，查询后'readed’状态改为true
 * @returns {*}
 */
function findFeedbackById(feedbackId,isReaded){
    var deferred = when.defer(),
        findFeedbackByIdPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        DbUtil.queryDoc(evt.db,evt.col,{id:feedbackId,readed:isReaded},function(evt){
            deferred.reject(evt);
        }).then(function(){
            updateFeedbackState(feedbackId,true).then(function(evt){
                if(!evt){
                    return;
                }
                deferred.resolve(evt.doc);
                evt.db.close();
            }).catch(function(){
                deferred.reject(err);
                evt.db.close();
            });
        }).catch(function(){
            deferred.reject(err);
            evt.db.close();
        });
    });
    return findFeedbackByIdPromise;
}


/********************* 内部函数 *************************/

function updateFeedbackState(messageId,isReaded){
    var deferred = when.defer(),
        updateFeedbackStatePromise = deferred.promise;
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
    return updateFeedbackStatePromise;
}
function createFeedbackCollection(db){
    var deferred = when.defer();
    DbUtil.createCollection(db,COL).then(function(evt){
        deferred.resolve({db:evt.db,col:evt.col});
    }).catch(function(evt){
        deferred.rejected({db:evt.db,err:evt.err});
    });
    return deferred.promise;
}
function insertFeedback(promise, deferred,feedback){
    promise.then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.insertDoc(evt.db,evt.col,[feedback]);
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
    createFeedback: createFeedback,
    findFeedback: findFeedback,
    findFeedbackById: findFeedbackById,
    findFeedbackByDateTime: findFeedbackByDateTime
};