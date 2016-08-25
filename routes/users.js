var express = require('express');
var router = express.Router();
var Group = require('./databases/group');
var Message = require('./databases/message');
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
        res.send({result:'failure',operate:'unlogin'});
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
        res.send({result:'failure',operate:'unlogin'});
    }
});

router.get('/groups',function(req, res, next) {
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
        res.send({result:'failure',operate:'unlogin'});
    }
});

router.get('/group/:id',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var groupId = req.params.id;
        Group.findGroupById(groupId, provider,user_id).then(function(groups){
            res.send({result:groups,operate:'findgroupbyid'});
        }).catch(function(){
            res.send({result:'failure',operate:'findgroupbyid'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
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
        res.send({result:'failure',operate:'unlogin'});
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
        res.send({result:'failure',operate:'unlogin'});
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
        res.send({result:'failure',operate:'unlogin'});
    }
});

//授权操作
router.put('/authorize',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfo = reqBody.member;
        Group.authorize(groupId,provider,user_id,memberInfo).then(function(){
            res.send({result:'success',operate:'authorize'});
        }).catch(function(){
            res.send({result:'failure',operate:'authorize'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

//取消授权操作
router.put('/deauthorize',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfo = reqBody.member;
        Group.deauthorize(groupId,provider,user_id,memberInfo).then(function(){
            res.send({result:'success',operate:'deauthorize'});
        }).catch(function(){
            res.send({result:'failure',operate:'deauthorize'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

//邀请用户加入团
router.post('/invite',function(req, res, next) {
    var user = req.user;
    if(user) {
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            userId = reqBody.userId;
        Message.createMessage({type:'invite',groupid:groupId,userid:userId,readed:false}).then(function(){
            res.send({result:'success',operate:'invite'});
        }).catch(function(){
            res.send({result:'failure',operate:'invite'});
        })
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

//同意邀请
router.post('message/:id/reply/:type',function(req, res, next){
    var user = req.user;
    if(user) {
         var messageId = req.params.id;
         var replyType = req.params.type;
        if(replyType === 'agree'){
            Message.findMessageById(messageId).then(function(){
                Message.updateMessageState(messageId,true).then(function(){
                    res.send({result:'success',operate:'reply agree'});
                }).catch(function(){
                    res.send({result:'failure',operate:'reply agree'});
                });
            }).catch(function(){
                res.send({result:'failure',operate:'reply agree'});
            })
        }else{
            Message.updateMessageState(messageId,true).then(function(){
                res.send({result:'success',operate:'reply reject'});
            }).catch(function(){
                res.send({result:'failure',operate:'reply reject'});
            });
        }
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

module.exports = router;
