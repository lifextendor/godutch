var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('users', { title: 'Express1231231313' });
});

module.exports = router;
