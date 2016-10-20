/*
 * 切换当前列表最大条数count的控件
 * @author: vergilzhou
 * @version: 3.1.0
 * @date: 2015/01/06
 *
 */
LBF.define('qidian.comp.PageCount', function(require, exports, module) {
	var Dropdown = require('ui.widget.Dropdown.Dropdown'),
		$ = require('lib.jQuery');

	module.exports = exports = function(trigger) {
		var _trigger = trigger && trigger.length ? trigger : $('.table-page-data .table-page-a'),
			_dropdown = new Dropdown({
	            trigger: _trigger,
	            content: '<ul class="lbf-dropdown-ul" style="width:110px;"><li>15</li><li>30</li><li>50</li></ul>',
	            adjust: {
	                x: _trigger.width() / 2 - 50
	            },
	            show: {
	                effect: function() {
	                    this.show();
	                }
	            },
                events: {
                    open: function(){
                        var dp = this.$el,
                            spaceTolerance = 10,//可以容忍空间高度比dropdown小的最大值(dropdown高度 - 可用空间高度), 这个值越大，容忍度越高;
                            winH = $(window).height(),
                            st = document.documentElement.scrollTop || document.body.scrollTop,
                            dpH = dp.outerHeight(true),
                            triggerH = this.$trigger.height(),
                            topSpace = this.$trigger.offset().top - st,
                            bottomSpace = winH + st - (this.$trigger.offset().top + triggerH);

                        if(winH + st < dp.offset().top + dpH - spaceTolerance && topSpace > bottomSpace){//当底部显示空间不够用,且上部显示空间又大时
                            dp.css({
                                marginTop: (dpH + triggerH) * -1 //设置marginTop值为负实现在上方展示
                            });
                        }
                    },
                    'close.Dropdown': function(){
                        this.$el.css('marginTop', '');//清空marginTop样式
                    }
                }
	        });
	    _dropdown.$el.click(function(event) {
            var target = $(event.target);
            _trigger.find('span:eq(0)').html(target.html());
            var num = Number($.trim(_trigger.find('span:eq(0)').text()));
            _dropdown.trigger('count', num);
            _dropdown.close();
        });

        return _dropdown;
	};
});
