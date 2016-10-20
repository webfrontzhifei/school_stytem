/**
 * 地域选择使用
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-18 下午2:03
 */
// todo
// event api not enough

LBF.define('qidian.comp.ComboBox', function(require){
    var $ = require('lib.jQuery'),
        each = require('lang.each'),
        isArray = require('lang.isArray'),
        isFunction = require('lang.isFunction'),
        isObject = require('lang.isObject'),
        isNumber = require('lang.isNumber'),
        proxy = require('lang.proxy'),
        template = require('util.template'),
        extend = require('lang.extend'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Node = require('ui.Nodes.Node'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        xssFilter = require('util.xssFilter');

    /**
     * Simple lbf-combobox component for select-like cases
     * @class Menu
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {String|jQuery|documentElement} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object[]} [opts.options] Menu items' options
     * @param {*} [opts.options[].value] Menu item's value
     * @param {String} [opts.options[].text] Menu item's text
     * @param {Number} [opts.defaultIndex=0] Default selected option's index in options
     * @param {Object} [opts.events] Events to be bound to the node
     * @param {Function} [opts.events.select] Callback when an option is selected, no matter value is changed or not.
     * @param {Function} [opts.events.change] Callback when value is changed
     * @param {String} [opts.selectTemplate] Template for lbf-combobox's selected item.
     * @param {String} [opts.optionPanelTemplate] Template for lbf-combobox's option panel.
     * @example
     *      new ComboBox({
     *          container: 'someContainerSelector',
     *          options: [
     *              {
     *                  text: 'text1',
     *                  value: 1
     *              },
     *              {
     *                  text: 'text2',
     *                  value: 2
     *              },
     *              {
     *                  text: 'text3',
     *                  value: 3
     *              }
     *          ],
     *          defaultIndex: 2,
     *          events: {
     *              select: function(event, name, value){
     *                  alert('select');
     *              },
     *
     *              change: function(event, name, value, oldValue){
     *                  alert('change');
     *              }
     *          }
     *      });
     */
    var ComboBox = Node.inherit({
        elements: {
            '$label': '.lbf-combobox-label',
            '$caption': '.lbf-combobox-caption'
        },


        /**
         * Render the node
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var $ = this.$,
                _this = this,
                selector = this.get('selector'),
                options = this.get('options'),
                defaultIndex = this.get('defaultIndex'),
                disabled = this.get('disabled');

            //缓存
            this.selectTemplate = this.template(this.get('selectTemplate'));
            this.panelTemplate = this.template(this.get('optionPanelTemplate'));
            this.selectOptionTemplate = this.template(this.get('selectOptionTemplate'));


            // set default index
            typeof defaultIndex !== 'undefined' && this.set('selectedIndex', defaultIndex, { silence: true });

            //如果是render原生select表单，获取原生option的数据
            if(selector){
                var $el = this.$(selector);

                if($el.length === 0 || $el.get(0).tagName === 'select'){
                    throw new Error('Invalid selector for Select Component');
                }

                // if no options set
                // use <option> tag as options source
                if(!options){
                    this.set('options', options = []);

                    // add options
                    $el.find('option').each(function(i){
                        var $option = $(this);

                        if($option.prop('selected')){
                            _this.set('value', $option.val(), { silence: true });
                            _this.set('selectedIndex', i);
                        }

                        options.push({
                            value: $option.val(),
                            text: $option.text()
                        });
                    });
                }

                if(!isArray(options) && (!selector || (this.jQuery(selector).length === 0))){
                    throw new Error('Assign valid selector or options to Menu');
                }


                if(!$(selector).parent().is('.lbf-combobox')){
                    /*
                     * selector = <select id="JQ selector">
                     *    <option></option>
                     * </select>
                     */
                    this.setElement(this.$(this.selectTemplate({
                        options: options,
                        defaultIndex: this.get('selectedIndex')
                    })));
                    $(selector).after(this.$el);
                    this.$el.prepend($(selector));
                } else {
                    /*
                     * selector = <div class="lbf-combobox">
                     *     <select id="JQ selector">
                     *         <option></option>
                     *     </select>
                     *     <a href="javascript:;" class="lbf-button lbf-combobox-label">
                     *         <span class="lbf-combobox-caption"></span><span class="lbf-combobox-icon">&nbsp;</span>
                     *     </a>
                     * </div>
                     */
                    this.setElement($(selector).parent());
                }

                this.$caption.text(options[this.get('selectedIndex')].text);
            } else {
                // container

                // in case options are empty
                options = options || [];

                this.setElement(this.$(this.selectTemplate({
                    options: options,
                    defaultIndex: this.get('selectedIndex')
                })));

                //渲染到页面
                this.$container = $(this.get('container'));
                this.appendTo(this.$container);
            }

            this.$label = this.find('.lbf-combobox-label');
            this.$oldEl = this.find('select');

            //optionPane使用Dropdown组件
            this.renderOptionPanel();

            //初始是否可用
            disabled && this.disable();

            return this;
        },

        /**
         * Render options panel
         * @method renderOptionPanel
         * @chainable
         * @protected
         */
        renderOptionPanel: function(){
            var combobox = this,
                optionPanel = this.optionPanel,
                options = this.get('options'),
                maxDisplay = this.get('maxDisplay'),
                direction = this.get('direction'),
                show = this.get('show'),
                hide = this.get('hide'),
                events = this.get('events'),
                panelHTML = this.panelTemplate({
                    options: options
                }),
                selectHTML = this.selectOptionTemplate({
                    options: options
                });

            if(!optionPanel){
                var attrs = this.attributes();
                attrs.trigger = this.$label;
                attrs.optionsContainer && (attrs.container = attrs.optionsContainer);
                attrs.content = panelHTML;

                optionPanel = this.optionPanel =
                    new Dropdown(attrs)
                        .addClass('lbf-combobox-panel')
                        .bind('open', function(){
                            combobox.$label.addClass('lbf-combobox-on');
                            combobox.resize();
                        })
                        .bind('close.Dropdown', function(){
                            combobox.$label.removeClass('lbf-combobox-on');
                        });

                optionPanel.delegate('.lbf-combobox-item', 'click', function(event){
                    combobox.selectItem(event);
                });
            } else {
                // todo 原生表单也要刷新
                this.$oldEl.empty();
                this.$oldEl.append(selectHTML);

                optionPanel.find('.lbf-combobox-options').replaceWith(panelHTML);
            }

            this.resize();

            //$label 比 optionPanel长，取$label宽度
            // this.optionPanel.outerWidth(Math.max(this.optionPanel.width(), this.$label.outerWidth()));
            // this.$options.width(Math.max(this.optionPanel.$el.width(), $item.outerWidth()));

            return this;
        },

        resize: function(){
            //计算optionPanel的maxHeight和width

            // set combobox to show state to get real size
            var optionPanel = this.optionPanel,
                maxDisplay = this.get('maxDisplay'),
                options = this.get('options'),
                $options = this.$options = optionPanel.find('.lbf-combobox-options'),
                $item = $options.find('.lbf-combobox-item');

            // set panel's min-width of panel to combobox's width
            // 2015.10.20 webb 把滚动条移动到下拉列表内部，如果超长则出现省略号
			optionPanel.css('width', 'auto');
            var width = this.outerWidth() - this.optionPanel.outerWidth() + this.optionPanel.width();
				// width = $options.width();

            optionPanel.css({
				// minWidth: minWidth,
				width: width,
				height: 'auto'
			});

            if(maxDisplay < options.length){
                optionPanel.css({
					// width: width + 30, //ie7下出现滚动条后会减小可视宽度;
                    height: $item.outerHeight() * maxDisplay
                });
            }
        },

        /**
         * Invoke When an item is selected
         * @method selectItem
         * @protected
         * @param {Event} event
         * @chainable
         */
        selectItem: function(event){
            var $selected = $(event.currentTarget),
                selectedName = $selected.text(),
                selectedValue = $selected.data('value');

            this.select(function(option){
                return selectedName === option.text &&
                    // selectedValue may be parsed by method data
                    typeof selectedValue === 'number' ?
                    selectedValue === parseInt(option.value, 10) :
                    selectedValue === option.value;
            });

            return false;
        },

        /**
         * Select a item by index or function
         * @method select
         * @param {Number|Function} index The index or comparator of item to be selected, or a locate function
         * @param {*} index.value When index is a filter function, the 1st argument is item's value
         * @param {*} index.name When index is a filter function, the 2nd argument is item's name
         * @chainable
         * @example
         *      lbf-combobox.select(0); // select the 1st item
         * @example
         *      // select by a filter function
         *      lbf-combobox.select(function(value, name){
         *          return value < 10; // filter out the 1st item that lower than 10
         *      });
         */
        select: function(index){
            var options = this.get('options');

            if(isFunction(index)){
                each(options, function(i, option){
                    if(index(option)){
                        index = i;
                        return false;
                    }
                });
            }

            if(!isNumber(index)){
                throw new TypeError('Invalid index for selection');
            }

            if(!options[index]){
                return;
            }

            var option = options[index],
                newValue = option.value,
                text = option.text,
                oldValue = this.val();

            /**
             * Fire when an item selected, no matter it changes or not
             * @event select
             * @param {Event} event JQuery event
             * @param newValue New value
             * @param oldValue Old value
             */
            this.trigger('select', [newValue, oldValue]);

            // when value changed
            if(newValue !== oldValue){
                //更新combobox的value和text
                this.set('value', newValue);
                this.$caption.text(text);

                //给原生表单赋值
                this.$oldEl && this.$oldEl.val(newValue);

                this.set('selectedIndex', index);

                // todo
                // by amoschen
                // change event here is occupied

                /**
                 * Fire when value changed
                 * @event change
                 * @param {Event} event JQuery event
                 * @param newValue New value
                 * @param oldValue Old value
                 */
                this.trigger('change', [newValue, oldValue]);
            }

            this.$label.focus();
            this.hideOptions();

            return this;
        },

        /**
         * Show optionPanel
         * @method hide
         * @chainable
         */
        showOptions: function(){
            this.optionPanel.open();
            this.trigger('showOptions', [this]);
            return this;
        },

        /**
         * Hide optionPanel
         * @method hide
         * @return {*}
         */
        hideOptions: function(){
            this.optionPanel.close();
            this.trigger('hideOptions', [this]);
            return this;
        },

        /**
         * add option
         * @method addOption
         * @param {Object} option Options of combobox option
         * @param options.value Value of option
         * @param options.text Text of option
         * @param {Number} pos The position options to be inserted
         * @chainable
         */
        addOption: function(option, pos){
            if(!isObject(option)){
                throw new TypeError('Invalid option');
            }

            var options = this.get('options');

            if(pos){
                options.splice(pos, 0, option);
            } else {
                options.push(option);
            }

            this.renderOptionPanel();



            return this;
        },

        /**
         * update option
         * @method updateOptions
         * @param {Object} option Options of combobox option
         * @param {Number} index Index of option to be updated
         * @chainable
         */
        updateOptions: function(option, index){
            if(!isObject(option)){
                throw new TypeError('Invalid option');
            }

            this.get('options')[index] = option;
            this.renderOptionPanel();

            return this;
        },

        /**
         * Remove option by value
         * @method removeOptionByValue
         * @param value Value of option to be removed
         * @param {Boolean} [removeAll = false] Remove all options that have the value
         * @chainable
         */
        removeOptionByValue: function(value, removeAll){
            var options = this.get('options');

            for(var i= 0, len= options.length; i< len; i++){
                if(value === options[i].value){
                    options.splice(i, 1);
                    --i;

                    // if the selected on is removed
                    // select the 1st one
                    if(this.get('selectedIndex') === i){
                        this.select(0);
                    }

                    // remove all or not
                    if(!removeAll){
                        break;
                    }
                }
            }

            this.renderOptionPanel();

            return this;
        },

        /**
         * Remove option by value
         * @method removeOptionByIndex
         * @param index Index of option to be removed
         * @chainable
         */
        removeOptionByIndex: function(index){
            var options = this.get('options');

            options.splice(index, 1);

            if(index === this.get('selectedIndex')){
                this.select(0);
            }

            this.renderOptionPanel();

            return this;
        },

        /**
         * Clear all the options
         * @method clearAllOption
         * @return {*}
         */
        removeAllOptions: function(){
            var options = this.get('options');

            options.splice(0, options.length);

            this.renderOptionPanel();

            // no option can be selceted
            this.select(0);

            return this;
        },

        /**
         * Reset options
         * @method reset
         * @chainable
         */
        reset: function(options, def){
            this.set('options', options);

            this.renderOptionPanel();

            def = def || 0;
            this.select(def);

            /**
             * Fired when options have been reset
             * @event reset
             * @param {jQuery.Event} event
             */
            this.trigger('reset');

            return this;
        },

        /**
         * Get index of option by value
         * @method index
         * @param value Value of option
         * @return {Number} Index of the option which has the given value. No match returns -1. Multiple returns index of the first one.
         */
        index: function(value){
            var options = this.get('options'),
                index = -1;

            for(var i= 0, len= options.length; i< len; i++){
                if(value === options[i].value){
                    return i;
                }
            }

            return index;
        },

        // todo
        // lastIndexOf

        /**
         * Get selected item's value
         * @method val
         * @return {*}
         */
        val: function(val){
            var name = '';

            //赋值
            if(typeof(val) != 'undefined'){
                this.optionPanel.find('.lbf-combobox-item').each(function(){
                    var $this = $(this);
                    if($this.data('value') === val){
                        name = $this.text();
                    }
                });

                //更新combobox的value和text
                this.$caption.text(name);
                this.set('value', val);

                //给原生表单赋值
                this.$oldEl && this.$oldEl.val(val);

                return this;
            }else{
                //取值
                return this.$oldEl ? this.$oldEl.val() : this.get('value');
            }
        },

        /**
         * Disable lbf-combobox
         * @chainable
         */
        disable: function(){
            this.trigger('disable', [this]);

            this.hideOptions();
            this.set('disabled', true);
            this.optionPanel.disable();
            this.$label.addClass('lbf-button-disabled');
            this.$label.addClass('lbf-combobox-disabled');

            return this;
        },

        /**
         * Enable lbf-combobox
         * @chainable
         */
        enable: function(){
            this.trigger('enable', [this]);

            this.set('disabled', false);
            this.optionPanel.enable();
            this.$label.removeClass('lbf-button-disabled');
            this.$label.removeClass('lbf-combobox-disabled');

            return this;
        },

        /**
         * Remove combobox.
         * @chainable
         */
        remove: function(){
            this.trigger('remove', [this]);

            this.$el.remove();
            this.optionPanel.remove();
        }
    });

    ComboBox.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selectTemplate: [
                '<div class="lbf-combobox">',
                '<a href="javascript:;" class="lbf-button lbf-combobox-label" data-value="<%== options[defaultIndex].value %>" hidefocus="true">',
                '<span class="lbf-combobox-caption"><%= options[defaultIndex].text %></span>',
                '<span class="lbf-combobox-icon">&nbsp;</span>',
                '</a>',
                '</div>'
            ].join(''),

            optionPanelTemplate: [
                '<ul class="lbf-combobox-options">',
                '<% for(var i=0,len=options.length; i<len; i++){ %>',
                '<li class="lbf-combobox-option"><a class="lbf-combobox-item" href="javascript:;" onclick="return false;" data-value="<%== options[i].value %>"><%= options[i].text %></a></li>',
                '<% }%>',
                '</ul>'
            ].join(''),

            selectOptionTemplate: [
                '<% for(var i=0,len=options.length; i<len; i++){ %>',
                '<option value="<%== options[i].value %>"><%== options[i].text %></option>',
                '<% }%>'
            ].join(''),

            show: {
                mode: 'click',
                delay: 0,
                effect: function(){
                    this.show();
                }
            },

            hide: {
                delay: 0,
                effect: function(){
                    this.hide();
                }
            },

            optionsContainer: 'body',

            options: null,

            direction: 'bottom',

            defaultIndex: 0,

            disabled: false,

            maxDisplay: 10,

            events: {
                load: function(){},
                unload: function(){},
                showOptions: function(){

                },
                hideOptions: function(){},
                enable: function(){},
                disable: function(){},
                select: function(){},
                change: function(){}
            }
        }
    });

    return ComboBox;
});
