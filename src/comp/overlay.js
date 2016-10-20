/*
 * 自定义遮罩层
 * @author: vergilzhou
 * @version: 1.0.0
 * @date: 2015/11/14
 *
 */
LBF.define('qidian.comp.overlay', function(require, exports, module) {

	var $ = require('lib.jQuery');

	require('{qidianTheme}/comp/overlay.css');

	var gId,
		gOverlayClassName,
		gContentClassName,
		gAnimationTime = 300;

	exports.overlay = function(options) {
		var self = this,
			options = options || {},
			content = options.content || '',
			bg = options.bg || '#000',
			id = gId = options.id || 'overlay-custom',
			overlayClassName = gOverlayClassName = options.overlayClassName || 'gOverlayClassName',
			contentClassName = gContentClassName = options.contentClassName || 'gContentClassName',
			opacity = options.opacity || 0.5,
			$container = options.container ? $(options.container) : $('body');
		gAnimationTime = options.time ? options.time : gAnimationTime;

		//目前仅支持遮住整个body
		var $div = '<div id="' + id + '" class="overlay ' + overlayClassName + '" style="height:' + $(document).height() + 'px;"></div><div class="overlay-content ' + contentClassName + '">' + content + '</div>'
		$container.append($div);
		$('#' + id).hide().fadeIn(gAnimationTime);
	};

	exports.remove = function(cb) {
		$('.' + gOverlayClassName + ', .' + gContentClassName).fadeOut(gAnimationTime, function() {
			$('.' + gOverlayClassName + ', .' + gContentClassName).remove();
		});
		if (typeof cb === 'function') {
			cb();
		}
	}

});