var client = require("mongodb").MongoClient;
var databaseinfo = require("../../package.json").database;
var db_host=databaseinfo.db_host,    
    db_port=databaseinfo.db_port,
    db_name=databaseinfo.db_name,
    username=databaseinfo.username,
    password=databaseinfo.password;
var authenticate=username&&password&&(username+":"+password+"@")||"";
var url = "mongodb://"+authenticate+db_host+":"+db_port+"/"+db_name;
var colName = "visiterecord";
var visitorType = {
    "ANONYM": "anonym",
    "CAPTAIN": "captain"
};

var log4js = require('log4js');
var _logger = log4js.getLogger();

module.exports.visitorType = visitorType;
module.exports.record = function(name, type, succeed, failed) {
    client.connect(url, function(err, db) {
        if (err) {
            db&&db.close();
            failed && failed.call(this, err);
            return;
        }
        var that = this;
        db.collection(colName, function(err, col) {
            if (err) {
                db && db.close();
                failed && failed.call(that, err);
                return;
            }
            if (type === visitorType.ANONYM) {
                name = type;
            } else if (type === visitorType.CAPTAIN) {} else {
                return;
            }
            try {
                col.findOne({
                        name: name,
                        type: type
                    }, {
                        fields: {
                            count: 1
                        }
                    },
                    function(err, result) {
                        if (err || !result) {
                            col.insert({
                                name: name,
                                count: 1,
                                visitetime: new Date().getTime()
                            }, function(err, result) {
                                if (err) {
                                    db && db.close();
                                    failed && failed.call(that, err);
                                    return;
                                }
                                db && db.close();
                                succeed && succeed.call(that, result);
                                return;
                            });
                            return;
                        }
                        var count = Number(result.count);
                        if (isNaN(count)) {
                            db && db.close();
                            return;
                        }
                        col.update({
                            name: name
                        }, {
                            $set: {
                                count: ++count
                            }
                        }, function(err, result) {
                            if (err) {
                                db && db.close();
                                failed && failed.call(that, err);
                                return;
                            }
                            db && db.close();
                            succeed && succeed.call(that, result);
                        });
                    });
            } catch (e) {
                _logger.fatal(e.message);
            }
        });
    });
};