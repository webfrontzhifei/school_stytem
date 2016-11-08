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
				arriveDate: '2016-11-15 9:02:41',
				agent: '无'
			},
			{
				id: '1',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: '无'
			}
		]
	});
});
ExpressRouter.get('/express/myExpressTab2',function(req, res, next){
	res.render('blue/express/myExpressTab2.html', {
		total: 10,
		unExpress: [
			{
				id: '0',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '中通',
				type: '包裹',
				number: '0993',
				arriveDate: '2016-11-15 9:02:41',
				agent: 'liuciwen'
			},
			{
				id: '1',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0948',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '2',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0922',
				arriveDate: '2016-11-10 7:01:11',
				agent: 'liuciwen'
			},
			{
				id: '3',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0846',
				arriveDate: '2016-11-7 9:01:11',
				agent: 'liuciwen'
			},
			{
				id: '4',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0817',
				arriveDate: '2016-11-1 9:23:11',
				agent: 'liuciwen'
			},
			{
				id: '5',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0852',
				arriveDate: '2016-10-5 8:43:11',
				agent: 'liuciwen'
			},
			{
				id: '6',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0931',
				arriveDate: '2016-8-3 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '7',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0766',
				arriveDate: '2016-8-1 16:05:13',
				agent: 'liuciwen'
			},
			{
				id: '8',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0742',
				arriveDate: '2016-7-15 8:56:34',
				agent: 'liuciwen'
			},
			{
				id: '9',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0948',
				arriveDate: '2016-6-23 9:05:23',
				agent: 'liuciwen'
			},
			{
				id: '10',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0211',
				arriveDate: '2016-6-10 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '11',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-3-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '12',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '13',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '14',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '15',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			},
			{
				id: '16',
				name: 'liuciwen',
				mailcenter: '雀巢自助柜',
				company: '韵达',
				type: '文件',
				number: '0946',
				arriveDate: '2016-11-15 8:01:11',
				agent: 'liuciwen'
			}
		]
	});
});
// newsRouter.get('/news/item1',function(req, res, next){
// 	res.render('blue/news/itemdetail.html', {

// 	});
// });


module.exports = ExpressRouter; 