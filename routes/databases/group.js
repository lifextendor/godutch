var client = require("mongodb").MongoClient;
var logger = require("../databases/log");
var databaseinfo = require("../../package").database;
var db_host = databaseinfo.db_host,
	db_port = databaseinfo.db_port,
	db_name = databaseinfo.db_name,
	username = databaseinfo.username,
	password = databaseinfo.password;
var authenticate = username && password && (username + ":" + password + "@") || "";
var url = "mongodb://" + authenticate + db_host + ":" + db_port + "/" + db_name;


var log4js = require('log4js');
var _logger = log4js.getLogger();
module.exports.createGroup = function(name, word, brief, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			failed && failed.call(that, err);
			db && db.close();
			return;
		}
		db.createCollection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, err);
				return;
			}
			insertDoc(col, [{
				type: "captain",
				word: word,
				brief: brief,
				createtime: new Date().getTime()
			}], function(result) {
				db && db.close();
				logger.creategrouplog(name, function() {
					succeed && succeed.call(that, result);
				}, function() {
					_logger.error("log create group " + name + " failed!");
					failed && failed.call(that, err);
				});
			}, function(err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, err);
			}, that);
		});
	});
};
module.exports.dismissGroup = function(name, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			failed && failed.call(that, err);
			db && db.close();
			return;
		}
		db.dropCollection(name, function(err, col) {
			if (err) {
				_logger.error(err);
				db.close();
				failed && failed.call(that, err);
				return;
			}
			db && db.close();
			logger.dismissgrouplog(name, function() {
				succeed && succeed.call(that, result);
			}, function() {
				_logger.error("log dissmiss group " + name + " failed!");
				failed && failed.call(that, err);
			});
		});
	});
};
module.exports.checkUniqGName = function(name, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			db && db.close();
			failed && failed.call(that, err);
			return;
		}
		db.collection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				succeed && succeed.call(that, col);
				return;
			}
			db && db.close();
			failed && failed.call(that, err);
		});
	});
};
module.exports.checkCaptain = function(name, word, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			db && db.close();
			failed && failed.call(that, err);
			_logger.error(err);
			return;
		}
		db.collection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				failed && failed.call(that, "group not exit");
				return;
			}
			var filter = {
				type: "captain",
				word: word
			};
			findDoc(col, filter, {
				fields: {
					brief: 1
				}
			}, function(result) {
				db && db.close();
				succeed && succeed.call(that, "succeed");
			}, function(err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, "wrong word");
			}, that);
		});
	});
};
module.exports.addMember = function(name, memberInfo, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			db && db.close();
			failed && failed.call(that, err);
			return;
		}
		db.collection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, err);
				return;
			}
			if (Array.isArray(memberInfo)) {
				db && db.close();
				failed && failed.call(that, "memberInfo cannot be a Array");
			}
			memberInfo.money = memberInfo.money || 0;
			memberInfo.name = memberInfo.name;
			memberInfo.type = "member";
			var datetime = new Date().getTime();
			memberInfo.lastRechargeTime = datetime;
			memberInfo.lastConsumeTime = -1;
			insertDoc(col, [memberInfo], function(result) {
				db && db.close();
				succeed && succeed.call(that, result);
			}, function(err) {
				_logger.error(err);
				db && db.close();
				err.mName = memberInfo.name;
				failed && failed.call(that, err);
			}, that);
		});
	});
};
module.exports.removeMember = function(gName, mName, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			db && db.close();
			failed && failed.call(that, err);
			return;
		}
		db.collection(gName, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, err);
				return;
			}
			var query = {
				type: "member",
				name: mName
			};
			removeDoc(col, query, function(result) {
				db && db.close();
				succeed && succeed.call(that, result);
			}, function(err) {
				_logger.error(err);
				db && db.close();
				err.mName = mName;
				failed && failed.call(that, err);
			}, that);
		});
	});
};
module.exports.checkUniqMName = function(gName, mName, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			db && db.close();
			failed && failed.call(that, err);
			return;
		}
		db.collection(gName, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, {
					message: gName + " is not exit!"
				});
			} else {
				findDoc(col, {
					"type": "member",
					"name": mName
				}, {
					fields: {
						name: 1
					}
				}, function() {
					db && db.close();
					failed && failed.call(that, {
						message: mName + " is already exit in group:" + gName
					});
				}, function(err) {
					_logger.error(err);
					db && db.close();
					succeed && succeed.call(that);
				}, that);
				return;
			}
		});
	});
};
module.exports.updateMoney = function(name, isConsume, memberInfo, succeed, failed) {
	if (isNaN(memberInfo.money)) {
		var err="no money info!"
		failed && failed.call(this, {
			error: err
		});
		_logger.error(err);
		return;
	}
	var that = this;
	_logger.fatal('updating money!');
	client.connect(url, function(err, db) {
		if (err) {
			db && db.close();
			_logger.error(err);
			failed && failed.call(that, err);
			return;
		}
		db.collection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				db && db.close();
				_logger.error(err);
				failed && failed.call(that, err);
				return;
			}
			findDoc(col, {
				"type": "member",
				"name": memberInfo.name
			}, {
				fields: {
					name: 1,
					money: 1
				}
			}, function(result) {
				_logger.fatal("update money find document success!");
				var money = Number(memberInfo.money);
				var datetime = memberInfo.datetime || new Date().getTime();
				//避免使用+号以防止字符串连�?
				result.money -= (-money);
				if (isConsume) {
					result.lastConsumeTime = datetime;
				} else {
					result.lastRechargeTime = datetime;
				}
				delete result._id;
				updateDoc(col, {
					"type": "member",
					"name": result.name
				}, result, function(result) {
					db && db.close();
					_logger.fatal("update money find document {name:"+name+"} and update success!");
					succeed && succeed.call(that, result);
				}, function(err) {
					db && db.close();					
					err.mName = memberInfo.name;
					_logger.error(err);
					failed && failed.call(that, err);
				}, that);
			}, function(err) {
				db && db.close();
				err.mName = memberInfo.name;
				_logger.error(err);
				failed && failed.call(that, err);
			}, that);
		});
	});
};
module.exports.queryMemberInfo = function(name, succeed, failed) {
	var that = this;
	client.connect(url, function(err, db) {
		if (err) {
			_logger.error(err);
			db && db.close();
			failed && failed.call(that, err);
			return;
		}
		db.collection(name, {
			"strict": true
		}, function(err, col) {
			if (err) {
				_logger.error(err);
				db && db.close();
				failed && failed.call(that, err);
				return;
			}
			col.find({
				"type": "member"
			}).toArray(function(err, docs) {
				if (err) {
					_logger.error("find membersInfo failed!");
					db && db.close();
					failed && failed.call(that, err);
				} else {
					_logger.fatal("find membersInfo!");
					db && db.close();
					succeed && succeed.call(that, docs);
				}
			});
		});
	});
};

