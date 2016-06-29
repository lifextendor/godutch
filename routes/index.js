var express = require('express');
var passport = require('passport');
var crypto = require('crypto');
var router = express.Router();
var Users = require('./databases/user');
require('../auth');
var TITLE = 'godutch';

/* GET home page. */
router.get('/', function(req, res, next) {
    var headers = req.headers;
    var root = 'http://' + headers.host;
    var user = req.user;
    if(user){
        var provider = user.provider;
        var user_id = user.id || user.userID;
        Users.findUser(provider,user_id).then(function(userInfo){
            res.render('index',{title:TITLE,user:userInfo.user_name,root:root});
        }).catch(function(){
            var userInfo = user._json;
            userInfo.provider = provider;
            userInfo.user_id = user_id;
            userInfo.user_name = user.name || user.nickname;
            Users.addUser(userInfo).then(function(userInfo){
                res.render('index',{title:TITLE,user:userInfo.user_name,root:root});
            }).catch(function(){
                res.render('login',{title:TITLE,root:root});
            });
        });
    }else{
        res.render('login',{title:TITLE,root:root});
    }
});

//测试react-bootstrap
router.get('/test', function(req, res, next) {
    res.render('test');
});




router.get('/auth/qq', function (req, res, next) {
    req.session = req.session || {};
    req.session.authState = crypto.createHash('sha1')
        .update(-(new Date()) + '')
        .digest('hex');
    passport.authenticate('qq', {
        state: req.session.authState,
        scope: ['get_user_info', 'list_album']
    })(req, res, next);
});

// GET /auth/qq/callback
// 通过比较认证返回的`state`状态值与服务器端`session`中的`state`状态值
// 决定是否继续本次授权
router.get('/auth/qq/callback', function (req, res, next) {
        if(req.session && req.session.authState
            && req.session.authState === req.query.state) {
            passport
                .authenticate('qq', {
                    failureRedirect: '/'
                })(req, res, next);
        } else {
            return next(new Error('Auth State Mismatch'));
        }
    },
    function(req, res) {
        res.redirect('/');
    });

/**
 * godutch 自己实现的一个oauth2服务
 */
router.get('/auth/godutch', passport.authenticate('oauth2'));

router.get('/auth/godutch/callback',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;
