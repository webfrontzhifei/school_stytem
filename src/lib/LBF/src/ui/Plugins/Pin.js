/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-7-4 下午8:20
 */
LBF.define('ui.Plugins.Pin', function(require){
    var $ = require('lib.jQuery'),
        Plugin = require('ui.Plugins.Plugin'),
		zIndexGenerator = require('util.zIndexGenerator');

    var Pin = Plugin.inherit({
        initialize: function(node, opts){
            this.node = node;
			this.setElement(node.$el);
			this.mergeOptions(opts);
            this.addMethods(this.constructor.methods);
			this.bindUi();
        },
		
		bindUi: function(){
			var that = this,
				$window = $(window);

            that.zIndexGenerator = zIndexGenerator();
				
			//不指定container，this.$container = null - 见55行
			if(that.get('container')){
                that.$container =that.get('container');
			}

            that.node.each(function () {
				var $node = $(this),
					$container;
					
					//把结构放到container
				if(!that.$el.parent().is(".lbf-pin")){
                    that.$el.wrap('<span class="lbf-pin"></span>'); //IE bug?
				}
				
				//屏幕分辨率过小，disablePin Pin
				if (that.get('minWidth') && $window.width() <= that.get('minWidth')){
                    that.disablePin();
				}

				$container = that.$container ? $node.closest(that.$container) : $('body');
				//$node = ul离(0,0)点Y轴距离
                var nodeOffset = $node.offset();
				//$node = body || body.offset() = (0,0)
                var containerOffset = $container.offset();
				//返回父元素中第一个其position设为relative或者absolute的元素, body
                var parentOffset = $node.offsetParent().offset();

				$node.data("pin", {
					//ul的offset.top 281
                    from: that.$container ? containerOffset.top : nodeOffset.top,
					//可以滚动的距离
                    to: containerOffset.top + $container.height() - $node.outerHeight(),
					//container的底部Y坐标，这里是body的底部Y坐标
                    end: containerOffset.top + $container.height(),
					//body的offset.top
                    parentTop: parentOffset.top
                });
				
				//这里把父容器设置相同高度的逻辑不是最完美的方案，受实际界面布局影响，这里直接给pin div了，必然存在隐患
				$node.parent().css("height", $node.outerHeight());
				
				$window.bind('scroll.Pin.'+that.zIndexGenerator, function(){
					var data = $node.data("pin"),
					 	from = data.from - that.get('top'),
						to   = data.to - that.get('top');
					
					//页面被卷曲的高度
                    that.scrollY = $window.scrollTop();
					
					if (from - that.get('top') < that.scrollY && that.scrollY < to - that.get('top')){
						!($node.parent().css("position") == "fixed") && $node.parent().css({
							left: $node.offset().left,
							top: that.get('top'),
							zIndex: that.get('zIndex')
						}).css("position", "fixed");
					} else if (that.scrollY >= to - that.get('top')) {
						$node.parent().css({
							left: "auto",
							top: to - data.parentTop,
							zIndex: 'auto'
						}).css("position", "absolute");
					} else {
						$node.parent().css({position: '', top: '', left: '', zIndex: ''});
					}
					
					//发现被Pin的容器大于父容器的高度，就不Pin了
					if (from + $node.parent().outerHeight() > data.end) {
						$node.parent().css({position: '', top: '', left: '', zIndex: ''});
					}
				});
				
				//防止offset==0时页面被刷新而失效
				$window.scroll();
			});
			
			return this;
		},
		
		enablePin: function(){
			this.bindUi();
            return this;
		},
		
		disablePin: function(){
            this.node.$el.css({position: '', top: '', left: '', zIndex: ''});
			if(this.node.$el.parent().is(".lbf-pin")){
				this.node.$el.parent().replaceWith(this.node.$el);
			}
			$(window).unbind('scroll.Pin.'+this.zIndexGenerator);
            return this;
		}
    });

    Pin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Pin',
		
		settings: {
			//pin的容器
			container: null,
			
			//屏幕分辨率低于minWidth，不做pin处理
			minWidth: 1000,
			
			//基于top:0的偏移量
			top: 0,
			
			//基于元素offset().left的的偏移量
			left: 0,
			
			zIndex: 0
        },

		/**
         * Methods to be mix in host node
         * @property methods
         * @type Array
         * @static
         */
        methods: ['enablePin', 'disablePin']
    });

    return Pin;
});