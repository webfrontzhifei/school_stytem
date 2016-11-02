var busModel = require('../models/bus.bus.model');
var buslineModel = require('../models/busline.bus.model');
var driverModel = require('../models/driver.bus.model');
var stopModel = require('../models/stop.bus.model');


module.exports = {
	getRouteList: function(req, callback) {
		var depart = req.body.departName;
		var des = req.body.destinationName;
		stopModel.find({'stopname': { $in: [depart, des]}})
			.select('stopid')
			.exec(function(idArr, err) {
				if(err) {
					req.flash('error',err.message);
				}
				var ids = idArr && idArr.length ? idArr : [];
				buslineModel.find()
				.where({
					'stops': {$all: ids}
				})
				.exec(function(routeList) {
					callback(routeList);
				});
			});
	}
	// getNewsList: function(req, callback) {
	// 	var category = req.query.category;
	// 	var page = req.query.page ? parseInt(req.query.page) : 1;
	// 	var perNum = req.query.perNum;
	// 	var json_obj = {};
	// 	News.count({}, function(err, count){
	// 		News.find({}, null, {
	// 			skip: (page-1)*perNum,
	// 			limit: perNum
	// 		}, function(err, news) {
	// 			json_obj = {
	// 				news: news,
	// 				page: page,
	// 				isFirstPage: page == 1,
	// 				isLastPage: (page-1) + news.length == count
	// 			}
	// 		})
	// 	})
	// }
}