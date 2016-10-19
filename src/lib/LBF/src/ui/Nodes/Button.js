/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-23 上午10:35
 */

LBF.define('ui.Nodes.Button', function(require){
    var browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');

    var TEXT = '按钮';

    /**
     * Base button component
     * @class Button
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Array} [opts.templates] Array of templates for normal, stress and weak type of button
     * @param {String} [opts.name] Form name
     * @param {String} [opts.id] Form id
     * @param {String} [opts.className] Button style
     * @param {String} [opts.content] Button text
     * @param {String} [opts.sort] Button sort (default|primary|info|success|warning|danger|link)
     * @param {String} [opts.size] Button size (mini|small|normal|large|huge)
     * @param {String} [opts.disabled] Button disabled
     * @param {Object} [opts.events] Button events to be bound
     * @example
     *      new Button({
     *          container: 'someContainerSelector',
     *          content: 'i\'m a button',
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *
     *              mouseover: function(){
     *                  alert('over me');
     *              }
     *          }
     *      });
     *
     * @example
     *      new Button({
     *          selector: 'someButtonSelector',
     *          events: {
     *              click: function(){
     *                  alert('click');
     *              }
     *          }
     *      });
     */
    var Button = Node.inherit({
        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var selector = this.get('selector'),
                wrapTemplate = this.wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(selector){
                !$selector.is('.lbf-button') && $selector.addClass('lbf-button');

                // 无抖动
                this.setElement(selector);
            } else {

                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));

                // 设置ID
                this.get('id') && this.prop(this.get('id'));

                this.$el.appendTo(this.get('container'));
            }

            // set name
            this.get('name') && this.prop(this.get('name'));

            // set className
            this.get('className') && this.addClass(this.get('className'));

            // set sort
            this.addClass('lbf-button-' + this.get('sort'));

            // set size
            this.addClass('lbf-button-' + this.get('size'));

            // set block
            this.get('block') && this.addClass('lbf-button-block');

            // disabled property
            this.get('disabled') && this.disable();

            return this;
        },

        /**
         * Show button.
         * Button is div and original show will set display to block and cause style bug
         * @method show
         * @chainable
         */
        show: function(){
            var that = this;

            if(browser.msie && parseInt(browser.version, 10) < 8){
                if(that.prop('disabled')){
                    this._clone.css('display', 'inline');
                    return this;
                }

                this.$el.css('display', 'inline');

                return this;
            }else{
                if(that.prop('disabled')){
                    this._clone.css('display', 'inline-block');
                   return this;
                }

                this.$el.css('display', 'inline-block');

                return this;
            }
        },

        /**
        * Hide button.
        * @method Hide
        * @chainable
        */
        hide: function(){
            if(this.prop('disabled')){
                this._clone.css('display', 'none');
                return this;
            }

            this.$el.css('display', 'none');

            return this;
        },

        /**
         * Disable the button
         * @method disable
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            if(!this._clone){
                var clone = this._clone = this.clone();
                this.$el.after(clone);
            }

            this._clone
                .prop('disabled', 'disabled')
                .css('display', '')
                .addClass('lbf-button-disabled');

            this
                .prop('disabled', 'disabled')
                .addClass('lbf-button-disabled')
                .css('display', 'none');

            return this;
        },

        /**
         * Enable the button
         * @method enable
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            if(this._clone){
                this._clone
                    .hide()
                    .prop('disabled', '')
                    .removeClass('lbf-button-disabled');
            }

            this
                .prop('disabled', '')
                .removeClass('lbf-button-disabled')
                .$el.show();

            return this;
        }
    });

    Button.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='input[type=button],input[type=submit],button'] Selector of nodes to be rendered
         * @param {Object} [opts] Options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = Button.renderAll();
         *
         * @example
         *      var nodeArray = Button.renderAll('.button');
         *
         * @example
         *      var nodeArray = Button.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = Button.renderAll('.button', {
         *          //options
         *          events: {
         *              error: function(){
         *                  alert('hello');
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'input[type=button], input[type=submit], button';

            var nodes = [],
                Class = this,
                $ = this.prototype.$;

            if(selector.nodeType || typeof selector.length !== 'undefined' || typeof selector === 'string'){
                opts = opts || {};
            } else if(selector.$el){
                selector = selector.$el;
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

			//按钮结构模板
            wrapTemplate: '<div class="lbf-button"><%== content %></div>',

			//按钮Id
            id: false,

            //按钮名称，用于表单
            name: false,

			//按钮定制样式名
            className: '',

            //按钮文案
            content: TEXT,

            //按钮种类
            sort: 'default', //default|primary|info|success|warning|danger|link

            //按钮尺寸
            size: 'normal', //mini|small|default|large|huge

            //按钮初始是否不可用
            disabled: false,

            //按钮初始是否block状态
            block: false
        }
    });

    return Button;
});
