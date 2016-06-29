var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var headers = req.headers;
    var root = 'http://' + headers.host;
    res.render('users', { title: 'Express1231231313',root:root });
});

router.get('/tt', function(req, res, next) {
    res.set({ tt: 'AA登录' })
});

module.exports = router;
