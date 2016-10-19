/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-2-25 上午9:47
 */
LBF.define('ui.widget.Switchable.Switchable', function(require){
    var forEach = require('lang.forEach'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node');

    require('{theme}/lbfUI/css/Switchable.css');

    /**
     * Simple switchable for switching views, slides etc.
     * @class Switchable
     * @namespace ui.widget.Switchable
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @uses util.Attribute
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Number} [opts.selected] Selected tab's index on initialization
     * @param {String} [opts.wrapTemplate] Wrap template of switchable
     * @param {String} [opts.tabTemplate] Template for each tab.
     * @param {String} [opts.contentTemplate] Template for each tab content.
     * @param {Object[]} [opts.itemSettings] Default options for each tab
     * @param {String|jQuery|documentElement} [opts.itemSettings.tab] Tab handler's innerHTML
     * @param {String|jQuery|documentElement} [opts.itemSettings.content] Tab content's innerHTML
     * @param {String} [opts.itemSettings.tabTemplate] Template for the tab
     * @param {String} [opts.itemSettings.contentTemplate] Template for the tab content
     * @param {Object[]} [opts.items] All items and their contents' options
     * @param {String|jQuery|documentElement} [opts.items[].tab] Tab's innerHTML
     * @param {String|jQuery|documentElement} [opts.items[].content] Tab's innerHTML
     * @param {String} [opts.items[].tabTemplate] Template for the tab
     * @param {String} [opts.items[].contentTemplate] Template for the tab content
     * @param {Object} [opts.events] Events to be bound to switchable
     * @param {Function} [opts.events.addItem] Callback when a tab is add
     * @param {Function} [opts.events.selectItem] Callback when a tab is selected
     * @param {Function} [opts.events.removeItem] Callback when a tab is removed
     * @example
     *      new Switchable({
     *          container: 'someContainerSelector',
     *
     *          select: 0,
     *
     *          // specialize tab and content html
     *          itemSettings: {
     *              tabTemplate: '<a class="LBF-UI-widget-Switchable-tab" href="javascript:;"><%==tab%></a>',
     *              contentTemplate: '<div class="LBF-UI-widget-Switchable-tabContent"><%==content%></div>'
     *          },
     *
     *          // all items
     *          items: [
     *              {
     *                  tab: 'tab1',
     *                  content: 'tab1 content',
     *
     *                  // use different template for a specific tab
     *                  tabTemplate: '<a class="LBF-UI-widget-Switchable-tab" href="javascript:;"><%==tab%></a>',
     *                  contentTemplate: '<div class="LBF-UI-widget-Switchable-tabContent"><%==content%></div>'
     *              },
     *              {
     *                  tab: 'tab2',
     *                  content: 'tab2 content'
     *              }
     *          ]
     *      });
     */
    var Switchable = Node.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-switchable-tab': '_clickSelectTab'
        },

        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
        elements: {
            $tabs: '.lbf-switchable-tabs',
            $contents: '.lbf-switchable-contents'
        },

        /**
         * Render the switchable and add items
         * @method render
         * @chainable
         * @protected
         */
        render: function(){

            var node = this,
                $el;

            //缓存items数据
            node.items = [];

            //create模式
            var itemSettings = node.get('itemSettings'),
                wrapTemplate = node.template(node.get('wrapTemplate')),
                container =  node.get('container');

            //组件框架结构
            $el = node.$(wrapTemplate());

            //缓存
            node.$container = node.$(node.get('container'));
            node.tabTemplate = node.template(itemSettings.tabTemplate);
            node.contentTemplate = node.template(itemSettings.contentTemplate);

            node.setElement($el);

            node.$container.append($el);

            forEach(node.get('items'), function(itemSettings){
                node.addItem(itemSettings, { silence: true});
            });

            //定制样式接口
            node.get('className') && node.addClass(node.get('className'));

            //选中默认项
            node.selectItem(node.get('defaultIndex'));

            return this;
        },

        /**
         * Add a tab
         * @method addItem
         * @param [itemSettings] Tab options
         * @param {String|jQuery|documentElement} [itemSettings.tab] Tab's innerHTML
         * @param {String|jQuery|documentElement} [itemSettings.content] Tab's innerHTML
         * @param {String} [itemSettings.tabTemplate] Template for the tab
         * @param {String} [itemSettings.contentTemplate] Template for the tab content
         * @param {Object} [options] Additional options
         * @param {Boolean} [options.silence] Use silence mode, won't fire addItem event when set silence true
         * @chainable
         * @example
         *      switchable.addItem({
         *          tab: 'tab1',
         *          content: 'tab1 content',
         *
         *          // use different template for a specific tab
         *          tabTemplate: '<a class=".lbf-switchable-tab" href="javascript:;"><%==tab%></a>',
         *          contentTemplate: '<div class=".lbf-switchable-tab-content"><%==content%></div>'
         *      });
         */
        addItem: function(itemSettings, options){
            var defaultItemSettings = this.get('itemSettings'),
                itemSettings = extend({}, this.attributes(), defaultItemSettings, itemSettings);

            var tabTemplate = itemSettings.tabTemplate === defaultItemSettings.tabTemplate ? this.tabTemplate : this.template(itemSettings.tabTemplate),
                contentTemplate = itemSettings.contentTemplate === defaultItemSettings.contentTemplate ? this.contentTemplate : this.template(itemSettings.contentTemplate);

            var $tab = this.$(tabTemplate(itemSettings)),
                $content = this.$(contentTemplate(itemSettings)),
                tab = {
                    $tab: $tab,
                    $content: $content
                },
                items = this.items,
                // ensure tab index in correct range ( 0 - items.length )
                index = typeof itemSettings.index === 'number' ? Math.min(Math.max(0, itemSettings.index), items.length) : items.length;

            // insert tab
            if(index === 0){
                this.$tabs.prepend($tab);
                this.$contents.prepend($content);
            } else {
                this.getTabs()[index - 1].after($tab);
                this.getContents()[index - 1].after($content);
            }

            var newitems = [];
            newitems = items.slice(0, index);
            newitems.push(tab);
            this.items = newitems.concat(items.slice(index + 1, items.length));

            /**
             * Fired when a tab is add and options.silence is not true
             * @event addItem
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             * @param {Object} tab Collection of tab and content element
             * @param {jQuery} tab.$tab Tab handler's jQuery instance
             * @param {jQuery} tab.$content Tab content's jQuery instance
             */
            options && !options.silence && this.trigger('addItem', [this, tab]);

            return tab;
        },

        /**
         * Remove a tab by it's index
         * @method removeItem
         * @param {Number} index Index of tab to be removed
         * @chainable
         */
        removeItem: function(index){
            if(typeof index === 'undefined' || index < 0 || index >= this.items.length){
                return this;
            }

            var items = this.items,
                tab = items[index],
                selected = this.get('selected');

            tab.$tab.remove();
            tab.$content.remove();
            items.splice(index, 1);

            //remove选中项，默认回到第一个tab，后续还有优化空间
            if(selected === index && items.length > 0){
                this.selectItem(0);
            }

            if(selected > index && index !== 0){
                // update position of selected tab
                this.set('selected', selected--);
            }

            /**
             * Fire when a tab is removed
             * @event removeItem
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             * @param {Object} tab Collection of tab and content element
             * @param {jQuery} tab.$tab Tab handler's jQuery instance
             * @param {jQuery} tab.$content Tab content's jQuery instance
             */
            this.trigger('removeItem', [this, tab]);

            return this;
        },

        /**
         * Select a tab by it's index
         * @method selectItem
         * @param {Number} index Index of tab to be selected. Pass in a integer that is out of items' range means select nothing
         * @chainable
         */
        selectItem: function(index){

            if(typeof index === 'undefined' || index === this.get('selected')){
                return this;
            }

            var selected = this.get('selected'),
                items = this.items,
                lastTab = items[selected],
                tab = items[index] || null;

            items[index] && this._switchTab(index);

            this.set('selected', index);

            /**
             * Fire when select a tab. When select the selected tab.
             * @event selectItem
             * @param {Event} event JQuery event
             * @param {Number} index Index of newly selected tab
             * @param {Node} node Node object
             * @param {Object} tab Collection of tab and content element
             * @param {jQuery} tab.$tab Tab handler's jQuery instance
             * @param {jQuery} tab.$content Tab content's jQuery instance
             * @param {Object} lastTab Collection of last selected tab and content element
             * @param {jQuery} lastTab.$tab Tab handler's jQuery instance
             * @param {jQuery} lastTab.$content Tab content's jQuery instance
             */
            this.trigger('selectItem', [this, index, tab, lastTab]);

            return this;
        },

        /**
         * Click a tab by it's click event
         * @method $contents
         * @protected
         * @param {Event} event The event fire on it
         * @chainable
         */
        _clickSelectTab: function(event){
            event.currentTarget && this.selectByTab(event.currentTarget);
            return this;
        },

        /**
         * Select a tab by it's document element
         * @method selectByTab
         * @param {documentElement} node
         * @chainable
         */
        selectByTab: function(node){
            var index = this.indexOf(node);
            index > -1 && this.selectItem(index);

            return this;
        },

        /**
         * Switch the selected tab and the one to be selected. Tip: you can add additional effects of switching tab by overwriting this method
         * @method _switchTab
         * @param {Number} index The tab index to be selected
         * @chainable
         */
        _switchTab: function(index){
            if(index === this.get('selected')){
                return this;
            }

            var items = this.items,
                last = this.get('selected'),
                $tab, $content;

            if(items[last]){
                $tab = items[last].$tab;
                $content = items[last].$content;
                $tab && $tab.removeClass('lbf-switchable-tab-on').hide();
                $content && $content.removeClass('lbf-switchable-tab-content-on').hide();
            }

            if(items[index]){
                $tab = items[index].$tab;
                $content = items[index].$content;
                $tab && $tab.addClass('lbf-switchable-tab-on').show();
                $content && $content.addClass('lbf-switchable-tab-content-on').show();
            }

            return this;
        },

        /**
         * Get current tab
         * @method getCurrentTab
         * @return {Object} Contains $tab and $content
         */
        getCurrentTab: function(){
            return this.items[this.get('selected')];
        },

        /**
         * Get all items
         * @returns {jQuery} JQuery object contains all items
         */
        getTabs: function(){
            var items = this.items,
                tabArr = [];
            for(var i= 0, len= items.length; i< len; i++){
                tabArr.push(items[i].$tab);
            }
            return tabArr;
        },

        /**
         * Get all tab contents
         * @returns {jQuery} JQuery object contains all tab contents
         */
        getContents: function(){
            var items = this.items,
                contentArr = [];
            for(var i= 0, len= items.length; i< len; i++){
                contentArr.push(items[i].$content);
            }
            return contentArr;
        },

        /**
         * Get the index of the items
         * @method indexOf
         * @param {documentElement} node
         * @return {Number} Not found returns -1
         */
        indexOf: function(node){
            var items = this.items;

            for(var i= 0, len= items.length; i< len; i++){
                if(items[i].$tab.get(0) === node){
                    return i;
                }
            }

            return -1;
        }
    });

    Switchable.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

            //Switchable主结构模板
            wrapTemplate: [
                '<div class="lbf-switchable">',
                    '<div class="lbf-switchable-tabs"></div>',
                    '<div class="lbf-switchable-contents"></div>',
                '</div>'
            ].join(''),

			//Switchable组件selector需要指定两个，tabs和contens，YUI是指定container，但是强行约定tab和content的映射关系
			selector: {
				tabs: '',
				contents: ''
			},

            //组件指定render容器
            container: null,

            //定制样式名
            className: '',

            //默认选中items index，第一帧
            defaultIndex: 0,

            //item内容、结构配置，最佳实践的话或者不需要了 - rains
            itemSettings: {

                //item中tab内容，支持html
                tab: '',

                //item中content内容，支持html
                content: '',

                //item中tab模板定制
                tabTemplate: [
                    '<div class="lbf-switchable-tab"><%==tab%></div>'
                ].join(''),

                //item中content模板定制
                contentTemplate: [
                    '<div class="lbf-switchable-tab-content"><%==content%></div>'
                ].join('')
            },

            //items的数据内容
            items: [
            ],

            //事件接口
            events: {
                addItem: function(){},
                removeItem: function(){},
                selectItem: function(){}
            }
        }
    });

    return Switchable;
});