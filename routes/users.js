var express = require('express');
var router = express.Router();
var Group = require('./databases/group');
var Verify = require('./util/verify');

router.put('/creategroup', function (req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var type = req.type;
        if(Verify.verfyGroup(reqBody)){
            var gName = reqBody.gname,
                description = reqBody.description,
                creator = {provider:provider,user_id:user_id},
                groupInfo = {
                    gname:gName,
                    type: Verify.getGroupType(type),
                    description: description,
                    creator:creator
                };
            Group.addGroup(groupInfo).then(function(){
                res.send({result:'success',operate:'creategroup'});
            }).catch(function(){
                res.send({result:'failure',operate:'creategroup'});
            });
        }else{
            res.send({result:'failure',operate:'creategroup'});
        }
    }else{
        res.send({result:'failure',operate:'creategroup'});
    }
});

router.post('/dropgroup', function (req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId;
        Group.deleteGroup(groupId,provider,user_id).then(function(){
            res.send({result:'success',operate:'dropgroup'});
        }).catch(function(){
            res.send({result:'failure',operate:'dropgroup'});
        });
    }else{
        res.send({result:'failure',operate:'dropgroup'});
    }
});

router.get('/findgroup',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        Group.findGroupByUser(provider,user_id).then(function(groups){
            res.send({result:groups,operate:'findgroup'});
        }).catch(function(){
            res.send({result:'failure',operate:'findgroup'});
        });
    }else{
        res.send({result:'failure',operate:'findgroup'});
    }
});

router.put('/addmember',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfo = reqBody.member,
            money = reqBody.money || 0;
        Group.addMember(groupId,provider,user_id,memberInfo,money).then(function(){
            res.send({result:'success',operate:'addmember'});
        }).catch(function(){
            res.send({result:'failure',operate:'addmember'});
        });
    }else{
        res.send({result:'failure',operate:'addmember'});
    }
});

router.post('/deletemember',function(req, res, next) {
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfo = reqBody.member;
        Group.deleteMember(groupId,provider,user_id,memberInfo).then(function(){
            res.send({result:'success',operate:'deletemember'});
        }).catch(function(){
            res.send({result:'failure',operate:'deletemember'});
        });
    }else{
        res.send({result:'failure',operate:'deletemember'});
    }
});

router.put('/updatemoney',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfos = reqBody.memberInfos;
        Group.updateMoney(groupId,provider,user_id,memberInfos).then(function(){
            res.send({result:'success',operate:'updatemoney'});
        }).catch(function(){
            res.send({result:'failure',operate:'updatemoney'});
        });
    }else{
        res.send({result:'failure',operate:'updatemoney'});
    }
});

module.exports = router;
