var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '乐育安卓测试分发系统' });
});

module.exports = router;
