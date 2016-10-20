/**
 * Created by sean on 14-12-5.
 */
LBF.define('qidian.comp.LoginStatusHold', function(require, exports){
	var PTLogin = require('qidian.comp.PTLogin');
	
    /**
	 * 登录态续期
	 * 控制重试次数
	 */
	var retryConfig = {
		maxRetryTimes: 3,
		curCallback: null,
		curRetryTimes: 0
	}
	
	var LoginStatusHold = {
		inClient: external && external.HRTX_GetClientKey,
		
		/*
		 * 续期操作
		 * 如果是在客户端则直接续期，如果是在浏览器打开的页面，则弹出登陆框
		 */
		renewal: function(callback, context, params){
			if(this.inClient) {
				this.refreshSession(callback, context, params);
			} else {
				PTLogin.popupLogin();	
			}
		},
		
		refreshSession: function(callback, context, params) {
            if(retryConfig.curCallback !== callback) {
				retryConfig.curRetryTimes = 0;
			}
			
			retryConfig.curCallback = callback;

			//如果同一方法的重试次数大于最大次数, 则刷新页面;
			if(++retryConfig.curRetryTimes > retryConfig.maxRetryTimes) {
				window.location.reload();
				return;
			}

			var ckeyObj = external && external.HRTX_GetClientKey && external.HRTX_GetClientKey() || '{}',
				body = document.getElementsByTagName('body')[0],
				iframe = document.createElement('iframe');

			if(JSON && JSON.parse) {
				ckeyObj = JSON.parse(ckeyObj);
			} else {
				ckeyObj = eval('(' + ckeyObj + ')');
			}

			var env = window.location.href,
				envHrtx = '';
			if(env.indexOf('//oa.') != -1) {
				envHrtx = 'qiye_client_oa';
			} else if(env.indexOf('//dev.') != -1) {
				envHrtx = 'qiye_client_dev';
			} else {
				envHrtx = 'qiye_client_ol';
			}
			
			//http://ptlogin2.qq.com/qiye_client_oa?clientuin=2852995609&clientkey=E00A8764F9F0E2F15E84C2079BF46CB8BE69658E0C5576F27371D00372BFE647&keyindex=0&jump=1&qq=173811091;
			iframe.src= 'https://ptlogin2.qq.com/' + envHrtx + '?jump=1&keyindex=0&clientuin=' + ckeyObj['clientuin'] + '&clientkey=' + ckeyObj['clientkey'] + '&qq=' + ckeyObj['clientuin'];
			iframe.hidden = true;
			iframe.width = 0;
			iframe.height = 0;
			iframe.onload = function() {
				retryConfig.curRetryTimes = 0;
				callback && callback.apply(context, params);
			};
			
			body.appendChild(iframe);
        }
    };
	
	return LoginStatusHold;
});

