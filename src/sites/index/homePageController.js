LBF.define('qidian.sites.index.homePageController', function(require, exports, module) {
	var Controller = require('qidian.comp.Controller'),
        $ = require('lib.jQuery'),
        slideBox = require('lib.slideBox'),
        scroll = require('qidian.comp.scroll');

	module.exports = exports = Controller.extend( {
		el: 'body',
		
		initialize: function(options) {
			$('.slideBox').slideBox({
                hideClickBar : false,
                bundler: '.slide_area .info'
            });
           
           $('.myscroll').myScroll({
                speed: 40, //数值越大，速度越慢
                rowHeight: 28 //li的高度
            });
            var self = this;
		}

		
	});
});