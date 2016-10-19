/**
 * @fileOverview
 * @author ranszhang
 * @version 1
 * Created: 13-12-20 上午9:35
 */
LBF.define('ui.widget.Slider.Slider', function(require){
    var Node = require('ui.Nodes.Node'),
        DragDrop = require('ui.Plugins.DragDrop'),
		extend = require('lang.extend');

    /**
     * Base slider component
     * @class Slider
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Number} [opts.step] 间隔数值
     * @param {Number} [opts.min] slider最小值
     * @param {Number} [opts.max] slider最大值
     * @param {Object} [opts.events] Node's events
     * @param {Function} [opts.events.load] Triggered when the slider is created.
     * @param {Function} [opts.events.beforeSlide] Triggered when the user starts sliding.
     * @param {Function} [opts.events.slide] Triggered on every mouse move during slide
     * @param {Function} [opts.events.afterSlide] Triggered after the user slides a handle.
     * @param {Function} [opts.events.unload] Triggered when the slider is remove.
     * @param {Function} [opts.orientation] slide方向，分别为[horizontal, vertical]
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes.
     * @param {String} [opts.range] 是否开启选择区间模式
     * @param {String} [opts.disabled] 初始控件是否可拖拽
     * @example
     *    var slider = new Slider({
     *         //slector: null,
     *         container: '#container-lbf-slider-horizontal',
     *         step: 100,
     *         max: 10000,
     *         min: 5000,
     *         orientation: 'horizontal',
     *         range: true,
     *         events: {
     *             load: function(){
     *                 console.log('load');
     *             },
     *             beforeSlide: function(e, slide){
     *                 //console('beforeSlide');
     *             },
     *             slide: function(e, slider){
     *                 $('#container-lbf-slider-horizontal-val').html(slider.val()[0] + ' - ' + slider.val()[1]);
     *             },
     *             afterSlide: function(e, slide){
     *                 //console('afterSlide');
     *             },
     *             unload: function(){
     *                 console.log('unload')
     *             }
     *         }
     *     });
     *     slider.val([6000, 9000]);
     *     slider.remove();
     */
    var Slider = Node.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
		elements: {
            '$range': '.lbf-slider-range',
            '$handleMin': '.lbf-slider-handle-min',
			'$handleMax': '.lbf-slider-handle-max'
        },

        /**
         * Render panel and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var node = this,
                wrapTemplate = node.template(node.get('wrapTemplate')),
                container =  node.get('container'),
				$el;

			node.$container = node.$(container);
			node.orientation = node.get('orientation');
			node.range = node.get('range');
			node.disabled = node.get('disabled');

			//应用模板
            $el = node.$(wrapTemplate({
                orientation: node.orientation,
                range: node.range
            }));

			//Set node's $el. $el is the base of a node ( UI component )
            node.setElement($el);

			//组件显示在指定容器
            node.$container.append($el);

			//初始化handle、绑定拖拽、初始值
			node._initHandles();

            return this;
        },

		/**
         * init handles
         * @method _initHandles
         * @chainable
         */
		_initHandles: function(){
			var node = this;

			if(!node.range){
				node.$handleMin.hide();
			}

			//初始handle拖拽范围
			if(node.orientation === 'horizontal'){
				node.areaMin = node.areaMax = {
					top: node.$handleMin.outerHeight(),
					left: 0,
					bottom: node.$handleMin.outerHeight(),
					right: node.$el.width() + node.$handleMin.outerWidth()
				};
			}else{
                node.areaMin = node.areaMax = {
					top: 0,
					left: node.$handleMin.outerWidth(),
					bottom: node.$el.height() + node.$handleMin.outerHeight(),
					right: node.$handleMin.outerWidth()
				};
			}

            //初始化handle min
            this._setHandleMin();

            //初始化handle max
            this._setHandleMax();
		},

		_setHandleMin: function(){
            var node = this;

            //new Node对selector的唯一性是强要求？
            var oriMinLeft, oriMinWidth, oriMinTop, oriMinHeight;
            node.$handleMinNode = new Node(node.$container.find('.lbf-slider-handle-min'));
            node.$handleMinNode.plug(DragDrop, {

                stickOnTrack: node.orientation === 'horizontal' ? 'x' : 'y',

                events: {
                    beforeDrag: function(e, dd, x, y, left, top){
                        node.trigger('beforeSlide', [node]);

                        dd.$el.addClass('lbf-slider-handle-focus');

                        if(node.orientation === 'horizontal'){
                            oriMinLeft = left;
                            oriMinWidth = node.$range.width();
                        }else{
                            oriMinTop = top;
                            oriMinHeight = node.$range.height();
                        }
                    },
                    drag: function(e, dd, x, y, left, top){
                        if(node.orientation === 'horizontal'){
                            node.$range.css({
                                left: left,
                                width: oriMinWidth - (left - parseInt(oriMinLeft, 10))
                            });
                        }else{
                            node.$range.css({
                                top: top,
                                height: oriMinHeight - (top - parseInt(oriMinTop, 10))
                            });
                        }

                        node.trigger('slide', [node]);
                    },
                    afterDrop: function(e, dd, x, y, left, top){
                        dd.$el.removeClass('lbf-slider-handle-focus');

                        if(node.orientation === 'horizontal'){
                            node.areaMax = {
                                top: node.$handleMax.outerHeight(),
                                left: left,
                                bottom: node.$handleMax.outerHeight(),
                                right: node.$el.width() + node.$handleMax.outerWidth()
                            };
                        }else{
                            node.areaMax = {
                                top: top,
                                left: node.$handleMax.outerWidth(),
                                bottom: node.$el.height() + node.$handleMax.outerHeight(),
                                right: node.$handleMax.outerWidth()
                            };
                        }

                        node.$handleMaxNode.setDragArea(node.areaMax);

                        node.trigger('afterSlide', [node]);
                    }
                }
            });
            node.$handleMinNode.setDragArea(node.areaMin);
		},

        _setHandleMax: function(){
            var node = this;

            //new Node对selector的唯一性是强要求？
			node.$handleMaxNode = new Node(node.$container.find('.lbf-slider-handle-max'));
			node.$handleMaxNode.plug(DragDrop, {

                stickOnTrack: node.orientation === 'horizontal' ? 'x' : 'y',

				events: {
					beforeDrag: function(e, dd){
						dd.$el.addClass('lbf-slider-handle-focus');

                        node.trigger('beforeSlide', [node]);
					},
					drag: function(e, dd, x, y, left, top){
						if(node.orientation === 'horizontal'){
							node.$range.css({
								width: left - parseInt(node.$handleMinNode.$el.css('left'), 10)
							});
						}else{
							node.$range.css({
								height: top - parseInt(node.$handleMinNode.$el.css('top'), 10)
							});
						}

						node.trigger('slide', [node]);
					},
					afterDrop: function(e, dd, x, y, left, top){
						dd.$el.removeClass('lbf-slider-handle-focus');

						if(node.orientation === 'horizontal'){
							node.areaMin = {
								top: node.$handleMin.outerHeight(),
								left: 0,
								bottom: node.$handleMin.outerHeight(),
								right: left + node.$handleMin.outerWidth()
							};
						}else{
							node.areaMin = {
								top: 0,
								left: node.$handleMin.outerWidth(),
								bottom: top + node.$handleMin.outerHeight(),
								right: node.$handleMin.outerWidth()
							};
						}

						node.$handleMinNode.setDragArea(node.areaMin);

                        node.trigger('afterSlide', [node]);
					}
				}
			});
			node.$handleMaxNode.setDragArea(node.areaMax);
        },

        /**
         * get value
         * @method val
         * @chainable
         */
        val: function(val){
            if(typeof(val) == 'undefined'){
                if(this.$handleMin.css('display') === 'none'){
                    return this._val();
                }else{
                    return this._vals();
                }
            }else{
                if(typeof(val) == 'number'){
                    return this._val(val);
                }else{
                    return this._vals(val);
                }
            }
        },

		/**
         * get value
         * @method _val
         * @chainable
         */
		_val: function(val){
			var length, range, value;

            if(this.orientation === 'horizontal'){
                range = this.$range.width();
                length = this.$el.width();
            }else{
                range = this.$range.height();
                length = this.$el.height();
            }

            //取值
            if(typeof(val) == 'undefined'){

                if(length === range){
                    value = this.get('max');
                }else if(0 === range){
                    value = this.get('min');
                }else{
                    value = this.get('min') + Math.floor((( range / length ) * (this.get('max') - this.get('min'))));
                }

                return value;

            //赋值
            }else{
                value = ((val - this.get('min')) / (this.get('max') - this.get('min'))) * length;

                if(this.orientation === 'horizontal'){
                    this.$range.width(value);
                    this.$handleMax.css('left', value);
                }else{
                    this.$range.height(value);
                    this.$handleMax.css('top', value);
                }

                this.trigger('slide', [this]);

                return this;
            }
		},

		/**
         * get value
         * @method _vals
         * @chainable
         */
		_vals: function(val){
			var length, min, max, value = [], valueMin, valueMax;

			if(this.orientation === 'horizontal'){
				min = parseInt(this.$range.css('left'));
				max = this.$range.width() + parseInt(this.$range.css('left'));
				length = this.$el.width();
			}else{
				min = parseInt(this.$range.css('top'));
				max = this.$range.height() + parseInt(this.$range.css('top'));
				length = this.$el.height();
			}

            //取值
            if(typeof(val) == 'undefined'){
                if(length === min){
                    value.push(this.get('max'));
                }else if(0 === min){
                    value.push(this.get('min'));
                }else{
                    value.push(this.get('min') + Math.floor((( min / length ) * (this.get('max') - this.get('min')))));
                }

                if(length === max){
                    value.push(this.get('max'));
                }else if(0 === max){
                    value.push(this.get('min'));
                }else{
                    value.push(this.get('min') + Math.floor((( max / length ) * (this.get('max') - this.get('min')))));
                }

                return value;

            //赋值
            }else{
                valueMin = ((val[0] - this.get('min')) / (this.get('max') - this.get('min'))) * length;
                valueMax = ((val[1] - this.get('min')) / (this.get('max') - this.get('min'))) * length;

                if(this.orientation === 'horizontal'){
                    this.$handleMin.css('left', valueMin);
                    this.$range.css('left', valueMin);
                    this.$range.width(valueMax - valueMin);
                    this.$handleMax.css('left', valueMax);

                    this.areaMin = {
                        top: this.$handleMin.outerHeight(),
                        left: 0,
                        bottom: this.$handleMin.outerHeight(),
                        right: valueMax + this.$handleMin.outerWidth()
                    };
                    this.areaMax = {
                        top: this.$handleMin.outerHeight(),
                        left: valueMin,
                        bottom: this.$handleMin.outerHeight(),
                        right: this.$el.width() + this.$handleMin.outerWidth()
                    };

                    this.$handleMinNode.setDragArea(this.areaMin);
                    this.$handleMaxNode.setDragArea(this.areaMax);
                }else{
                    this.$handleMin.css('top', valueMin);
                    this.$range.css('top', valueMin);
                    this.$range.height(valueMax - valueMin);
                    this.$handleMax.css('top', valueMax);

                    this.areaMin = {
                        top: 0,
                        left: this.$handleMin.outerWidth(),
                        bottom: valueMax + this.$handleMin.outerHeight(),
                        right: this.$handleMin.outerWidth()
                    };
                    this.areaMax = {
                        top: valueMin,
                        left: this.$handleMin.outerWidth(),
                        bottom: this.$el.height() + this.$handleMin.outerHeight(),
                        right: this.$handleMin.outerWidth()
                    };

                    this.$handleMinNode.setDragArea(this.areaMin);
                    this.$handleMaxNode.setDragArea(this.areaMax);
                }

                this.trigger('slide', [this]);

                return this;
            }
		},

		/**
         * disable slider
         * @method disable
         * @chainable
         */
        /*
		disable: function(){
			this.disabled = true;
			this.$handleMin.addClass('lbf-slider-handle-disabled');
			this.trigger('disable', [this]);
			return this;
		},
		*/
		/**
         * enable slider
         * @method enable
         * @chainable
         */
        /*
		enable: function(){
			this.disabled = false;
			this.$handleMin.removeClass('lbf-slider-handle-disabled');
			this.trigger('enable', [this]);
			return this;
		},
		*/

		/**
         * Remove state
         * @method remove
         * @chainable
         */
		remove: function(){
            this.superclass.prototype.remove.apply(this, arguments);
			this.trigger('remove', [this]);
			return this;
		}
    });

    Slider.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

			//模板
            wrapTemplate: [
                '<div class="lbf-slider lbf-slider-<%=orientation%>">',
                    '<div class="lbf-slider-range"></div>',
                    '<a href="javascript:;" class="lbf-slider-handle lbf-slider-handle-min"></a>',
                    '<a href="javascript:;" class="lbf-slider-handle lbf-slider-handle-max"></a>',
                '</div>'
            ].join(''),

            //Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
            selector: null,

            //Container of node
            container: null,

            //Determines the size or amount of each interval or step the slider takes between the min and max
			step: 10,

            //The minimum value of the slider.
			min: 0,

            //The maximum value of the slider.
			max: 100,

            //Determines whether the slider handles move horizontally (min on left, max on right) or vertically (min on bottom, max on top). Possible values: "horizontal", "vertical".
            orientation: 'horizontal',

            //Whether the slider represents a range.
            range: false

			//disabled: false
        }
    });

    return Slider;
});
