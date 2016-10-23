var userModel = require('../models/user.common.model');

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
	
		var conditions = {
			name: req.body.userName,
			password: req.body.password
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