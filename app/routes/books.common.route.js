var express = require('express');
var BooksRouter = express.Router();
// var newsController = require('../controllers/news.common.controller');
var $ = require('underscore');


BooksRouter.get('/books',function(req, res, next){
	res.render('blue/books/index.html', {
	});
});
BooksRouter.get('/books/detail',function(req, res, next){
	res.render('blue/books/detail.html', {

	});
});
BooksRouter.get('/books/mylibrary',function(req, res, next){
	res.render('blue/books/mylibrary.html', {

	});
});
BooksRouter.get('/books/myBorrows',function(req, res, next){
	res.render('blue/books/myBorrows.html',  {
		total: 10,
		unExpress: [
			{
				isbn: 'I247.57/900',
				title: '暗恋.橘生淮南',
				author: '八月长安',
				owner: '陈阳',
				startDate: '2016-11-15',
				endDate: '2016-11-19',
				phone: '14856563434',
				place: '四食堂',
				state: '确认收书',
				delay: 0
			},
			{
				isbn: 'TP312JA/ZB59',
				title: 'Node开发',
				author: '布朗',
				owner: '李明',
				startDate: '2016-11-15',
				endDate: '2016-11-19',
				phone: '14856323424',
				place: '图书馆',
				state: '已超期',
				delay: 1
			},
		]
	});
});


module.exports = BooksRouter;