var DbUtil = require('./dbutil');
var when = require('when');
var COL = 'bills';

/**
 * 创建帐单
 * @param bill 帐单信息，比如:{id:1,groupid:1,members:[0,1],money:100,datetime:122221313}
 * @returns {*}
 */
function createBill(bill){
    var deferred = when.defer(),
        createBillPromise = deferred.promise;
    var getBillColPromise = DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(evt){
        var createBillColPromise = createBillCollection(evt.db);
        insertBill(createBillColPromise,deferred,bill);
    });
    insertBill(getBillColPromise,deferred, message);
    return createBillPromise;
}

/**
 * 通过用户及时间来查询帐单
 * @param provider 用户的提供者
 * @param userId 用户在提供者处的ID
 * @param from  开始时间
 * @param to  结束时间
 * @returns {*}
 */
function findBillByDateTime(provider,userId,from,to){
    var deferred = when.defer(),
        findBillPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        var queryDoc = {'members.$.provider':provider,'members.$.user_id':userId,'datetime':{'$gt':from,'$lt':to}};
        return DbUtil.queryDoc(evt.db,evt.col,queryDoc);
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findBillPromise;
}

/**
 * 通过帐单ID来查询帐单
 * @param billId 帐单ID
 * @returns {*}
 */
function findBillById(billId){
    var deferred = when.defer(),
        findBillByIdPromise = deferred.promise;
    DbUtil.connect().then(function(db){
        return DbUtil.getCollection(db, COL);
    }).catch(function(err){
        deferred.reject(err);
    }).then(function(evt){
        if(!evt){
            return;
        }
        return DbUtil.queryDoc(evt.db,evt.col,{id:billId});
    }).done(function(evt){
        if(!evt){
            return;
        }
        deferred.resolve(evt.doc);
        evt.db.close();
    });
    return findBillByIdPromise;
}

/********************* 内部函数 *************************/
function createBillCollection(db){
    var deferred = when.defer();
    DbUtil.createCollection(db,COL).then(function(evt){
        deferred.resolve({db:evt.db,col:evt.col});
    }).catch(function(evt){
        deferred.rejected({db:evt.db,err:evt.err});
    });
    return deferred.promise;
}
function insertBill(promise, deferred,message){
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
    createBill: createBill,
    findBillByDateTime: findBillByDateTime,
    findBillById: findBillById
};