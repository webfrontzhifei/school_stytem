/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 14-5-15 上午11:14
 */
LBF.define('ui.widget.NumberSpinner.NumberSpinner', function(require){
    var isNumber = require('lang.isNumber'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node');

    require('{theme}/lbfUI/css/NumberSpinner.css');

    /**
     * NumberSpinner tools
     * @class NumberSpinner
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     */
    var NumberSpinner = Node.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            '$inputBox': '.lbf-text-input',
            '$input': '.lbf-numberspinner-input > input',
            '$decrease': '.lbf-numberspinner-decrease',
            '$increase': '.lbf-numberspinner-increase'
        },

        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'cut .lbf-numberspinner-input > input': '_inputPropertychange',
            'paste .lbf-numberspinner-input > input': '_inputPropertychange',
            'keyup .lbf-numberspinner-input > input': '_inputPropertychange',
            'click .lbf-numberspinner-increase': 'increase',
            'click .lbf-numberspinner-decrease': 'decrease'
        },

        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var selector = this.get('selector'),
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $selector = this.$(selector);

            if(this.get('selector')){
                this.setElement($selector);

                var defualtValue = this.$input.val();

                if(isNumber(defualtValue)){
                    this.set('defaultValue', defualtValue);
                }

            } else {

                // container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            // set className
            this.get('className') && this.addClass(this.get('className'));

            // width property
            if(this.get('width')){
                this.$inputBox.width(this.get('width'));
            }

            // value property
            this.get('defaultValue') && this.val(this.get('defaultValue'));

            // maxlength property
            if(this.get('maxlength')){
                this.$textarea.attr('maxlength', this.get('maxlength'));
                this.$textarea.val((this.$textarea.val() + '').substr(0, this.get('maxlength')));
            }

            return this;
        },

        _inputPropertychange: function(){
            if(this.val() === ''){
                this.$decrease.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
            }else if(!isNumber(this.val())){
                this.val(this.get('min'));
                this.$decrease.addClass('lbf-button-disabled');

                this.trigger('error', [this]);
                return;
            }else{
                if(parseInt(this.val(), 10) < this.get('min')){
                    //this.$input.select();
                    this.$decrease.addClass('lbf-button-disabled');

                    this.trigger('error', [this]);
                    return;
                }

                if(this.get('max') && parseInt(this.val(), 10) > this.get('max')){
                    //this.$input.select();
                    this.$increase.addClass('lbf-button-disabled');

                    this.trigger('error', [this]);
                    return;
                }

                if(parseInt(this.val(), 10) == this.get('min')){
                    this.$decrease.addClass('lbf-button-disabled');
                    this.$increase.removeClass('lbf-button-disabled');
                    return;
                }

                if(this.get('max') && parseInt(this.val(), 10) == this.get('max')){
                    this.$decrease.removeClass('lbf-button-disabled');
                    this.$increase.addClass('lbf-button-disabled');
                    return;
                }

                this.$decrease.removeClass('lbf-button-disabled');
                this.$increase.removeClass('lbf-button-disabled');
            }

            this.trigger('change', [this]);

            this.$decrease.removeClass('lbf-button-disabled');

            this.trigger('success', [this]);
        },

        increase: function(){
            if(this.$increase.is('.lbf-button-disabled')){
                return;
            }

            var value = this.val();

            if(value === ''){
                value = 0;
            }

            value = parseInt(value, 10);

            value = value + this.get('step');

            this.val(value);

            this.trigger('increase', [this]);

            return this;
        },

        decrease: function(){
            if(this.$decrease.is('.lbf-button-disabled')){
                return;
            }

            var value = parseInt(this.val(), 10);

            value = value - this.get('step');

            this.val(value);

            this.trigger('decrease', [this]);

            return this;
        },

        /**
         * get or set value
         * @method value
         */
        val: function(){
            if(arguments.length === 1){
                this.set('value', arguments[0]);
                this.$input.val(arguments[0]);

                //判断按钮是否可点
                if(this.get('min')){
                    if(arguments[0] > this.get('min')){
                        this.$decrease.removeClass('lbf-button-disabled');
                    }else{
                        this.$decrease.addClass('lbf-button-disabled');
                        //arguments[0] < this.get('min') && this.$input.select();
                    }
                }

                if(this.get('max')){
                    if(arguments[0] < this.get('max')){
                        this.$increase.removeClass('lbf-button-disabled');
                    }else{
                        this.$increase.addClass('lbf-button-disabled');
                        //arguments[0] > this.get('max') &&  this.$input.select();
                    }
                }

                return this;
            }else{
                return this.$input.val();
            }
        }
    });

    NumberSpinner.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            wrapTemplate: [
                '<span class="lbf-numberspinner">',
                    '<span class="lbf-text-input lbf-numberspinner-input">',
                        '<input hideFocus="true" value="<%=defaultValue%>">',
                    '</span>',
                    '<span class="lbf-numberspinner-button">',
                            '<span class="lbf-button lbf-button-disabled lbf-numberspinner-decrease" unselectable="on">-</span>',
                            '<span class="lbf-button lbf-numberspinner-increase" unselectable="on">+</span>',
                    '</span>',
                '</span>'
            ].join(''),

            className: false,

            defaultValue: 1,

            min: 1,

            max: false,

            step: 1
        }
    });

    return NumberSpinner;
});