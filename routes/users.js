var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'AA登录' });
});

/* GET users listing. */
router.get('/login', function(req, res, next) {
  var body = req.body;
  switch (body.type){
    case 'qq':
          res.redirect('https://graph.qq.com/oauth2.0/authorize?response_type=state&client_id=101318755&redirect_uri=http://godutch.duapp.com&state=hello');
          break;
    case 'weixin':
          res.redirect();
          break;
    default :
          break;
  }
});

module.exports = router;
