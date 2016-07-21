var express = require('express');
var router = express.Router();
var Group = require('./databases/group');
var Verify = require('./util/verify');

router.post('/creategroup', function (req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        if(Verify.verfyGroup(reqBody)){
            var gName = reqBody.gname,
                description = reqBody.description,
                creator = {provider:provider,user_id:user_id},
                groupInfo = {
                    gname:gName,
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

router.post('/findgroup',function(req, res, next) {
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

router.put('/updategroup',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId;
        Group.checkGrant(Group.OPERATE.Manage,groupId,provider,user_id).then(function(){
            Group.deleteGroup(groupId).then(function(){
                res.send({result:'success',operate:'dropgroup'});
            }).catch(function(){
                res.send({result:'failure',operate:'dropgroup'});
            });
        }).catch(function(){
            res.send({result:'failure',operate:'dropgroup',message:''});
        });
    }else{
        res.send({result:'failure',operate:'dropgroup'});
    }
});

router.get('/tt', function(req, res, next) {
    res.set({ tt: 'AA登录' })
});

module.exports = router;
