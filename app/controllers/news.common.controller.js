var News = require('../models/news.news.model');
var categoryModel = require('../models/category.news.model');
var commentModel = require('../models/comment.news.model');

module.exports = {
	getNewsList: function(req, callback) {
		var category = req.query.category;
		var page = req.query.page ? parseInt(req.query.page) : 1;
		var perNum = req.query.perNum;
		var json_obj = {};
		News.count({}, function(err, count){
			News.find({}, null, {
				skip: (page-1)*perNum,
				limit: perNum
			}, function(err, news) {
				json_obj = {
					news: news,
					page: page,
					isFirstPage: page == 1,
					isLastPage: (page-1) + news.length == count
				}
			})
		})
	}
}

