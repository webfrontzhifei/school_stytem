/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-7 上午10:24
 */
LBF.define('ui.widget.Switchable.TabView', function(require){

    var extend = require('lang.extend'),
		forEach = require('lang.forEach'),
        browser = require('lang.browser'),
		proxy = require('lang.proxy'),
        Switchable = require('ui.widget.Switchable.Switchable');

    var isIE7Below = browser.msie && parseInt(browser.version, 10) < 8;
    var timer = null;

    /**
     * Simple tab view.
     * @class TabView
     * @namespace ui.widget.Switchable
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.Switchable.Switchable
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
     * @param {String} [opts.itemSettings.closeable] Is the tab closeable
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
     *      new TabView({
     *          container: 'someContainerSelector',
     *
     *          defaultIndex: 0,
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
    var TabView = Switchable.inherit({
        /**
         * Nodes default UI element，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-tabview-tabs li': '_clickSelectTab',
            'click .lbf-tabview-close': '_clickCloseTab',
            'mouseover .lbf-tabview-tabs li': '_mouseOverTab',
            'mouseout .lbf-tabview-tabs li': '_mouseOutTab'
        },

        /**
         * Nodes default UI events
         * @property events
         * @type Object
         * @protected
         */
        elements: {
            '$tabs': '.lbf-tabview-tabs',
            '$contents': '.lbf-tabview-contents'
        },

        render: function(){

            var node = this;

            //缓存items数据
            node.items = [];

            if(node.get('selector')) {

                //selector模式
                var selector = node.get('selector'),
                    items = [],
                    $el = node.$(selector);

                node.setElement($el);

                node.$tabs.children().each(function(index){
                    var tab = {
                        $tab : node.$(this),
                        $content : node.$contents.children().eq(index)
                    };

                    items.push(tab);
                });

                node.items = items;

                //定制样式接口
                node.get('className') && node.addClass(node.get('className'));

                //选中默认项
                node.selectItem(node.get('defaultIndex'));
            }else{
                Switchable.prototype.render.apply(this, arguments);
            }
        },

        /**
         * url查询内容的添加或替换
         * @method _queryString
         * @params key, @type String
         * @params value, @type String
         */
        _queryString: function(key, value) {
            // 有则替换，无则加勉
            var href = location.href.split('#')[0], root = '', hash = location.hash;
            // 查询数组
            var arr_query = href.split('?'), arr_map = [];
            if (arr_query.length > 1) {     
                if (arr_query[1] != '') {
                    arr_map = this.jQuery.grep(arr_query[1].split('&'), function(query) {
                        return query.split('=')[0] != key;
                    });
                }
                root = arr_query[0] + '?' + arr_map.join('&') + '&';
                root = root.replace('?&', '?');
            } else {
                root = href + '?';
            }
            return root + key + '=' + value + hash;
        },

        /**
         * switch tab - 私有方法是不是以_开头命名，对外应该暴露selectItem而不是switchTab
         * @method _switchTab
         * @type Number
         */
        _switchTab: function(index){

            //如果当前选中，返回
            if(index === this.get("selected")){
                return this;
            }

            var items = this.items,
                selected = this.get("selected"),
                $tab,
                $content;

            //切换当前项
            if(items[selected]){
                $tab = items[selected].$tab;
                $tab && $tab.removeClass('lbf-tabview-tab-selected');

                if( $content = items[selected].$content ){
                    $content
                        .removeClass('lbf-tabview-content-selected')
                        /**
                         * Fired when current tab is switched in
                         * @event switchIn
                         * @param {jQuery.Event} event
                         * @param {TabView} tabView
                         */
                        .trigger('switchOut', this);
                }
            }

            //高亮选中项
            if(items[index]){
                $tab = items[index].$tab;
                $tab && $tab.addClass('lbf-tabview-tab-selected');

                if( $content = items[index].$content ){
                    $content
                        .addClass('lbf-tabview-content-selected')
                        /**
                         * Fired when current tab is switched in
                         * @event switchIn
                         * @param {jQuery.Event} event
                         * @param {TabView} tabView
                         */
                        .trigger('switchIn', this);
                }
            }

            if (this.get('history') && history.replaceState) {
                history.replaceState(null, document.title, this._queryString('targetTab', index));
            }

            return this;
        },

        /**
         * Click close button
         * @method clickCloseTab
         * @chainable
         */
        _clickCloseTab: function(event){
            var $target = this.jQuery(event.target);
            return this.removeItem(this.indexOf($target.parent().get(0)));
        },

        /**
         * Mouse hover tab
         * @method mouseOverTab
         * @chainable
         */
        _mouseOverTab: function(event){
            var node = this,
                $target = this.jQuery(event.currentTarget);

            isIE7Below && $target.addClass('lbf-tabview-tab-hover');

            if(this.get('eventMode') === 'hover'){
                timer = setTimeout(function(){
                    node.selectItem(node.indexOf($target.get(0)));
                    clearTimeout(timer);
                }, node.get('hoverDelay'));
            }

            return this;
        },

        /**
         * Mouse out of tab
         * @method mouseOutTab
         * @chainable
         */
        _mouseOutTab: function(event){
            timer && clearTimeout(timer);
            isIE7Below && this.jQuery(event.currentTarget).removeClass('lbf-tabview-tab-hover');
            return this;
        }
    });

    TabView.include({
        settings: extend(true, {}, Switchable.settings, {

            //TabView结构模板
            wrapTemplate: [
                '<div class="lbf-tabview">',
                    '<ul class="lbf-tabview-tabs"></ul>',
                    '<ul class="lbf-tabview-contents"></ul>',
                '</div>'
            ].join(''),

            // 改变url history标记记录当前选项卡
            history: false,

			//TabView组件selector模式
			selector: null,

            //组件指定render容器
            container: null,

            //定制样式名
            className: '',

			//默认选中items index，第一帧
            defaultIndex: 0,

            // 下面是JS侧根据URL关键查询确定defaultIndex的处理
            /*(function() {
                var arr_url = location.href.split('?'), index = 0;
                if (history.replaceState && arr_url.length == 2) {
                    arr_url[1].split('&').forEach(function(part) {
                        var arr_part = part.split('=');
                        if (arr_part.length == 2 && arr_part[0] == 'targetTab') {
                            index = arr_part[1] * 1;
                        }
                    });
                }
                return index;
            })(),*/

            //item默认内容、格式配置，最佳实践不建议暴露给使用者了 - rains
            itemSettings: {

                //item中tab内容，支持html
                tab: '',

                //item中content内容，支持html
                content: '',

                closeable: false,

                //item中tab模板定制
                tabTemplate: [
                    '<li>',
                        '<span><%==tab%></span>',
                        '<% if(closeable){ %>',
                            '<a href="javascript:;" class="lbf-tabview-close"></a>',
                        '<% } %>',
                    '</li>'
                ].join(''),

                //item中content模板定制
                contentTemplate: [
                    '<li><%==content%></li>'
                ].join('')
            },

            //触发切换的事件类型，默认为'click', [click, hover]
            eventMode: 'click',

            hoverDelay: 200
        })
    });

    return TabView;
});