function insertDoc(collection, docs, succeed, failed, scope) {
	try {
		collection.insertMany(docs, function(err, result) {
			if (err) {
				_logger.error("insert doc falied!");
				failed && failed.call(scope, err);
			} else {
				_logger.fatal("insert doc!");
				succeed && succeed.call(scope, result);
			}
		});
	} catch (e) {
		_logger.error(e.message);
		failed && failed.call(scope, e.message);
	}
}

function updateDoc(collection, query, setDoc, succeed, failed, scope) {
	try {
		collection.updateOne(query, {
			$set: setDoc
		}, function(err, result) {
			if (err) {
				_logger.error("update doc falied!");
				failed && failed.call(scope, err);
			} else {
				_logger.fatal("update doc!");
				succeed && succeed.call(scope, result);
			}
		});
	} catch (e) {
		_logger.error(e.message);
		failed && failed.call(scope, e.message);
	}
}

function removeDoc(collection, query, succeed, failed, scope) {
	try {
		collection.remove(query, function(err, result) {
			if (err) {
				_logger.error("remove doc falied!");
				failed && failed.call(scope, err);
			} else {
				_logger.fatal("remove doc!");
				succeed && succeed.call(scope, result);
			}
		});
	} catch (e) {
		_logger.error(e.message);
		failed && failed.call(scope, e.message);
	}
}

function findDoc(collection, query, options, succeed, failed, scope) {
	try {
		collection.findOne(query, options, function(err, result) {
			if (err || !result) {
				_logger.error("find doc falied!");
				failed && failed.call(scope, err);
			} else if (result) {
				_logger.fatal("find doc!");
				succeed && succeed.call(scope, result);
			}
		});
	} catch (e) {
		_logger.error(e.message);
		failed && failed.call(scope, e.message);
	}
}

function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}