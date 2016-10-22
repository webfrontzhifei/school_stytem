var express = require('express');
var userRouter = express.Router();
var userComController = require('../controllers/user.common.controller');

userRouter.post('/login', userComController.checkNotLogin);
userRouter.post('/login', userComController.login);

userRouter.get('/login', function(req, res, next) {
	
	res.render('index/login/login', {

	});
});

module.exports = userRouter; 