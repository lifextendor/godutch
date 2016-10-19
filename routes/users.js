var express = require('express');
var router = express.Router();
var Users = require('./databases/user');
var Group = require('./databases/group');
var Message = require('./databases/message');
var Bill = require('./databases/bill');
var Feedback = require('./databases/feedback');
var Util = require('./util');

/**
 * 查询用户
 * rest服务相对地址："/users/findusers/vein"，其中的vein为用户名或者用户id，http方法为:“get”
 */
router.get('/findusers/:userNameOrUserId', function (req, res, next) {
    var user = req.user;
    if(user){
        var userNameOrUserId = req.params.userNameOrUserId;
        try{
            Users.findUsers(userNameOrUserId).then(function(data){
                res.send({result:data,operate:'findUser'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'findUser'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 创建团队
 * rest服务相对地址："/users/creategroup"，http方法为:“PUT”
 * 请求体必须包含type信息，有以下值：normal（吃饭团账本）,bill（合租账本）,fund（活动经费）
 */
router.put('/creategroup', function (req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var user_name = user.name || user.nickname;
        var reqBody = req.body;
        var type = reqBody.type;
        if(Util.verifyGroup(reqBody)){
            try{
                var gName = reqBody.gname,
                    description = reqBody.description,
                    creator = {provider:provider,user_id:user_id,user_name:user_name},
                    groupInfo = {
                        id:Util.getGuid(),
                        gname:gName,
                        type: Util.getGroupType(type),
                        description: description,
                        creator:creator
                    };
                Group.addGroup(groupInfo).then(function(){
                    res.send({result:'success',operate:'creategroup'});
                }).catch(
                    function(){
                        res.status(500).send({result:'failure',operate:'creategroup'});
                    });
            }catch(e){
                console.error(e);
                res.status(500).send({result:'failure',operate:'creategroup'});
            }
        }else{
            res.status(400).send({result:'failure',operate:'creategroup'});
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 删除团队
 * rest服务相对地址："/users/group/1/dropgroup"，其中的1为团Id，http方法为:“POST”
 */
router.post('/group/:id/dropgroup', function (req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var groupId = req.params.id;
        try{
            Group.deleteGroup(groupId,provider,user_id).then(function(){
                res.send({result:'success',operate:'dropgroup'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'dropgroup'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 根据用户信息查询团队
 * rest服务相对地址："/users/groups"，http方法为:“GET”
 */
router.get('/groups',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        try{
            Group.findGroupByUser(provider,user_id).then(function(groups){
                res.send({result:groups,operate:'findgroup'});
            }).catch(function(){
                //res.sendStatus(500);
                res.status(500).send({result:'failure',operate:'findgroup'});
            });
        }catch(e){
            console.log(e);
            //res.sendStatus(500);
            res.status(500).send({result:'failure',operate:'findgroup'});
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 根据团队id来查询团队的详细信息
 * rest服务相对地址："/users/group/1",其中最后的参数为团队id，http方法为:“GET”
 */
router.get('/group/:id',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var groupId = req.params.id;
        try{
            Group.findGroupById(groupId, provider,user_id).then(function(groups){
                res.send({result:groups,operate:'findgroupbyid'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'findgroupbyid'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 删除用户
 * rest服务相对地址："/users/group/1/deletemember"，其中1为团Id，http方法为:“POST”
 * 请求参数如下：{provider:'qq',user_id:1}
 */
router.post('/group/:id/deletemember',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = req.params.id,
            memberInfo = {provider:reqBody.provider,user_id:reqBody.user_id};
        try{
            Group.deleteMember(groupId,provider,user_id,memberInfo).then(function(){
                res.send({result:'success',operate:'deletemember'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'deletemember'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 退出团
 * rest服务相对地址："/users/group/1/leave"，其中1为团Id，http方法为:“POST”
 * 请求参数包含groupId
 */
router.post('/group/:id/leave',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var groupId = req.params.id;
        try{
            Group.leaveGroup(groupId,provider,user_id).then(function(){
                res.send({result:'success',operate:'leave'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'leave'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 算账
 * rest服务相对地址："/users/group/1/updatemoney"，其中1为团Id，http方法为:“PUT”
 * 请求参数如下：{total:10,members:[{provider:'qq',user_id:1,money:10}],dataTime:121321313}
 */
router.put('/group/:id/updatemoney',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = req.params.id,
            totalMoney = reqBody.total,
            members = reqBody.members,
            dateTime = reqBody.dateTime;
        try{
            Group.updateMoney(groupId,provider,user_id,members).then(function(){
                Bill.createBill({
                    id:Util.getGuid(),
                    groupid:groupId,
                    datetime:dateTime,
                    members:members,
                    money:totalMoney
                }).then(function(){
                    res.send({result:'success',operate:'updatemoney'});
                }).catch(function(){
                    //res.sendStatus(500);
                    res.status(500).send({result:'failure',operate:'createBill'});
                });
            }).catch(function(){
                //res.sendStatus(500);
                res.status(500).send({result:'failure',operate:'updatemoney'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 授权为副团长
 * rest服务相对地址："/users/group/1/authorize"，其中1为团Id，http方法为:“PUT”
 * 请求参数，比如：{provider:'qq',user_id:1}
 */
router.put('/group/:id/authorize',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = req.params.id,
            memberInfo = {provider:reqBody.provider,user_id:reqBody.user_id};
        try{
            Group.authorize(groupId,provider,user_id,memberInfo).then(function(){
                res.send({result:'success',operate:'authorize'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'authorize'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 取消副团长的授权
 * rest服务相对地址："/users/group/1/deauthorize"，其中1为团Id，http方法为:“PUT”
 * 请求参数，比如：{provider:'qq',user_id:1}
 */
router.put('/group/:id/deauthorize',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = req.params.id,
            memberInfo = {provider:reqBody.provider,user_id:reqBody.user_id};
        try{
            Group.deauthorize(groupId,provider,user_id,memberInfo).then(function(){
                res.send({result:'success',operate:'deauthorize'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'deauthorize'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 邀请用户加入团
 * rest服务相对地址："/users/group/1/invite"，其中1为团Id，http方法为:“POST”
 * 请求参数，比如：{provider:'qq',user_id:1}
 */
router.post('/group/:id/invite',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = req.params.id,
            userInfo = {provider:reqBody.provider,user_id:reqBody.user_id},
            message = {
                id:Util.getGuid(),
                type:'invite',
                groupid:groupId,
                userinfo:userInfo,
                readed:false
            };
        try{
            Group.findGroupById(groupId,provider,user_id).then(function(){
                Message.createMessage(groupId,provider,user_id,message).then(function(){
                    res.send({result:'success',operate:'invite'});
                }).catch(function(e){
                    console.log(e);
                    res.status(500).send({result:'failure',operate:'invite'});
                });
            }).catch(function(e){
                console.log(e);
                res.status(500).send({result:'failure',operate:'invite'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 查询未读消息
 * rest服务相对地址："/users/messages"，http方法为:“GET”
 */
router.get('/messages',function(req, res, next){
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        try{
            Message.findMessage(provider,user_id,false).then(function(messages){
                res.send({result:messages,operate:'messages'});
            }).catch(function(){
                res.status(200).send({result:[],operate:'messages'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 查询消息的详细信息
 * rest服务相对地址："/users/message/1"，http方法为:“GET”
 * 请求参数中的1代表消息id
 */
router.get('/message/:id',function(req, res, next){
    var user = req.user;
    if(user) {
        var messageId = req.params.id;
        try{
            Message.findMessageById(messageId).then(function(){
                res.send({result:'success',operate:'get massege by id'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'get massege by id'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 回复邀请消息
 * rest服务相对地址："/users/message/1/reply/agree"，http方法为:“GET”
 * 请求参数中的1代表消息id,agree代表回复的类型，"agree"代表同意,"reject"代表有拒绝
 */
router.get('/message/:id/reply/:type',function(req, res, next){
    var user = req.user;
    if(user) {
         var messageId = req.params.id,
             replyType = req.params.type;
        try{
            if(replyType === 'agree'){
                Message.findMessageById(messageId).then(function(){
                    res.send({result:'success',operate:'reply agree'});
                }).catch(function(){
                    res.status(500).send({result:'failure',operate:'reply agree'});
                })
            }else{
                Message.updateMessageState(messageId,true).then(function(){
                    res.send({result:'success',operate:'reply reject'});
                }).catch(function(){
                    res.status(500).send({result:'failure',operate:'reply reject'});
                });
            }
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 查询帐单
 * rest服务相对地址："/users/from/12311313/to/1231313132"，http方法为:“GET”
 * 请求参数用from后面的数字代表起始时间，to后面的数字代表结束时间，两个的时间的单位都是毫秒
 */
router.get('/bills/from/:from/to/:to',function(req, res, next){
    var user = req.user;
    if(user) {
        var provider = user.provider,
            user_id = user.id || user.userID,
            from = req.params.from,
            to = req.params.to;
        try{
            Bill.findBillByDateTime(provider,user_id,from,to).then(function(){
                res.send({result:'success',operate:'getbill'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'getbill'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 创建反馈信息
 * rest服务相对地址："/users/feedback"，http方法为:“PUT”
 * 请求体需要包含：content——反馈内容，比如：{content:'找不到创建团的功能'}
 */
router.put('/feedback',function(req, res, next){
    var user = req.user;
    if(user) {
        var provider = user.provider,
            user_id = user.id || user.userID;
        var reqBody = req.body;
        var content = reqBody.content;
        try{
            var feedback ={
                "id":Util.getGuid(),
                "user":{"provider":provider,"user_id":user_id},
                "datetime":new Date().getTime(),
                "content":content,
                "readed":false
            };
            Feedback.createFeedback(feedback).then(function(){
                res.send({result:'success',operate:'create feedback'});
            }).catch(function(){
                res.status(500).send({result:'failure',operate:'create feedback'});
            });
        }catch(e){
            console.log(e);
        }
    }else{
        res.status(401).send({result:'failure',operate:'unlogin'});
    }
});

module.exports = router;
