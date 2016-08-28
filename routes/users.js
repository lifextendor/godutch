var express = require('express');
var router = express.Router();
var Group = require('./databases/group');
var Message = require('./databases/message');
var Bill = require('./databases/bill');
var Verify = require('./util/verify');

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
        var reqBody = req.body;
        var type = reqBody.type;
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

/**
 * 删除团队
 * rest服务相对地址："/users/dropgroup"，http方法为:“POST”
 * 请求体必须包含groupId信息
 */
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

/**
 * 根据用户信息查询团队
 * rest服务相对地址："/users/groups"，http方法为:“GET”
 */
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
        Group.findGroupById(groupId, provider,user_id).then(function(groups){
            res.send({result:groups,operate:'findgroupbyid'});
        }).catch(function(){
            res.send({result:'failure',operate:'findgroupbyid'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 删除用户
 * rest服务相对地址："/users/deletemember"，http方法为:“POST”
 * 请求参数如下：{groupId:1,member:{provider:'qq',user_id:1}}
 */
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

/**
 * 退出团
 * rest服务相对地址："/users/leave"，http方法为:“POST”
 * 请求参数包含groupId
 */
router.post('/leave',function(req, res, next) {
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body,
            groupId = reqBody.groupId;
        Group.leaveGroup(groupId,provider,user_id).then(function(){
            res.send({result:'success',operate:'leave'});
        }).catch(function(){
            res.send({result:'failure',operate:'leave'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 算账
 * rest服务相对地址："/users/updatemoney"，http方法为:“PUT”
 * 请求参数如下：{total:10,members:[{provider:'qq',user_id:1,money:10}],dataTime:121321313}
 */
router.put('/updatemoney',function(req, res, next) {
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            memberInfos = reqBody.memberInfos,
            totalMoney = memberInfos.total,
            members = memberInfos.members,
            dateTime = memberInfos.dateTime;
        Group.updateMoney(groupId,provider,user_id,memberInfos).then(function(){
            Bill.createBill({groupid:groupId,datetime:dateTime,members:members,money:totalMoney}).then(function(){
                res.send({result:'success',operate:'updatemoney'});
            }).catch(function(){
                res.send({result:'failure',operate:'createBill'});
            });
        }).catch(function(){
            res.send({result:'failure',operate:'updatemoney'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 授权为副团长
 * rest服务相对地址："/users/authorize"，http方法为:“PUT”
 * 请求参数，比如：{groupId:1,member:{provider:'qq',user_id:1}}
 */
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

/**
 * 取消副团长的授权
 * rest服务相对地址："/users/deauthorize"，http方法为:“PUT”
 * 请求参数，比如：{groupId:1,member:{provider:'qq',user_id:1}}
 */
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

/**
 * 邀请用户加入团
 * rest服务相对地址："/users/invite"，http方法为:“POST”
 * 请求参数，比如：{groupId:1,userInfo:{provider:'qq',user_id:1}}
 */
router.post('/invite',function(req, res, next) {
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        var reqBody = req.body;
        var groupId = reqBody.groupId,
            userInfo = reqBody.userInfo,
            message = {
                type:'invite',
                groupid:groupId,
                userinfo:userInfo,
                readed:false
            };
        Message.createMessage(groupId,provider,user_id,message).then(function(){
            res.send({result:'success',operate:'invite'});
        }).catch(function(){
            res.send({result:'failure',operate:'invite'});
        })
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 查询未读消息
 * rest服务相对地址："/users/messages"，http方法为:“GET”
 */
router.get('messages',function(req, res, next){
    var user = req.user;
    if(user) {
        var provider = user.provider;
        var user_id = user.id || user.userID;
        Message.findMessage(provider,user_id,false).then(function(messages){
            res.send({result:messages,operate:'messages'});
        }).catch(function(){
            res.send({result:'failure',operate:'messages'});
        })
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 查询消息的详细信息
 * rest服务相对地址："/users/message/1"，http方法为:“GET”
 * 请求参数中的1代表消息id
 */
router.get('message/:id',function(req, res, next){
    var user = req.user;
    if(user) {
        var messageId = req.params.id;
        Message.findMessageById(messageId).then(function(){
            res.send({result:'success',operate:'get massege by id'});
        }).catch(function(){
            res.send({result:'failure',operate:'get massege by id'});
        })
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

/**
 * 回复邀请消息
 * rest服务相对地址："/users/message/1/reply/agree"，http方法为:“GET”
 * 请求参数中的1代表消息id,agree代表回复的类型，"agree"代表同意,"reject"代表有拒绝
 */
router.get('message/:id/reply/:type',function(req, res, next){
    var user = req.user;
    if(user) {
         var messageId = req.params.id,
             replyType = req.params.type;
        if(replyType === 'agree'){
            Message.findMessageById(messageId).then(function(){
                res.send({result:'success',operate:'reply agree'});
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

/**
 * 查询帐单
 * rest服务相对地址："/users/from/12311313/to/1231313132"，http方法为:“GET”
 * 请求参数用from后面的数字代表起始时间，to后面的数字代表结束时间，两个的时间的单位都是毫秒
 */
router.get('bills/from/:from/to/:to',function(req, res, next){
    var user = req.user;
    if(user) {
        var provider = user.provider,
            user_id = user.id || user.userID,
            from = req.params.from,
            to = req.params.to;
        Bill.findBillByDateTime(provider,user_id,from,to).then(function(){
            res.send({result:'success',operate:'getbill'});
        }).catch(function(){
            res.send({result:'failure',operate:'getbill'});
        });
    }else{
        res.send({result:'failure',operate:'unlogin'});
    }
});

module.exports = router;
