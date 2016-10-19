/**
 * @fileOverview
 * @author seanxphuang
 * Created: 2016-01-07
 */
LBF.define('app.Controller', function(require, exports, module){
    var Class = require('lang.Core'),
        Attributes = require('util.Attribute'),
        jQuery = require('lib.jQuery'),
		proxy = require('lang.proxy'),
		isFunction = require('lang.isFunction');
		
	/**
	 * this.method = this.$el.method
	 * 给Controller的实例注入jQuery对象的方法
	 */
	var methods = {},
        fn = jQuery.fn;
		
    for(var methodName in fn){
        if(fn.hasOwnProperty(methodName)){
            (function(methodName){
                methods[methodName] = function(){
                    if(!this.$el){
                        this._setElement();
                    }

                    var result = this.$el[methodName].apply(this.$el, arguments);
                    return this.$el === result ? this : result;
                }
            })(methodName);
        }
    }

    delete methods.constructor;
	
	/**
	 * Controller类继承自methods、Attributes
	 */
    module.exports = Class.extend(methods, Attributes, {
		/**
		 * Controller类的初始化入口，用来执行一些内部的初始化逻辑
		 */
		_initialize: function(opts){
            var opts = opts || {};
            
			this._mergeOptions(opts);
			this._setElement(opts.el);
			
			this.initialize(opts);
			
			return this;
		},
		
        _mergeOptions: function(opts){
            var options = this.$.extend( true, {}, this.defaults, opts || (opts = {}) );

            this.set(options, {silent: true});
            return this;
        },

        _setElement: function(el){
            var el = el || this.get('el') || this.el || this.set('_isOriginalEl', true, {silent: true}) && '<div />',
				$el = this.$(el),
				className = this.get('className') || this.className;

            if(this.$el){
                this.$el.replaceWith($el);
            }

            this.$el = $el;
            this.el = $el.get(0);
			
            if(className) {
                this.$el.addClass(className);
            }

            this._initElements();

            this._initEvents();

            return this;
        },
		
		/**
		 * 绑定事件
		 */
        _initEvents: function(){
			var me = this,
				$ = this.$,
				events = $.extend({}, this.events, this.get('events'));
				
            if(!events){
                return this;
            }

            $.each(events, function(delegate, handler){
                var args = (delegate + '').split(' '),
                    eventType = args.shift(),
                    selector = args.join(' '),
					handler = me[handler];

                if($.trim(selector).length > 0){
					me.delegate(selector, eventType, me.proxy(handler, me));
                    return;
                }

                me.on(eventType, me.proxy(handler, me));
            });

            return this;
        },
		
		/**
		 * 查找Dom元素
		 */
        _initElements: function(){
            var $ = this.$,
				elements = $.extend({}, this.elements, this.get('elements'));

            if(elements){
                for(var name in elements){
                    if(elements.hasOwnProperty(name)){
                        this[name] = this.find(elements[name]);
                    }
                }
            }

            return this;
        },
		
		/**
		 * Controller类的默认参数设置
		 */
        defaults: {},
        
		/**
		 * 预留给Controller子类的初始化入口
		 */
        initialize: function(){},

        $: jQuery,
		
		/**
		 * 方法代理
		 */
		proxy: proxy,
		
		/**
         * Remove Controller.
         * @method remove
         * @chainable
         */
        remove: function(){
			//清除数据;
			this.clear();
			
			//解绑事件;
			this.off();
			
			//移除dom;
			this.$el.remove();
			
            return this;
        },
        
        /**
         * 判断用户是否传入el参数
         * @method isOriginalEl
         * @return Boolean
         */
		isOriginalEl: function(){
			return this.get('_isOriginalEl');
		},
		
		/**
		 * 附加插件
		 * @method plug
		 * 
		 */
		plug: function(Class, opts, methods){
			var me = this,
				plug = null,
				methods = methods || [],
				method = '';
				
			if(isFunction(Class)) {
				plug = new Class(opts);
			
				//透传方法到父级
				for(var i in methods) {
					method = methods[i];
					me[method] = me.proxy(method, plug);
				}
				
				//透传属性的变更到父级
				plug.on('change', function(e, attributes){
					me.set(attributes);
				});
			}
			
			return plug;
		},
		
		/**
		 * 延迟执行函数
		 * @method delay
		 * 
		 */
		delay: function (fn, times, me) {
			var me = me || this,
				times = times || 250;
				
			if (me.sleepid) {
				clearTimeout(me.sleepid);
			}
			
			me.sleepid = setTimeout(fn, times);
		}
    });
});