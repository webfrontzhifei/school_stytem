var userModel = require('../models/user.common.model');
var crypto = require('crypto');

module.exports = {
	checkLogin: function(req, res, next) {
		if(!req.session.user) {
			res.redirect('/login');
		}else {
			next();
		}
	},
	checkNotLogin: function(req, res, next) {
		if(req.session.user) {
			res.redirect('/');
		}else {
			next();
		}
	},
	login: function(req, res, next) {
	
		var name = req.body.name;
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var conditions = {
			name: name,
			password: password
		}	
		userModel.find(conditions, function(err, result) {
			if(err){
				res.json({
					r: 1,
					msg: '服务器错误，请稍后重试'
				});
			} 
			else {
				if(result && result.length > 0) {
					req.session.user = result[0];
					res.json({
						r:0
					});
				}else {
					res.json({
						r: 1,
						msg: '请验证用户名密码后重试！'
					})
				}
			}	
		});
	}
}