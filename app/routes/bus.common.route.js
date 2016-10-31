var express = require('express');
var busRouter = express.Router();
// var newsController = require('../controllers/news.common.controller');
var $ = require('underscore');


// newsRouter.get('/news', function(req, res, next) {
// 	newsController.getNewsList(req,function(result) {
// 		res.render('blue/news/index.html', $.extend({},result,{
// 			title: '校园新闻主页',
// 			user: req.session.user,
// 			success: req.flash('success').toString(),
// 			error: req.flash('error').toString()
// 		}));
// 	});
// });
busRouter.get('/bus',function(req, res, next){
	res.render('blue/bus/index.html', {

	});
});


module.exports = busRouter; 