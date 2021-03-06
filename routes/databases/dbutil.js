var client = require("mongodb").MongoClient;
var when = require('when');
var databaseinfo = require("../../package").database;
var db_host = databaseinfo.db_host,
    db_port = databaseinfo.db_port,
    db_name = databaseinfo.db_name,
    username = databaseinfo.username,
    password = databaseinfo.password;
var authenticate = username && password && (username + ":" + password + "@") || "";
var url = "mongodb://" + authenticate + db_host + ":" + db_port + "/" + db_name;

/**
 * 使用when.js的Promise机制实现一个mongodbHelper,以及简化对数据库的异步操作
 */


function connecting2DB(){
    var deferred = when.defer();
    client.connect(url, function(err, db) {
        if(err){
            deferred.reject(err);
            return deferred.promise;
        }
        deferred.resolve(db);
    });
    return deferred.promise;
}


function createCollection(db,cName){
    var deferred = when.defer();
    db.createCollection(cName, {
        "strict": true
    }, function(err, col) {
        if(err || !col){
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,col:col});
    });
    return deferred.promise;
}

function dropCollection(db,cName){
    var deferred = when.defer();
    db.dropCollection(cName, function(err, col) {
        if(err){
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,col:col});
    });
    return deferred.promise;
}

function getCollection(db,cName){
    var deferred = when.defer();
    db.collection(cName,{strict:true}, function(err, col){
        if(err || !col){
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,col:col});
    });
    return deferred.promise;
}

function insertDocument(db,collection, docs) {
    var deferred = when.defer();
    for(var i = 0, len = docs.length; i<len;i++){
        var doc = docs[i];
        doc.lastModifyTime = new Date().getTime();
    }
    collection.insertMany(docs, function(err, doc) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,doc:doc,type:'insert'});
    });
    return deferred.promise;
}

function updateDocument(db,collection, query, updateDoc) {
    var deferred = when.defer();
    updateDoc.$set.lastModifyTime = new Date().getTime();
    console.log('updateDoc begin');
    collection.updateOne(query, updateDoc, function(err, doc) {
        if (err) {
            console.log('updateDoc err');
            console.log(err);
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        console.log('updateDoc end');
        console.log(doc);
        deferred.resolve({db:db,doc:doc,type:'update'});
    });
    return deferred.promise;
}

function deleteDocument(db,collection, query, options) {
    var deferred = when.defer();
    collection.deleteOne(query, options,function(err, doc) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,doc:doc,type:'delete'});
    });
    return deferred.promise;
}

function queryDocument(db,collection, query,failure) {
    var deferred = when.defer();
    try{
        collection.find(query).toArray(function(err, docs) {
            if (err) {
               failure && failure({db:db,err:err});
            }
            deferred.resolve({db:db,docs:docs,type:'query'});
        });
    }catch(e){
        console.error(e);
    }
    return deferred.promise;
}

function queryOneDocument(db,collection, query,failure) {
    var deferred = when.defer();
    collection.findOne(query, function(err, doc) {
        if (err) {
            failure && failure({db:db,err:err});
        }
        deferred.resolve({db:db,doc:doc,type:'query'});
    });
    return deferred.promise;
}

module.exports = {
    connect:connecting2DB,
    createCollection:createCollection,
    dropCollection:dropCollection,
    getCollection:getCollection,
    insertDoc:insertDocument,
    updateDoc:updateDocument,
    deleteDoc:deleteDocument,
    queryDoc:queryDocument,
    queryOneDoc:queryOneDocument
};


