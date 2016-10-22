LBF.define('qidian.sites.index.login.loginController', function(require, exports, module) {
	var Controller = require('qidian.comp.PageControllerCosy'),
        TextInput = require('qidian.comp.TextInput'),
        REST = require('qidian.comp.REST'),
        LightTip = require('qidian.comp.LightTip'),
        $ = require('lib.jQuery');

	module.exports = exports = Controller.extend( {
		el: 'body',
		elements: {
            '$submitBtn': '#submit'
        },
		initialize: function(options) {
			var self = this;
			//初始化登录框
            self.userNameInput = new TextInput({
                selector: '#username',
                immediate: true,
                events: {
                    load: function(){
                        
                    },
                    keypress: function(e){
                        if(e.keyCode === 13) {
                        //     self.doSearch(this.val().trim());
                        }
                    }
                },
                validate: function(event, value) {
               		if(value.length > 16) {
               		
               			return false;
               		}
               		return true
                },
                maxlength: 16
            });
            self.passwordInput = new TextInput({
                selector: '#password',
                immediate: true,
                events: {
                    load: function(){
                        
                    },
                    keypress: function(e){
                        if(e.keyCode === 13) {
                            // self.doSearch(this.val().trim());
                        }
                    }
                },
                validate: function(event, value) {
               		if(value.length > 16) {
               			return false;
               		}
               		return true
                },
                maxlength: 16
            });

            self.$submitBtn.bind('click', this.submit.bind(this));
		},

		submit: function() {
			var self = this;
		
			if(!(this.userNameInput._isOverflow() && this.passwordInput._isOverflow())) {
				REST.create({
					url: '/login',
					data: {
						userName: self.userNameInput.value(),
						password: self.passwordInput.value()
					}
				}).done(function(res) {
					if(res.r = "0"){
						console.log('success');
						location.href="/index";
					}else {
						LightTip.error(res.msg || '请验证用户名密码后重试！');
					}
				}).fail(function(e) {
					LightTip.error(e.message || '服务器错误，请稍后重试');
				});
				return true;
			}
			return false;
		}
	});
});