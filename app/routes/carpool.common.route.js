var express = require('express');
var carpoolRouter = express.Router();
// var newsController = require('../controllers/news.common.controller');
var $ = require('underscore');


carpoolRouter.get('/carpool',function(req, res, next){
	res.render('blue/carpool/index.html', {

	});
});
carpoolRouter.get('/carpool/result',function(req, res, next){
	res.render('blue/carpool/result.html', {

	});
});
carpoolRouter.get('/carpool/launchCar', function(req, res, next) {
	res.render('blue/carpool/launchCar.html', {

	});
})



module.exports = carpoolRouter; 