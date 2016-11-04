var express = require('express');
var ExpressRouter = express.Router();
var newsController = require('../controllers/news.common.controller');
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
ExpressRouter.get('/express',function(req, res, next){
	res.render('blue/express/index.html', {

	});
});
ExpressRouter.get('/express/myExpress',function(req, res, next){
	res.render('blue/express/myExpress.html', {
		total: 10,
		unExpress: [
			{
				id: '0',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '中通',
				type: '包裹',
				number: '0993',
				arriveDate: '2016-11-15 9:02:41'
			},
			{
				id: '1',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11'
			}
		]
	});
});
// newsRouter.get('/news/item1',function(req, res, next){
// 	res.render('blue/news/itemdetail.html', {

// 	});
// });


module.exports = ExpressRouter; 