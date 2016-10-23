var express = require('express');
var router = express.Router();
var userComController = require('../app/controllers/user.common.controller');



/* GET home page. */
// router.get('/', userComController.checkLogin);
router.get('/', function(req, res, next) {
  res.render('blue/index.html',{
  	name: 'zhifei'
  });
});

// router.get('/index', userComController.checkLogin);
router.get('/index', function(req, res, next) {
  res.render('blue/index.html',{
  	name: 'zhifei'
  });
});

module.exports = router;
