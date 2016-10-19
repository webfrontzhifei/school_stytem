/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-7-8 上午11:04
 */
LBF.define('ui.widget.IRadio.IRadio', function (require) {
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node'),
        each = require('lang.each'),
        extend = require('lang.extend');

    var IRadio = Node.inherit({
        /**
         * Render scrollspy's attribute
         * @method render
         * @chainable
         * @protected
         */
        render: function () {
            var selector = this.get('selector'),
                className = this.get('className'),
                checked = this.get('checked'),
                disabled = this.get('disabled'),
                events = this.get('events'),
                wrapTemplate = this.template(this.get('template')),
                $selector = $(selector);

            if (this.get('selector')) {
                if ($selector.is('.lbf-iradio')) {
                    this.setElement($selector);
                } else if ($selector.parent().is('.lbf-iradio')) {

                    //无跳动结构
                    this.setElement($selector.parent());
                } else {

                    //二次渲染
                    $selector.wrap('<div class="lbf-iradio"></div>')
                    this.setElement($selector.parent());
                }
            } else {

                //container渲染模式
                this.setElement(wrapTemplate(this.attributes()));
                this.$el.appendTo(this.get('container'));
            }

            //缓存
            this.set('$selector', this.$el.find('input'));

            //赋值给组件
            this._setValue();

            className && this.addClass(className);

            this.pro($, 'iCheck', 'checkbox', 'radio', 'checked', 'disabled', 'type', 'click', 'touchbegin.i touchend.i', 'addClass', 'removeClass', 'cursor');

            this.$el.iCheck.apply(this, arguments);

            return this;
        },

        _setValue: function () {
            var value;

            value = this.get('$selector').val();

            this.set('value', value);

            return value;
        },

        isChecked: function () {
            return this.get('$selector').prop('checked');
        },

        isDisabled: function () {
            return this.get('$selector').prop('disabled');
        },

        value: function(){
            return this._setValue();
        },

        check: function () {
            this.$el.iCheck('check');

            return this;
        },

        uncheck: function () {
            this.$el.iCheck('uncheck');

            return this;
        },

        disable: function () {
            this.trigger('disable', [this]);
            this.$el.iCheck('disable');

            return this;
        },

        enable: function () {
            this.trigger('enable', [this]);
            this.$el.iCheck('enable');

            return this;
        },

        destroy: function () {
            this.trigger('destroy', [this]);
            this.$el.iCheck('destroy');

            return this;
        },

        remove: function(){
            this.trigger('remove', [this]);
            this.superclass.prototype.remove.apply(this, arguments);

            return this;
        },

        /*!
         * iCheck v0.9, http://git.io/uhUPMA
         * =================================
         * Powerful jQuery plugin for checkboxes and radio buttons customization
         *
         * (c) 2013 Damir Foy, http://damirfoy.com
         * MIT Licensed
         */

        pro: function ($, _iCheck, _checkbox, _radio, _checked, _disabled, _type, _click, _touch, _add, _remove, _cursor) {
            var iradio = this;

            // Create a plugin
            $.fn[_iCheck] = function (options, fire) {

                // Cached vars
                var user = navigator.userAgent,
                        mobile = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini/i.test(user),
                        handle = ':' + _checkbox + ', :' + _radio,
                        stack = $(),
                        walker = function (object) {
                            object.each(function () {
                                var self = $(this);

                                if (self.is(handle)) {
                                    stack = stack.add(self);
                                } else {
                                    stack = stack.add(self.find(handle));
                                }
                                ;
                            });
                        };

                // Check if we should operate with some method
                if (/^(check|uncheck|toggle|disable|enable|update|destroy)$/.test(options)) {

                    // Find checkboxes and radio buttons
                    walker(this);

                    return stack.each(function () {
                        var self = $(this);

                        if (options == 'destroy') {
                            tidy(self, 'ifDestroyed');
                        } else {
                            operate(self, true, options);
                        }
                        ;

                        // Fire method's callback
                        if ($.isFunction(fire)) {
                            fire();
                        }
                        ;
                    });

                    // Customization
                } else if (typeof options == 'object' || !options) {

                    //  Check if any options were passed
                    var settings = $.extend({
                                checkedClass: 'lbf-iradio-' + _checked,
                                disabledClass: 'lbf-iradio-' + _disabled,
                                labelHover: true
                            }, options),

                            selector = settings.handle,
                            hoverClass = settings.hoverClass || 'lbf-iradio-hover',
                            focusClass = settings.focusClass || 'lbf-iradio-focus',
                            activeClass = settings.activeClass || 'lbf-iradio-active',
                            labelHover = !!settings.labelHover,
                            labelHoverClass = settings.labelHoverClass || 'lbf-iradio-hover',

                    // Setup clickable area
                            area = ('' + settings.increaseArea).replace('%', '') | 0;

                    // Selector limit
                    if (selector == _checkbox || selector == _radio) {
                        handle = ':' + selector;
                    }
                    ;

                    // Clickable area limit
                    if (area < -50) {
                        area = -50;
                    }
                    ;

                    // Walk around the selector
                    walker(this);

                    return stack.each(function () {
                        var self = $(this);

                        // If already customized
                        tidy(self);

                        var node = this,
                                id = node.id,

                        // Layer styles
                                offset = -area + '%',
                                size = 100 + (area * 2) + '%',
                                layer = {
                                    position: 'absolute',
                                    top: offset,
                                    left: offset,
                                    display: 'block',
                                    width: size,
                                    height: size,
                                    margin: 0,
                                    padding: 0,
                                    background: '#fff',
                                    border: 0,
                                    opacity: 0
                                },

                        // Choose how to hide input
                                hide = mobile ? {
                                    position: 'absolute',
                                    visibility: 'hidden'
                                } : area ? layer : {
                                    position: 'absolute',
                                    opacity: 0
                                },

                        // Get proper class
                                className = node[_type] == _checkbox ? settings.checkboxClass || 'i' + _checkbox : settings.className || 'i' + _radio,

                        // Find assigned labels
                                label = $('label[for="' + id + '"]').add(self.closest('label')),

                        // Wrap input
                                parent,

                        // Layer addition
                                helper;

                        //rains
                        if (!$(self).parent().is('.lbf-iradio')) {
                            parent = self.wrap('<div class="' + className + '"/>').trigger('ifCreated').parent().append(settings.insert);
                        } else {
                            parent = $(self).parent();
                        }

                        helper = $('<ins class="lbf-iradio-helper"/>').css(layer).appendTo(parent);


                        // Finalize customization
                        self.data(_iCheck, {o: settings, s: self.attr('style')}).css(hide);
                        !!settings.inheritClass && parent[_add](node.className);
                        !!settings.inheritID && id && parent.attr('id', _iCheck + '-' + id);
                        parent.css('position') == 'static' && parent.css('position', 'relative');
                        operate(self, true, 'update');

                        // Label events
                        if (label.length) {
                            label.on(_click + '.i mouseenter.i mouseleave.i ' + _touch, function (event) {
                                var type = event[_type],
                                        item = $(this);

                                // Do nothing if input is disabled
                                if (!node[_disabled]) {

                                    // Click
                                    if (type == _click) {
                                        operate(self, false, true);

                                        // Hover state
                                    } else if (labelHover) {
                                        if (/ve|nd/.test(type)) {
                                            // mouseleave|touchend
                                            parent[_remove](hoverClass);
                                            item[_remove](labelHoverClass);
                                        } else {
                                            parent[_add](hoverClass);
                                            item[_add](labelHoverClass);
                                        }
                                        ;
                                    }
                                    ;

                                    if (mobile) {
                                        event.stopPropagation();
                                    } else {
                                        return false;
                                    }
                                    ;
                                }
                                ;
                            });
                        }
                        ;

                        // Input events
                        self.on(_click + '.i focus.i blur.i keyup.i keydown.i keypress.i', function (event) {
                            var type = event[_type],
                                    key = event.keyCode;

                            // Click
                            if (type == _click) {
                                return false;

                                // Keydown
                            } else if (type == 'keydown' && key == 32) {
                                if (!(node[_type] == _radio && node[_checked])) {
                                    if (node[_checked]) {
                                        off(self, _checked);
                                    } else {
                                        on(self, _checked);
                                    }
                                    ;
                                }
                                ;

                                return false;

                                // Keyup
                            } else if (type == 'keyup' && node[_type] == _radio) {
                                !node[_checked] && on(self, _checked);

                                // Focus/blur
                            } else if (/us|ur/.test(type)) {
                                parent[type == 'blur' ? _remove : _add](focusClass);
                            }
                            ;
                        });

                        // Helper events
                        helper.on(_click + ' mousedown mouseup mouseover mouseout ' + _touch, function (event) {
                            var type = event[_type],

                            // mousedown|mouseup
                                    toggle = /wn|up/.test(type) ? activeClass : hoverClass;

                            // Do nothing if input is disabled
                            if (!node[_disabled]) {

                                // Click
                                if (type == _click) {
                                    operate(self, false, true);

                                    // Active and hover states
                                } else {

                                    // State is on
                                    if (/wn|er|in/.test(type)) {
                                        // mousedown|mouseover|touchbegin
                                        parent[_add](toggle);

                                        // State is off
                                    } else {
                                        parent[_remove](toggle + ' ' + activeClass);
                                    }
                                    ;

                                    // Label hover
                                    if (label.length && labelHover && toggle == hoverClass) {

                                        // mouseout|touchend
                                        label[/ut|nd/.test(type) ? _remove : _add](labelHoverClass);
                                    }
                                    ;
                                }
                                ;

                                if (mobile) {
                                    event.stopPropagation();
                                } else {
                                    return false;
                                }
                                ;
                            }
                            ;
                        });
                    });
                } else {
                    return this;
                }
                ;
            };

            // Do something with inputs
            function operate(input, direct, method) {
                var node = input[0];

                // disable|enable
                state = /ble/.test(method) ? _disabled : _checked,
                        active = method == 'update' ? {checked: node[_checked], disabled: node[_disabled]} : node[state];

                // Check and disable
                if (/^ch|di/.test(method) && !active) {
                    on(input, state);

                    // Uncheck and enable
                } else if (/^un|en/.test(method) && active) {
                    off(input, state);

                    // Update
                } else if (method == 'update') {

                    // Both checked and disabled states
                    for (var state in active) {
                        if (active[state]) {
                            on(input, state, true);
                        } else {
                            off(input, state, true);
                        }
                        ;
                    }
                    ;

                } else if (!direct || method == 'toggle') {

                    // Helper or label was clicked
                    if (!direct) {
                        input.trigger('ifClicked');
                        iradio.trigger('click', [iradio]);
                    }
                    ;

                    // Toggle checked state
                    if (active) {
                        if (node[_type] !== _radio) {
                            off(input, state);
                            iradio.trigger('uncheck', [iradio]);
                        }
                        ;
                    } else {
                        on(input, state);
                        iradio.trigger('check', [iradio]);
                    }
                    ;
                }
                ;
            };

            // Set checked or disabled state
            function on(input, state, keep) {
                var node = input[0],
                        parent = input.parent(),
                        remove = state == _disabled ? 'enabled' : 'un' + _checked,
                        regular = option(input, remove + capitalize(node[_type])),
                        specific = option(input, state + capitalize(node[_type]));

                // Prevent unnecessary actions
                if (node[state] !== true && !keep) {

                    // Toggle state
                    node[state] = true;

                    // Trigger callbacks
                    input.trigger('ifChanged').trigger('if' + capitalize(state));
                    iradio.trigger('change', [iradio]);

                    // Toggle assigned radio buttons
                    if (state == _checked && node[_type] == _radio && node.name) {
                        var form = input.closest('form'),
                                stack = 'input[name="' + node.name + '"]';

                        stack = form.length ? form.find(stack) : $(stack);

                        stack.each(function () {
                            if (this !== node && $(this).data(_iCheck)) {
                                off($(this), state);
                            }
                            ;
                        });
                    }
                    ;
                }
                ;

                // Add proper cursor
                if (node[_disabled] && !!option(input, _cursor, true)) {
                    parent.find('.lbf-iradio-helper').css(_cursor, 'default');
                }
                ;

                // Add state class
                parent[_add](specific || option(input, state));

                // Remove regular state class
                parent[_remove](regular || option(input, remove) || '');
            };

            // Remove checked or disabled state
            function off(input, state, keep) {
                var node = input[0],
                        parent = input.parent(),
                        callback = state == _disabled ? 'enabled' : 'un' + _checked,
                        regular = option(input, callback + capitalize(node[_type])),
                        specific = option(input, state + capitalize(node[_type]));

                // Prevent unnecessary actions
                if (node[state] !== false && !keep) {

                    // Toggle state
                    node[state] = false;

                    // Trigger callbacks
                    input.trigger('ifChanged').trigger('if' + capitalize(callback));
                    iradio.trigger('change', [iradio]);
                }
                ;

                // Add proper cursor
                if (!node[_disabled] && !!option(input, _cursor, true)) {
                    parent.find('.lbf-iradio-helper').css(_cursor, 'pointer');
                }
                ;

                // Remove state class
                parent[_remove](specific || option(input, state) || '');

                // Add regular state class
                parent[_add](regular || option(input, callback));
            };

            // Remove all traces of iCheck
            function tidy(input, callback) {
                if (input.data(_iCheck)) {

                    // Remove everything except input
                    input.parent().html(input.attr('style', input.data(_iCheck).s || '').trigger(callback || ''));

                    // Unbind events
                    input.off('.i').unwrap();
                    $('label[for="' + input[0].id + '"]').add(input.closest('label')).off('.i');
                }
                ;
            };

            // Get some option
            function option(input, state, regular) {
                if (input.data(_iCheck)) {
                    return input.data(_iCheck).o[state + (regular ? '' : 'Class')];
                }
                ;
            };

            // Capitalize some string
            function capitalize(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            };
        }
    });

    IRadio.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selector: null,

            container: null,

            template: [
                '<div class="lbf-iradio',
                '<% if(checked) { %> ',
                'lbf-iradio-checked',
                '<% } %>',
                '<% if(disabled) { %> ',
                'lbf-iradio-disabled',
                '<% } %>',
                '">',
                '<input type="radio"',
                '<% if(id) { %> ',
                'id="<%=id%>"',
                '<% } %>',
                '<% if(name) { %> ',
                'name="<%=name%>"',
                '<% } %>',
                '<% if(checked) { %> ',
                'checked',
                '<% } %>',
                '<% if(disabled) { %> ',
                'disabled',
                '<% } %>',
                ' />',
                '</div>'
            ].join(''),

            id: false,

            name: false,

            checked: false,

            disabled: false
        }
    });

    return IRadio;
});
