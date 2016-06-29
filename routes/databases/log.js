var client = require("mongodb").MongoClient;
var databaseinfo = require("../../package.json").database;
var db_host=databaseinfo.db_host,    
    db_port=databaseinfo.db_port,
    db_name=databaseinfo.db_name,
    username=databaseinfo.username,
    password=databaseinfo.password;
var authenticate=username&&password&&(username+":"+password+"@")||"";
var url = "mongodb://"+authenticate+db_host+":"+db_port+"/"+db_name;
var colName = {
    "ACCOUNTLOG": "accountlog",
    "GROUPLOG": "grouplog"
};
var logType = {
    "CONSUME": "consume",
    "RECHARGE": "recharge",
    "CREATEGROUP": "creategroup",
    "DISMISSGROUP": "dismissgroup"
};

var log4js = require('log4js');
var _logger = log4js.getLogger();

/**
    consumeInfo={datetime:1444713276688,money:100,members:[{name:"mName0",num:2},{name:"mName1",num:1},{name:"mName2",num:1}]}
*/
module.exports.consumelog = function(name, consumeInfo, succeed, failed) {
    accountlog(logType.CONSUME, name, consumeInfo, succeed, failed);
};
/**
    rehcargeInfo={datetime:1444713276688,money:[100,200],members:["mName0","mName1"]};
*/
module.exports.rechargelog = function(name, rechargeInfo, succeed, failed) {
    accountlog(logType.RECHARGE, name, rechargeInfo, succeed, failed);
};

module.exports.creategrouplog = function(groupname, succeed, failed) {
    grouplog(logType.CREATEGROUP, groupname, succeed, failed);
};

module.exports.dismissgrouplog = function(groupname, succeed, failed) {
    grouplog(logType.DISMISSGROUP, groupname, succeed, failed);
};

function accountlog(type, name, info, succeed, failed) {
    var that = this;
    var datetime=info.datetime||new Date().getTime(),
        members=info.members,
        money=info.money;
    client.connect(url, function(err, db) {
        if (err) {
            _logger.error(err);
            failed && failed.call(this, err);
            db && db.close();
            return;
        }
        db.collection(colName.ACCOUNTLOG, function(err, col) {
            if (err) {
                _logger.error(err);
                db && db.close();
                failed && failed.call(that, err);
                return;
            }
            var doc = {
                groupname:name,
                logtime: new Date().getTime()
            };
            if (type === logType.CONSUME) {
                doc.type = type;
                doc.consumetime = datetime;
                var consumeMembers=[];
                var i=0,len=0;
                for (i =0,len= members.length; i <len; i++) {
                    consumeMembers.push(members[i].name + "*" + members[i].num);
                }
                doc.consumeinfo = consumeMembers.join();
                doc.cost = money;
            } else if (type === logType.RECHARGE) {
                doc.type = type;
                doc.rechargetime=datetime;
                for (i =0,len= members.length; i <len; i++) {
                    members[i] += ":" + money[i];
                }
                doc.rechargeinfo = members.join();
            } else {
                db && db.close();
                failed && failed.call(that, err);
                return;
            }
            try {
                col.insertOne(doc, function(err, result) {
                    if (err) {
                        _logger.error(err);
                        db && db.close();
                        failed && failed.call(that, err);
                        return;
                    }
                    db && db.close();
                    succeed && succeed.call(that, result);
                });
            } catch (e) {
                db && db.close();
                console.log(e.message);
            }
        });
    });
}

function grouplog(type, groupname, succeed, failed) {
    var that = this;
    client.connect(url, function(err, db) {
        if (err) {
            _logger.error(err);
            failed && failed.call(this, err);
            db.close();
            return;
        }
        db.collection(colName.GROUPLOG, function(err, col) {
            if (err) {
                _logger.error(err);
                db.close();
                failed && failed.call(that, err);
                return;
            }
            var doc = {
                groupname: groupname,
                logtime: new Date().getTime()
            };
            if (type === logType.CREATEGROUP) {
                doc.operate = type;
            } else if (type === logType.DISMISSGROUP) {
                doc.operate = type;
            } else {
                db.close();
                failed && failed.call(that, err);
                return;
            }
            try {
                col.insertOne(doc, function(err, result) {
                    if (err) {
                        _logger.error(err);
                        db.close();
                        failed && failed.call(that, err);
                        return;
                    }
                    db.close();
                    succeed && succeed.call(that, result);
                });
            } catch (e) {
                db.close();
                _logger.error(e.message);
            }
        });
    });
}