/**
 * User: sqchen
 * Date: 15-09-29
 * Time: 上午17:40
 * 页面顶部公用区域
 */

LBF.define('qidian.comp.PageTop', function(require, exports, module) {
	var $ = require('lib.jQuery'),
		Tip = require('ui.Nodes.Tip'),
		beforeUnload = require('qidian.comp.beforeUnload'),
		DataReport = require('qidian.comp.DataReport');

	//下载客户端
	if($('#headerInfoDownload')[0]) {
		new Tip({
		    trigger: $('#headerInfoDownload'),
		    className: 'header-info-top-tips',
		    content: [
		        '<p>通过客户端进行沟通和互动</p>',
		        '<div class="area-download"><a href="http://dldir1.qq.com/qqfile/crm/QiDian1.0.2489.exe" target="_blank" class="lbf-button lbf-button-primary">下载</a></div>',
		        '<a href="/mp/accountManage">查看登录帐号</a>'
		    ].join(''),
		    container: $('body'),
		    direction: 'bottom',
		    show: { mode: 'hover' }
		});
	}

	//关注公众号
	if($('#headerInfoAttention')[0]) {
		new Tip({
		    trigger: $('#headerInfoAttention'),
		    className: 'header-info-top-tips',
		    content: [
		    	'<div class="qr-code"></div>',
		        '<p>扫描二维码<br />或在手Q上搜索<br />腾讯企点助手</p>'
		    ].join(''),
		    container: $('body'),
		    direction: 'bottom',
		    show: { mode: 'hover' }
		});
	}

	//离开页面时上报“页面停留时间”
    $(window).bind('beforeunload', function(){
        DataReport('/ac/dataReport?kfuin=' + $('.header-info .avatar').attr('data-uin') + '&reportId=1&stayTime=' + (new Date().getTime() - _speedMark));
    });
});