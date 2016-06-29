var passport = require('passport');
var TqqStrategy = require('passport-tqq').Strategy;
var OAuth2Strategy = require('passport-oauth2').Strategy;
var package_json = require('./package');

var DEPLOY_HOST = package_json.deploy_host,
    AUTH_HOST = package_json.auth_host,
    QQ_AUTH = package_json.auth.qq,
    GODUTCH_AUTH = package_json.auth.godutch;

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new TqqStrategy({
        clientID: QQ_AUTH.app_id,
        clientSecret: QQ_AUTH.app_key,
        callbackURL: DEPLOY_HOST + QQ_AUTH.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));
// 重写获取用户信息的方法
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    var oauth2 = this._oauth2,
        profileURL = AUTH_HOST + GODUTCH_AUTH.user_profile_url;
    oauth2.get(profileURL, accessToken, function (err, result, res) {
        try {
            var json = JSON.parse(result)
                , profile = { provider: 'godutch' };

            profile.userID = json.user_id;
            profile.name = json.name;
            profile._raw = result;
            profile._json = json;

            done(null, profile);
        } catch (e) {
            done(e);
        }
    });
};
passport.use(new OAuth2Strategy({
        authorizationURL: AUTH_HOST + GODUTCH_AUTH.authorization_url,
        tokenURL: AUTH_HOST + GODUTCH_AUTH.token_url,
        clientID: GODUTCH_AUTH.client_id,
        clientSecret: GODUTCH_AUTH.client_secret,
        callbackURL: DEPLOY_HOST + GODUTCH_AUTH.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(JSON.stringify(profile));
        process.nextTick(function () {
            return done(null, profile);
        });
    }
));