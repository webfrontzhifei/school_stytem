/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.nav', function(require, exports, module){
	var $ = require('lib.jQuery'),
		$tag = $('.ahead .tag, .header-nav a'),
		$navi = $('.ahead .navi, .header .navi'),
		onVisible = 0;
	
	$navi.length && $tag.add($navi).hover(function(){
		delay(function(){
			$tag.addClass('expand');
			$navi.show();
			onVisible = +new Date();
		}, 200, window);
	}, function(){
		delay(function(){
			$tag.removeClass('expand');
			$navi.hide();
		}, 100, window);
	});
	
	$tag.bind('click', function(){
		if(+new Date() - onVisible < 300) {
			return false;
		}
		
		$tag.toggleClass('expand');
		$navi.toggle();
		
		return false;
	});
	
	function delay(fn, times, me) {
		if (me.sleepid) {
			clearTimeout(me.sleepid);
		}
		
		me.sleepid = setTimeout(fn, times);
	}
});