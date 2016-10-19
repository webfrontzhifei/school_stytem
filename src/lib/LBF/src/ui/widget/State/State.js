/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-13 下午5:35
 */
LBF.define('ui.widget.State.State', function(require){
    var Node = require('ui.Nodes.Node'),
        Popup = require('ui.Nodes.Popup'),
		proxy = require('lang.proxy'),
		extend = require('lang.extend');

    var State = Popup.inherit({
		/**
         * 缓存，快捷访问，this.$element
         */
		elements: {
            $close: '.lbf-state-close'
        },

		/**
         * 绑定元素默认行为
         */
		events: {
			'click .lbf-state-close': 'close'
		},

        /**
         * Render panel and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var state = this,
                $el;

            if(this.get('selector')) {
                $el = this.$(this.get('selector'));
                $el.addClass('lbf-state lbf-state-' + this.get('sort'));
				$el.data('sort', this.get('sort'));

                if(this.get('closeable') && !$el.find(':first-child').is('.lbf-state-close')){
                    $el.prepend($('<a href="javascript:;" class="lbf-state-close"></a>'));
                }
            } else {
                var wrapTemplate = this.template(this.get('wrapTemplate')),
                    title = this.get('title'),
                    content = this.get('content'),
                    $container = this.$container = this.$(this.get('container'));

                $el = this.$(wrapTemplate({
					sort: this.get('sort'),
                    title: this.get('title'),
                    content: this.get('content')
                }));

                //把结构放到container
                $container.append($el);
            }

            this.setElement($el);

			// set className
            this.get('className') && this.addClass(this.get('className'));

            return this;
        },

		/**
         * hide state
         * @method hide
         * @chainable
         */
		close: function(){
            var effect = this.get('hide').effect;

			effect.apply(this, arguments);
			this.trigger('close.State', [this]);
			return this;
		},

		/**
         * show state
         * @method show
         * @chainable
         */
		open: function(){
            var effect = this.get('show').effect;

			effect.apply(this, arguments);
			this.trigger('open', [this]);
			return this;
		},

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

    State.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Popup.settings, {

			//模板
            wrapTemplate: [
                '<div data-sort="<%=sort%>" class="lbf-state lbf-state-<%=sort%> <%=className%>">',
                    '<% if(closable){ %>',
                        '<a href="javascript:;" class="lbf-state-close"></a>',
                    '<% } %>',
                    '<strong class="lbf-state-title"><%=title%></strong>',
                    '<span class="lbf-state-content"><%=content%></span>',
                '</div>'
            ].join(''),

			//类型：default | info | warning | success | error
            sort: 'default',

			container: 'body',

			//业务样式
            className: '',

            show: {
                effect: function(){
                    this.show();
                }
            },

            hide: {
                effect: function(){
                    this.hide();
                }
            },

			//标题 或者 icon
            title: true,

			//内容
            content: true,

			//是否显示关闭按钮
			closeable: true
        })
    });

    return State;
});
