/**
 * @fileOverview test
 * @author amoschen
 * @version 1
 * Created: 12-11-28 下午2:44
 */
LBF.define('ui.Nodes.Textarea', function(require){
    var browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');

    var isIE = browser.msie,
        IEVerison = parseInt(browser.version, 10),
        isIE9 = isIE && IEVerison === 9,
        isIE9Below = isIE && IEVerison <= 9;

    /**
     * Base textarea component
     * @class Textarea
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
     * @param {String} [opts.value] Node's value
     * @param {String} [opts.className] Node's style
     * @param {Number} [opts.maxlength] Node's maxlength
     * @param {String} [opts.placeholder] Node's placeholder
     * @param {Boolean} [opts.readonly] Node is readonly or not
     * @param {Boolean} [opts.disabled] Node is disabled or not
     * @example
     *      new Textarea({
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
     *      new Textarea({
     *          selector: 'textarea[name=abc]',
     *          value: 'hello',
     *          readonly: true,
     *          disabled: true
     *      });
     */
    var Textarea = Node.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            '$textarea': 'textarea',
            '$placeholder': '.lbf-textarea-placeholder'
        },

        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
		events: {
			'focus textarea': '_textareaFocus',
			'blur textarea': '_textareaBlur',
			'mouseover textarea': '_textareaMouseenter',
			'mouseout textarea': '_textareaMouseleave',
			'cut textarea': '_textareaPropertychange',
			'paste textarea': '_textareaPropertychange',
			'keyup textarea': '_textareaPropertychange',

			'propertychange textarea': '_update',
			'keyup textarea': '_update'
		},

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var selector = this.get('selector'),
                placeholder = this.get('placeholder'),
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(this.get('selector')){
                if ($selector.parent().is('.lbf-textarea')) {

                    // 无跳动结构
                    //doing nothing
                } else {

                    // 二次渲染
                    $selector.wrap('<div class="lbf-textarea"></div>');
                }

                // 增加placeholder结构
                if(!$selector.next().is('.lbf-textarea-placeholder')){
                    $selector.after(this.$('<label class="lbf-textarea-placeholder">' + placeholder + '</label>'));
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
            this.get('value') && this.$textarea.val(this.get('value'));

			// maxlength property
            if(this.get('maxlength')){
                this.prop('maxlength', this.get('maxlength'));
                this.$textarea.val((this.$textarea.val() + '').substr(0, this.get('maxlength')));

            }

			// 设置placeholder
            this._setPlaceholder();

            // readonly property
            this.get('readonly') && this.readonly(true);

            // disabled property
            this.get('disabled') && this.disable();

            return this;
        },

        /**
         * Setter and getter of node's property, including some cross-browser solutions.
         * @method prop
         * @param {String} property Property name
         * @param {String|Number|Boolean} value Property value
         * @chainable
         * @example
         *      node.prop('maxlength', 200);
         *
         * @example
         *      node.prop('placeholder', 'default tip when empty');
         */
        prop: function(property, value){
            if(property === 'placeholder'){
                // get prop
                if(typeof value === 'undefined'){
                    return this.$textarea.prop(property) || this.$placeholder.text();
                }

                // set prop
                this.placeholder(value);
                return this;
            }

            if(property === 'maxlength'){
                // get prop
                if(typeof value === 'undefined'){
                    return this.$textarea.prop(property) || this.data('maxlength');
                }

                // set prop
                this._setMaxlength(value);
                return this;
            }

            return Node.prototype.prop.apply(this, arguments);
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            this.removeClass('lbf-textarea-disabled');
            this.$textarea.prop('disabled', false);

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            this.addClass('lbf-textarea-disabled');
            this.$textarea.prop('disabled', true);

            return this;
        },

        readonly: function(flag){
            this.trigger('readonly', [this]);

            if(flag){
                this.$textarea.prop('readonly', true);
                this.set('readonly', true);
            }else{
                this.$textarea.prop('readonly', false);
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

            this.addClass('lbf-textarea-error');
            return this;
        },

        /**
         * Clear error style
         * @method clearError
         * @chainable
         */
        clearError: function(){
            this.trigger('clearError', [this]);

            this.removeClass('lbf-textarea-error');
            return this;
        },

        /**
         * Remove not only the node itself, but the whole wrap including placeholder label
         * @method remove
         * @chainable
         */
        remove: function(){
            if (this.$placeholder && this.$placeholder.length) {
                this.$placeholder.remove();
            }
            return Node.prototype.remove.apply(this, arguments);
        },

        /**
         * Count content string's length
         * @method count
         * @return {Number} Length of content string
         * @example
         *      node.count(); // returns value string's length
         */
        count: function(){
            return (this.$textarea.val() || '').length;
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
                this.$textarea.val(arguments[0]);

                return this;
            }else{
                return this.$textarea.val();
            }
        },

        /**
         * Prepend text
         * @method prepend
         * @param {String} text Text to be prepended
         * @chainable
         */
        prepend: function(text){
            return this.$textarea.val(text + this.$textarea.val());
        },

        /**
         * Append text
         * @method append
         * @param {String} text Text to be appended
         * @chainable
         */
        append: function(text){
            return this.$textarea.val(this.$textarea.val() + text);
        },

        /**
         * Insert text to assigned position
         * @method insert
         * @param {Number} position Position to insert text
         * @param {String} text Text to be inserted
         * @chainable
         */
        insert: function(position, text){
            var str = this.val(),
                str1 = str.slice(0, position),
                str2 = str.slice(position, str.length);

            this.val(str1 + text + str2);

            return this;
        },

        /**
         * Focus the textarea
         * @method _textareaFocus
         * @protected
         * @chainable
         */
        _textareaFocus: function(){
            this.clearError();

            if(!this.$textarea.prop('disabled')){
                this.addClass('lbf-textarea-focus');
            }
        },

        /**
         * Blur the textarea
         * @method _textareaBlur
         * @protected
         * @chainable
         */
        _textareaBlur: function(e){
            var ret = this.get('validate').apply(this, [e, this.val()]);

            if(ret){
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

            this.removeClass('lbf-textarea-focus');
        },

        /**
         * Mouseenter the textarea
         * @method _textareaMouseenter
         * @protected
         * @chainable
         */
        _textareaMouseenter: function(){
            if(!this.$textarea.prop('disabled')){
                this.addClass('lbf-textarea-hover');
            }
        },

        /**
         * Mouseleave the textarea
         * @method _textareaMouseleave
         * @protected
         * @chainable
         */
        _textareaMouseleave: function(){
            this.removeClass('lbf-textarea-hover');
        },

        /**
         * Propertychange the textarea
         * @method _textareaPropertychange
         * @protected
         * @chainable
         */
        _textareaPropertychange: function(){
            isIE9 && this.$textarea.trigger('propertychange');
        },

		_update: function(){
			var $textarea = this.$textarea,
				$placeholder = this.$placeholder;

			if($textarea.val() === ''){
				$placeholder
					.show();
				return;
			}

			$placeholder.hide();
		},

        /**
         * Set placeholder property
         * @method _setPlaceholder
         * @private
         * @param {String} placeholder
         * @chainable
         */
        _setPlaceholder: function(placeholder){
            var node = this,
                $placeholder = this.$placeholder;

            // new placeholder
            var $textarea = this.$textarea;

            if(this.val() !== ''){
                $placeholder.hide();
            }

            $placeholder
                .click(function(){
                        $textarea.focus();
                });

            setTimeout(function(){
                node._update();

                //如果是container方式，还需要以下处理
                //先调整好位置再展示，不让placeholder发生抖动
                if(node.get('container')) {
                    $placeholder.appendTo(node.$el);
                }
            }, 0);

            //this.bind('input propertychange change focus', update);

            return this;
        },

        /**
         * Set maxlength property. For early version of IE and opera, manually limit string length
         * @method _setMaxlength
         * @param {Number} maxlength
         * @private
         * @chainable
         */
        _setMaxlength: function(maxlength){
            // ie10以下不支持textarea的maxlength
			//chrome对maxlength的支持有点错误，换行会当成2个字符算;
            if(browser.mozilla || isIE && !isIE9Below){
                this.$textarea.prop('maxlength', maxlength);
                return this;
            }

            // new placeholder
            var node = this,
                substr = function(){
                    var str = node.$textarea.val() + ''; // in case node.val() returns number
                    str.length > maxlength && node.$textarea.val(str.substr(0, maxlength));
                };

			if(isIE && isIE9Below) {
				node.$textarea
					.data('maxlength', maxlength)
					.bind('input propertychange keyup', substr);

			//chrome下设置maxlength后，输入最后一个文字时，拼音只能输入一个字母就不能输入了;
			} else {
				node.$textarea
					.data('maxlength', maxlength)
					.bind('blur change', substr);
			}

            return this;
        }
    });

    Textarea.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='textarea'] Selector of node
         * @param {Object} [opts] options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = Textarea.renderAll();
         *
         * @example
         *      var nodeArray = Textarea.renderAll('.textarea');
         *
         * @example
         *      var nodeArray = Textarea.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = Textarea.renderAll('.textarea', {
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'textarea';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;
            if(selector.nodeType || selector.length || typeof selector === 'string'){
                opts = opts || {};
            } else if(selector.$textarea){
                selector = selector.$textarea;
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

			//textarea结构模板
            wrapTemplate: [
                '<span class="lbf-textarea">',
                    '<textarea hideFocus="true" maxlength="<%==maxlength%>"></textarea>',
                    '<label class="lbf-textarea-placeholder"><%==placeholder%></label>',
                '</span>'
            ].join(''),

			//textarea定制样式名
            className: '',

            width: false,

            height: false,

			//textarea值
            value: '',

			//textarea的placeholder
            placeholder: '',

			//是否textarea状态
            readonly: false,

			//是否textarea状态
            disabled: false,

			//校验规则
            validate: function(){},

            events: {
                blur: function(){
                    this.validate();
                },

                error: function(){
                    this.error();
                }
            }
        }
    });

    return Textarea;
});
