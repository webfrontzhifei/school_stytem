/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-27 下午6:59
 */
LBF.define('ui.Nodes.TextInput', function(require){
    var forEach = require('lang.forEach'),
        browser = require('lang.browser'),
        isArray = require('lang.isArray'),
        Node = require('ui.Nodes.Node');

    var isIE = browser.msie,
        IEVerison = parseInt(browser.version, 10),
        isIE9 = isIE && IEVerison === 9;

    /**
     * Base text input component
     * @class TextInput
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object} [opts.events] Node's events
     * @param {Function} [opts.events.error] Node will trigger an error event when checkbox's value fails the validate. Error event is bound inside a change event.
     * @param {Function} [opts.validate] Validate for value changes. If validation fails, error will be triggered.
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes.
     * @param {String} [opts.name] Form name
     * @param {Number} [opts.width] Node's width
     * @param {Number} [opts.height] Node's height
     * @param {String} [opts.value] Node's value
     * @param {Number} [opts.maxlength] Node's maxlength
     * @param {String} [opts.placeholder] Node's placeholder
     * @param {Boolean} [opts.readonly] Node is readonly or not
     * @param {Boolean} [opts.disabled] Node is disabled or not
     * @example
     *      new TextInput({
     *          container: 'someContainerSelector',
     *          disabled: true,
     *          maxlength: 100,
     *          placeholder: 'i am placeholder',
     *          validate: function(event, value){
     *              if(!value){
     *                  return new Error('empty is not allowed');
     *              }
     *          },
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *              error: function(e, validateResult){
     *                  // handle error
     *                  alert(validateResult.message);
     *              }
     *          }
     *      });
     *
     * @example
     *      new TextInput({
     *          selector: 'input[name=abc]',
     *          value: 'hello',
     *          readonly: true,
     *          disabled: true
     *      });
     */
    var TextInput = Node.inherit({
		/**
         * 缓存，快捷访问，this.$element
         */
        elements: {
            '$input': 'input',
            '$placeholder': '.lbf-text-input-placeholder'
        },

        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
		events: {
			'focus input': '_inputFocus',
			'blur input': '_inputBlur',
			'mouseenter input': '_inputMouseenter',
			'mouseleave input': '_inputMouseleave',
			'cut input': '_inputPropertychange',
			'paste input': '_inputPropertychange',
			'keyup input': '_inputPropertychange'
		},

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var input = this,
                selector = this.get('selector'),
                placeholder = this.get('placeholder'),
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(this.get('selector')){
                if ($selector.parent().is('.lbf-text-input')) {

                    // 无跳动结构
                    //doing nothing
                } else {

                    // 二次渲染
                    $selector.wrap('<div class="lbf-text-input"></div>');
                }

                // 增加placeholder结构
                if(!$selector.next().is('.lbf-text-input-placeholder')){
                    $selector.after(this.$('<label class="lbf-text-input-placeholder">' + placeholder + '</label>'));
                }

                this.setElement($selector.parent());

                this.set('placeholder', $selector.next().text());
            } else {

                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

			// set className
            this.get('className') && this.addClass(this.get('className'));

            // width property
            this.get('width') && this.width(this.get('width'));

            // height property
            this.get('height') && this.height(this.get('height'));

            // set name
            this.get('name') && this.prop(this.get('name'));

            // value property
            this.get('value') && this.val(this.get('value'));

            // maxlength property
            if(this.get('maxlength')){
                this.$input.attr('maxlength', this.get('maxlength'));
                this.$input.val((this.val() + '').substr(0, this.get('maxlength')));
            }

            // 设置placeholder
            this._setPlaceholder();

            // readonly property
            this.get('readonly') && this.readonly(true);

            // disabled property
            this.get('disabled') && this.disable();

            if( this.get('validate') ){
                var validations = this.get('validate');
                !isArray( validations ) && (validations = [validations]);

                forEach(validations, function(v){
                    input.addValidate( v );
                });
            }

            return this;
        },

        /*
         * 向前兼容，追歼废除，用 placeholder() 来代替
         */
        prop: function(property, value){
            if(property === 'placeholder'){
                // get prop
                if(typeof value === 'undefined'){
                    return this.$input.prop('placeholder') || this.$placeholder.text();
                }

                // set prop
                this.placeholder(value);
                return this;
            }

            this.$input.prop.apply(this, arguments);

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            this.removeClass('lbf-text-input-disabled');
            this.$input.prop('disabled', false);
            this.set('disabled', false);

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            this.addClass('lbf-text-input-disabled');
            this.$input.prop('disabled', true);
            this.set('disabled', true);

            return this;
        },

        readonly: function(flag){
            this.trigger('readonly', [this]);

            if(flag){
                this.$input.prop('readonly', true);
                this.set('readonly', true);
            }else{
                this.$input.prop('readonly', false);
                this.set('readonly', false);
            }

            return this;
        },


        /**
         * Show error style
         * @method error
         * @chainable
         */
        error: function(){
            this.trigger('error', [this]);

            this.addClass('lbf-text-input-error');

            return this;
        },

        /**
         * Clear error style
         * @method clearError
         * @chainable
         */
        clearError: function(){
            this.trigger('clearError', [this]);

            this.removeClass('lbf-text-input-error');

            return this;
        },

        /**
         * Count content string's length
         * @method count
         * @return {Number} Length of content string
         * @example
         *      node.count(); // returns value string's length
         */
        count: function(){
            return (this.val() || '').length;
        },

        /**
         * modify placeholder
         * @method placeholder
         */
        placeholder: function(placeholder){
            this.$placeholder.text(placeholder);
        },

        /**
         * get or set value
         * @method val
         */
        val: function(){
            if(arguments.length === 1){
                this.value(arguments[0]);

                return this;
            }else{
                return this.value();
            }
        },

        /**
         * get or set value
         * @method value
         */
        value: function(){
            if(arguments.length === 1){
                this.$input.val(arguments[0]);

                return this;
            }else{
                return this.$input.val();
            }
        },

        /**
         * Remove not only the node itself, but the whole wrap including placeholder label
         * @method remove
         * @chainable
         */
        remove: function(){
            this.trigger('remove', [this]);

            this.$placeholder.remove();
            return Node.prototype.remove.apply(this, arguments);
        },

        /**
         * Focus the input
         * @method _inputFocus
         * @protected
         * @chainable
         */
        _inputFocus: function(){
            this.clearError();
            !this.get('disabled') && this.addClass('lbf-text-input-focus');
        },

        /**
         * Blur the input
         * @method _inputBlur
         * @protected
         * @chainable
         */
        _inputBlur: function(e){
            var ret = this.validate( this.attributes() );

            if(!ret){
                this.error();

                /**
                 * Fire when check state changed and failed validation
                 * @event error
                 * @param {Event} JQuery event
                 * @param {Error} Validation result
                 */
                this.trigger('error', [ret]);
            } else {
                this.clearError();
                this.trigger('success', [ret]);
            }

            this.removeClass('lbf-text-input-focus');
        },

        /**
         * Mouseenter the input
         * @method _inputMouseenter
         * @protected
         * @chainable
         */
        _inputMouseenter: function(){
            this.addClass('lbf-text-input-hover');
        },

        /**
         * Mouseleave the input
         * @method _inputMouseleave
         * @protected
         * @chainable
         */
        _inputMouseleave: function(){
            this.removeClass('lbf-text-input-hover');
        },

        /**
         * Propertychange the input
         * @method _inputPropertychange
         * @protected
         * @chainable
         */
        _inputPropertychange: function(){
            isIE9 && this.$input.trigger('propertychange');
        },

        /**
         * Set placeholder property. For early version of IE, use label to simulate placeholder
         * @method _setPlaceholder
         * @private
         * @param placeholder
         * @chainable
         */
        _setPlaceholder: function(placeholder){
            var node = this,
                $placeholder = this.$placeholder;

            // new placeholder
            var $input = this.$input,
                update = function(){
                    if($input.val() === ''){
                        $placeholder
                            .show();
                        return;
                    }

                    $placeholder.hide();
                };

            if(this.val() !== ''){
                $placeholder.hide();
            }

            $placeholder
                .click(function(){
                    $input.focus();
                });

            setTimeout(function(){
                update();

                //如果是container方式，还需要以下处理
                //先调整好位置再展示，不让placeholder发生抖动
                if(node.get('container')) {
                    $placeholder.appendTo(node.$el);
                }
            }, 0);

            this.bind('input propertychange change focus', update);

            return this;
        }
    });

    var proto = TextInput.prototype;

    forEach(['bind', 'unbind', 'trigger', 'val', 'focus', 'blur'], function(method){
        proto[method] = function(){
            var $input = this.$input,
                ret = this.$input[method].apply(this.$input, arguments);

            return ret === $input ? this : ret;
        };
    });

    TextInput.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='input[type=text], input[type=password], input[type=email], input[type=email], input[type=search], input[type=tel], input[type=url]'] Selector of node
         * @param {Object} opts options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = TextInput.renderAll();
         *
         * @example
         *      var nodeArray = TextInput.renderAll('.textinput');
         *
         * @example
         *      var nodeArray = TextInput.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = TextInput.renderAll('.textinput', {
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'input[type=text], input[type=password], input[type=email], input[type=email], input[type=search], input[type=tel], input[type=url]';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;
            if(selector.nodeType || selector.length || typeof selector === 'string') {
                opts = opts || {};
            } else if (selector.$input) {
                selector = selector.$input;
                opts = opts || {};
            } else {
                opts = selector || {};
                selector = SELECTOR;
            }

            opts._SELECTOR = opts.selector;

            $(selector).each(function(){
                if(!$(this).is(SELECTOR)){
                    return;
                }
                opts.selector = this;
                nodes.push(new Class(opts));
            });

            opts.selector = opts._SELECTOR;
            opts._SELECTOR = null;

            return nodes;
        },

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

			//input结构模板
            wrapTemplate: [
                '<span class="lbf-text-input">',
                    '<input type="<%==type%>" value="<%==value%>" hideFocus="true" />',
                    '<label class="lbf-text-input-placeholder"><%==placeholder%></label>',
                '</span>'
            ].join(''),

			//input定制样式名
            className: '',

            width: false,

			//input值
            value: '',

			//input的placeholder
            placeholder: '',

			//input的类型
            type: 'text',

			//是否readonly状态
            readonly: false,

			//是否disabled状态
            disabled: false,

			//校验规则
            validate: function(){},

            events: {
                blur: function(){

                },

                error: function(){

                }
            }
        }
    });

    return TextInput;
});
