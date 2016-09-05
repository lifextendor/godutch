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
    updateDoc.$currentDate = {lastModified: true};
    collection.updateOne(query, updateDoc, function(err, doc) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,doc:doc,type:'update'});
    });
    return deferred.promise;
}

function deleteDocument(db,collection, query) {
    var deferred = when.defer();
    collection.remove(query, function(err, doc) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,doc:doc,type:'delete'});
    });
    return deferred.promise;
}

function queryDocument(db,collection, query) {
    var deferred = when.defer();
    collection.find(query).toArray(function(err, docs) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
        }
        deferred.resolve({db:db,docs:docs,type:'query'});
    });
    return deferred.promise;
}

function queryOneDocument(db,collection, query, options) {
    var deferred = when.defer();
    collection.findOne(query, options, function(err, doc) {
        if (err) {
            deferred.reject({db:db,err:err});
            return deferred.promise;
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


