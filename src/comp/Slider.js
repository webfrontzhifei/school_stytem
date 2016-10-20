LBF.define('qidian.comp.Slider',function(require, exports, module) {
    require('{theme}/comp/slider/slider.css');
    var $ = require('lib.jQuery'),
        template = require('util.template'),
        content = '<div class="slider_content"></div>'+
					'<i class="slider_left"></i>'+
					'<i class="slider_right"></i>'+
					'<i class="slider_close"></i>';
        
    var Slider = function (options) {
		this.$el = $(options.el)
		this.$el.appendTo($('body')).html(content)
		this.$content = this.$el.children('.slider_content')
		this.itemRenderer = template.compile(options.itemTpl || '<div></div>')
		this.datas = options.datas || [];
		this.keyParam = options.keyParam || 'id';
		this.currentIndex = -1;
		options.itemLayout && (this.layout =  options.itemLayout);
		var me = this;
		this.$el.on('click', function(e){
			var $target = $(e.target);
			if ($target.hasClass('slider_left')) {
				me.prev()
			} else if ($target.hasClass('slider_right')) {
				me.next()
			} else if ($target.hasClass('slider_close')) {
				me.hide()
			} else if (e.clientX < $(window).width() / 3) {
				// 点击左1/3区域
				me.prev()
			} else if (e.clientX > $(window).width() * 0.66) {
				// 点击有1/3区域
				me.next()
			}
		}).on('mousemove', function(e) {
			if (e.clientX < $(window).width() / 3 || e.clientX > $(window).width() * 0.66) {
				$(this).css('cursor', 'pointer');
			} else {
				$(this).css('cursor', 'auto');
			}
		});
		// 增加快捷键支持
		$(document).bind({
			keyup: function(e) {
				if (me.$el.is(':visible')) {
					if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 27) {
						e.preventDefault();
					}
					switch(e.keyCode) {
						case 39: {
							me.next();
							break;
						}
						case 37: {
							me.prev();
							break;
						}
						case 27: {
							me.hide();
							break;
						}
					}
				}
			}
		});
	}
	
	Slider.prototype = {
		constructor: Slider,
		show:function(data, direction){
			var me = this;
			if(data){
				html = this.itemRenderer(data);
				// IE10+走CSS3动画
				if (direction && history.pushState) {
					var $img = this.$content.find('img');
					if ($img.length) {
						$img.attr('class', 'nav_out_' + direction).bind({
							webkitAnimationEnd: function() { $(this).remove(); },
							animationend: function() { $(this).remove(); }
						});
					}
					this.$content.prepend(html);
					this.$content.find('img').eq(0).attr('class', 'nav_in_' + direction);
				} else {
					this.$content.html(html);
				}
			}
			if(!this.$el.is(':visible')){
				this.$el.css({
					display: 'block'
				});
				$(window).on('resize.slider',function(){me.layout(me.$content)})
			}			
			this.layout(this.$content);
			this.update(data);
			// 去除页面上的滚动条
			document.documentElement.style.overflow = 'hidden';
			return this;
		},
		hide:function(){
			this.$el.hide();
			document.documentElement.style.overflow = '';
			$(window).off('resize.slider')
			return this;
		},
		next:function(){
			if(this.currentIndex>=0 && this.currentIndex < this.datas.length-1){
				this.show(this.datas[this.currentIndex + 1], 'next')
			}
			return this;
		},
		prev:function(){
			if(this.currentIndex > 0){
				this.show(this.datas[this.currentIndex - 1], 'prev')
			}
			return this;
		},
		current:function(){
			return this.currentIndex>=0 ? this.datas[this.currentIndex] : null;
		},
		update:function(current){
			var v = current && current[this.keyParam],
				len=this.datas.length,
				i = len > 0 ? 0 : -1;
			for(; i<len; ++i){
				if(this.datas[i][this.keyParam] == v){
					break;
				}
			}
			this.currentIndex = i;
			if(this.currentIndex == -1 || this.currentIndex == 0){
				this.$el.find('.slider_left').hide()
			}else{
				this.$el.find('.slider_left').show()
			}
			if(this.currentIndex == -1 || this.currentIndex == len-1){
				this.$el.find('.slider_right').hide()
			}else{
				this.$el.find('.slider_right').show()
			}
		},
		setDatas:function(datas){
			this.datas = datas;
			this.currentIndex = 0;
		},
		layout:function(){
		}
	}
	
	return Slider;
})


