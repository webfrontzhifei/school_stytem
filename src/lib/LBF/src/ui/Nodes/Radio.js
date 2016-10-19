/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-12-5 上午11:04
 */
LBF.define('ui.Nodes.Radio', function(require){
    var inArray = require('lang.inArray'),
        proxy = require('lang.proxy'),
        browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');
    require('{theme}/lbfUI/css/Radio.css');

    var isIE6 = browser.msie && parseInt(browser.version, 10) < 7;

    /**
     * Base radio component
     * @class Radio
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @beta
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object} [opts.events] Node's events
     * @param {Function} [opts.events.error] Node will trigger an error event when radio's value fails the validate. Error event is bound inside a change event.
     * @param {Function} [opts.validate] Validate for value changes. If validation fails, error will be triggered.
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes.
     * @param {String} [opts.name] Form name
     * @param {String} [opts.label] Node's label
     * @param {Boolean} [opts.checked] State of radio
     * @param {Boolean} [opts.disabled] Disability of radio
     * @example
     *      new Radio({
     *          container: '#someContainer',
     *          checked: true,
     *          disabled: true,
     *          validate: function(event, checkState){
     *              if(!checkState){
     *                  return new Error('must be checked');
     *              }
     *          },
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *              error: function(){
     *                  alert('error');
     *              }
     *          }
     *      });
     */
    var Radio = Node.inherit({
        elements: {
            $input: 'input[type=radio]'
        },

        events: {
            click: '_onClick',
            mousein: '_onMouseIn',
            mouseout: '_onMouseOut',
            checked: '_onChecked',
            disable: '_onDisable',
            enable: '_onEnable',
            'change input[type=radio]': '_onChange'
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var wrapTemplate = this.wrapTemplate = this.template(this.get('wrapTemplate')),
                $el;

            if(this.get('selector')){
                var $oEl = this.$(this.get('selector'));

                $oEl.prop('id') && this.set('value', $oEl.prop('id'));
                $oEl.prop('name') && this.set('value', $oEl.prop('name'));
                $oEl.prop('className') && this.set('value', $oEl.prop('className'));
                $oEl.prop('disabled') && this.set('value', $oEl.prop('disabled'));
                $oEl.prop('value') && this.set('value', $oEl.prop('value'));

                $el = this.jQuery(wrapTemplate(this.attributes()));

                $oEl.replaceWith($el);

            } else {
                $el = this.jQuery(wrapTemplate(this.attributes()));
                $el.appendTo(this.get('container'));
            }

            this.setElement($el);

            return this;
        },

        /**
         * Get a property
         * @method getProp
         * @param {String} propName
         * @return {String} property value
         */
        getProp: function(propName){
            return this.$input.prop(propName);
        },

        /**
         * Get a property
         * @method setProp
         * @param {String} propName
         * @param {String} propValue
         * @chainable
         */
        setProp: function(propName, propValue){
            var $input = this.$input.prop(propName, propValue);

            if(propName === 'checked' && !this.getProp('disabled')){
                /**
                 * Fire when the checkbox is checked or unchecked
                 * @event checked
                 */
                this.trigger('checked');
            }

            if(propName === 'disabled'){
                /**
                 * Fire when the checkbox is disabled or enabled
                 * @event disabled
                 */
                this.trigger($input.prop('disabled') ? 'disable' : 'enable');
            }

            return this;
        },

        /**
         * Show error style
         * @method error
         * @chainable
         */
        error: function(){
            this.addClass('lbf-radio-error');
            return this;
        },

        /**
         * Clear error style
         * @method clearError
         * @chainable
         */
        clearError: function(){
            this.removeClass('lbf-radio-error');
            return this;
        },

        /**
         * Remove not only the node itself, but the whole wrap
         * @method remove
         * @chainable
         */
        remove: function(){
            Node.prototype.remove.apply(this, arguments);
            return this;
        },

        disable: function(){
            return this.setProp('disabled', 'disabled');
        },

        enable: function(){
            return this.setProp('disabled', '');
        },

        _onClick: function(){
            var checked = this.getProp('checked');
            !checked && this.setProp('checked', !checked);
        },

        _onMouseIn: function(){
            isIE6 && this.addClass('lbf-radio-hover');
        },

        _onMouseOut: function(){
            isIE6 && this.removeClass('lbf-radio-hover');
        },

        _onChecked: function(event){
            var checked = this.$input.prop('checked');

            this[checked ? 'addClass' : 'removeClass']('lbf-radio-checked');

            var ret = proxy(this.get('validate'), this)(event, checked);

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
            }
        },

        _onDisable: function(){
            this.addClass('lbf-radio-disabled');
        },

        _onEnable: function(){
            this.removeClass('lbf-radio-disabled');
        },

        _onChange: function(){
            this._onChecked();
        }
    });

    Radio.include({
        /**
         * @method renderAll
         * @static
         * @param {String|documentElement|jQuery|Node} [selector='input[type=radio]'] Selector of node
         * @param {Object} [opts] options for node
         * @return {Array} Array of nodes that is rendered
         * @example
         *      var nodeArray = Radio.renderAll();
         *
         * @example
         *      var nodeArray = Radio.renderAll('.radio');
         *
         * @example
         *      var nodeArray = Radio.renderAll({
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         *
         * @example
         *      var nodeArray = Radio.renderAll('.radio', {
         *          //options
         *          events: {
         *              error: function(e, error){
         *                  alert(error.message);
         *              }
         *          }
         *      });
         */
        renderAll: function(selector, opts){
            var SELECTOR = 'input[type=radio]';

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
            wrapTemplate: [
                '<div class="lbf-radio lbf-inline-block <%= disabled ? \'lbf-radio-disabled\' : \'\' %> <%= checked ? \'lbf-radio-checked\' : \'\' %>">',
                    '<input name="<%=name%>" id="<%=id%>" type="radio" class="lbf-hidden" value="<%=value%>" <%= checked ? \'checked="checked"\' : \'\' %> <%= disabled ? \'disabled="disabled"\' : \'\' %>>',
                '</div>'
            ].join(''),

            name: 'LBF-UI-Nodes-Radio',

            value: false,

            readonly: false,

            validate: function(){},

            events: {
                error: function(){
                    this.error();
                }
            }
        }
    });

    return Radio;
});