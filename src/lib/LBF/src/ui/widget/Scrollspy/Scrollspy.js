/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-7-7 上午8:14
 */
LBF.define('ui.widget.Scrollspy.Scrollspy', function(require){
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node'),
        extend = require('lang.extend');
	
	require('{theme}/lbfUI/css/Scrollspy.css');
	
	var Scrollspy = Node.inherit({
		/**
         * Render scrollspy's attribute
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
			var $scrollspy = $(this.get('scrollspy')),
				target = this.get('target'),
				top = this.get('top');
			
			$scrollspy.attr({
				'data-spy': 'scroll',
				'data-target': target,
				'data-offset': top
			});
			
            this.pro($);

            return this;
        },
		
		pro: function($){
			var _scrollspy = this;
		
			/* SCROLLSPY CLASS DEFINITION
		  * ========================== */
		
			function ScrollSpy(element, options) {
				var _this = this;
				//将实例绑到回调的this中
				var process = $.proxy(this.process, this)
				//决定绑定滚动事件的元素
				, $element = $(element).is('body') ? $(window) : $(element)
				, href
				this.options = $.extend({}, $.fn.scrollspy.defaults, options)
				//绑定事件
				this.$scrollElement = $element.on('scroll.scroll-spy.data-api', process)
				//取得要监控的元素的CSS表达式：1 通过data-target指定 2 通过href属性得到 （监控元素必须是一个位于LI元素的链接）
				this.selector = (this.options.target 
					|| ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
					|| '') + ' .nav li > a' //第2种情况作为导航元素的某个菜单的链接存在
		
				this.$body = $('body')
				this.refresh()
				//先执行一次，高亮其中某个
				this.process()
			}
		
			ScrollSpy.prototype = {
		
				constructor: ScrollSpy
		
				, 
				refresh: function () {
					var self = this
						//fixed by rains, 如果是self.is($(window)), 那么self.$scrollElement.scrollTop()=0; 避免用户在scrollTop() != 0的情况下刷新页面导致计算不准
						scrolltop = self.$scrollElement.is($(window)) ? 0 : self.$scrollElement.scrollTop()
						
					this.offsets = $([])
					this.targets = $([])
					
					
					
					this.$body
					.find(this.selector)
					.map(function () {
						var $el = $(this)
						, href = $el.data('target') || $el.attr('href')
						, $href = /^#\w/.test(href) && $(href)
						return ( $href
							&& $href.length //返回一个二维数组，它到页面顶部的距离及href的值
							&& [[ $href.position().top + scrolltop, href ]] ) || null
					})
					.sort(function (a, b) {
						return a[0] - b[0]
					})
					.each(function () {
						self.offsets.push(this[0])//收集偏离值
						self.targets.push(this[1])//收集href值（ID值）
						//console.log(this);
					})
					//self.targets里都是ID选择器
				}
		
				, 
				process: function () {
					var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
					, scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
					//最大可以滚动的高度
					, maxScroll = scrollHeight - this.$scrollElement.height()
					, offsets = this.offsets
					, targets = this.targets
					, activeTarget = this.activeTarget
					, i

					if (scrollTop >= maxScroll) {
						return activeTarget != (i = targets.last()[0])
						&& this.activate ( i )
					}
		
					for (i = offsets.length; i--;) {
						if(activeTarget != targets[i]
						&& scrollTop >= offsets[i]//遍历offset中，寻找一个最接近顶部的元素
						&& (!offsets[i + 1] || scrollTop <= offsets[i + 1])){
							this.activate( targets[i] )
						}
					}
				}
		
				, 
				activate: function (target) {
					var active
					, selector
					this.activeTarget = target//重写activeTarget
		
					$(this.selector)
					.parent('.'+_scrollspy.get('className'))
					.removeClass(_scrollspy.get('className'))
					
					//取得新的要高亮的元素
					selector = this.selector
					+ '[data-target="' + target + '"],'
					+ this.selector + '[href="' + target + '"]'
					//#navbarExample .nav li > a[data-target="#doomsday"],#navbarExample .nav li > a[href="#doomsday"]
					active = $(selector)
					.parent('li')
					.addClass(_scrollspy.get('className'));

		
					if (active.parent('.dropdown-menu').length)  {
						active = active.closest('li.dropdown').addClass(_scrollspy.get('className'))
					}

					active.trigger('activate');
				}
		
			}
		
		
			/* SCROLLSPY PLUGIN DEFINITION
		  * =========================== */
		
			var old = $.fn.scrollspy
		
			$.fn.scrollspy = function (option) {
				return this.each(function () {
					var $this = $(this)
					, data = $this.data('scrollspy')
					, options = typeof option == 'object' && option
					if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
					if (typeof option == 'string') data[option]()
				})
			}
		
			$.fn.scrollspy.Constructor = ScrollSpy
		
			$.fn.scrollspy.defaults = {
				offset: 10
			}
		
		
			/* SCROLLSPY NO CONFLICT
		  * ===================== */
		
			$.fn.scrollspy.noConflict = function () {
				$.fn.scrollspy = old
				return this
			}
		
		
			/* SCROLLSPY DATA-API
		  * ================== */
			$(document).ready(function () {
				//取得元素上带data-spy="scroll"的元素（它是一个带滚动条的容器）
				$('[data-spy="scroll"]').each(function () {
					var $spy = $(this);
					$spy.scrollspy($spy.data());//收集其所有data-*属性，组成配置对象与默认配置合并
				});
			})
		}
	});
	
	Scrollspy.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
			//滚动区域所在的容器
			scrollspy: 'body',
			
            //导航容器
			target: '.bs-docs-sidebar',
			
			//导航高亮样式名
			className: 'lbf-scrollspy-active',
			
			//偏离值
			top: 0
        }
    });
	
	return Scrollspy;
});