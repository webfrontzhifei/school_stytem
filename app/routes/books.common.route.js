var express = require('express');
var BooksRouter = express.Router();
// var newsController = require('../controllers/news.common.controller');
var $ = require('underscore');


BooksRouter.get('/books',function(req, res, next){
	res.render('blue/books/index.html', {

	});
});



module.exports = BooksRouter;