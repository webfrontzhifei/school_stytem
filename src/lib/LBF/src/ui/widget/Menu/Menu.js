/**
 * @fileOverview
 * @author sqchen
 * @version 1
 * Created: 13-12-18 下午2:03
 */
LBF.define('ui.widget.Menu.Menu', function(require) {
    var proxy = require('lang.proxy'),
        extend = require('lang.extend'),
        forEach = require('lang.forEach'),
        isArray = require('lang.isArray'),
        template = require('util.template'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    require('{theme}/lbfUI/css/Menu.css');

    /**
     * Simple menu component for select-like cases
     * @class Menu
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.Dropdown.Dropdown
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Object[]} [opts.items] Menu items' items
     * @param {String} [opts.items[].content] Menu item's content
     * @param {String} [opts.items[].href] Menu item's href
     * @param {String} [opts.items[].direction] Menu item's direction 设置某级子菜单的方向,缺省为'y',即垂直排版
     * @param {String} [opts.items[].target] Menu item's target, like blank/self, when it's a pure link
     * @param {Boolean} [opts.items[].disabled] Menu item disable state
     * @param {Object} [opts.events] Events to be bound to the node
     * @param {Function} [opts.events.select] Callback when an items is selected, no matter value is changed or not.
     * @param {String} [opts.menuTemplate] Template for menu's ul container.
     * @param {String} [opts.itemTemplate] Template for menu's item.
     * @example
        new Menu({
            container: $drawArea,
            items: [
                {
                    content: 'content1',
                    href: '#;',
                    value: '1',
                    direction: 'right',     //设置某级子菜单的方向
                    target: '_blank',
                    items: [
                        {
                            content: 'content11',
                            href: '#;',
                            value: '11',
                            items: [
                                {
                                    content: 'content111',
                                    href: '#;',
                                    value: '111',
                                    disabled: true,
                                    items: []
                                },
                                {
                                    type: 'split'
                                },
                                {
                                    content: 'content112',
                                    href: '#;',
                                    value: '112',
                                    items: []
                                },
                                {
                                    content: 'content113',
                                    href: '#;',
                                    value: '112',
                                    items: []
                                },
                                ......
                            ]
                        },
                        ......
                    ]
                },
                ......
            ],
            events: {
                select: function(event, conf, $item){
                    console.log(value);
                    console.log(conf);
                    console.log($item);
                }
            }
        });
     */
    var Menu = Dropdown.inherit({
        events: {
            // only care about direct item
            'click  >.lbf-menu-panel >.lbf-menu-item >.lbf-menu-label': 'clickItem',
            'mouseenter >.lbf-menu-panel >.lbf-menu-item >.lbf-menu-label': 'mouseenterItem',

            // draw back menu when item selected
            'select': 'selectItem'
        },

        /**
         * Render the node
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            this.set('content', this.renderItems());

            Dropdown.prototype.render.apply(this, arguments);

            var itemsConfArr = this.get('items'),
                $labels = this.find('.lbf-menu-label'),
                labelIndex = 0,
                subMenus = this.subMenus = [],
                conf;

            for(var i= 0, len= itemsConfArr.length, items; i<len; i++){
                conf = itemsConfArr[i];
                items = conf.items;
                if(conf.isSelected && conf.isSelected == 1) {
                    this.set('defaultSelectedValue', conf.value);
                }
                if(items && items.length > 0){
                    subMenus[i] =
                        new Menu({
                            trigger: $labels.eq(labelIndex),
                            direction: conf.direction || this.get('direction'),
                            show: conf.show || this.get('show'),
                            isHideAfterSelect: conf.isHideAfterSelect || this.get('isHideAfterSelect'),
                            adjust: conf.adjust || { x:0, y: 0},
                            level: this.get('level') + 1,
                            items: items
                        });

                    conf.disabled && subMenus[i].disable();
                }

                conf.type !== 'split' && labelIndex++;
            }

            return this;
        },

        /**
         * init items
         * @method initItems
         * @protected
         * @chainable
         */
        renderItems: function() {
            var itemTemplate = this.template(this.get('itemTemplate'));

            return itemTemplate({
                items: this.get('items'),
                level: this.get('level')
            });
        },

        /**
         * Handler when item clicked
         * @method clickItem
         * @protected
         * @param {Event} event
         * @chainable
         */
        clickItem: function(event) {
            var $item = this.$(event.target).closest('.lbf-menu-label'),
                index = $item.data('index'),
                itemConf = this.get('items')[index];
            // if no sub menu, then select current item
            // 
            // 
            // 
            // 
            if(itemConf.type !== 'split' && !(itemConf.items && itemConf.items.length > 0)){
                this.select(itemConf, $item, event);
            }
        },

        /**
         * Handler when mouseenter item
         * @method mouseenterItem
         * @protected
         * @param {Event} event
         * @chainable
         */
        mouseenterItem: function(event) {
            var $item = this.$(event.target).closest('.lbf-menu-label'),
                index = $item.data('index'),
                itemConf = this.get('items')[index];

            /**
             * Fired when mouse enter item
             * @event mouseenterItem
             * @param {jQuery.event} event
             * @param {Object} conf Config of selected item
             * @param {jQuery} $menu JQuery instance of menu
             */
            this.trigger('mouseenterItem', [itemConf, $item]);
        },


        /**
         * Handler when mouseleave menu
         * @method mouseleaveMenu
         * @protected
         * @param {Event} event
         * @chainable
         */
        mouseleaveMenu: function(event) {
            var showConf = this.get('show'),
                $menu = this.$(event.target),
                index, items;

            if($menu.is('lbf-menu')){
                items = this.get('items');
            } else {
                index = $menu.siblings('.lbf-menu-label').data('index');
                items = this.getItem(index).items;
            }

            /**
             * Fired when mouse leave menu (including sub menu)
             * @event mouseleaveMenu
             * @param {jQuery.event} event
             * @param {Object} conf Config of selected item
             * @param {jQuery} $menu JQuery instance of menu
             */
            this.trigger('mouseleaveMenu', [items, showConf, $menu]);
        },

        /**
         * Handler when item selected
         * @method selectItem
         * @protected
         * @chainable
         */
        selectItem: function(){
            this.get('isHideAfterSelect') && this.close();
        },

        /**
         * Invoke When an item is selected
         * @method select
         * @param {Object} conf Config of selected item
         * @param {jQuery} $item JQuery instance of item to be selected
         * @chainable
         */
        select: function(itemConf, $item, event){

            // if disabled
            if($item.closest('lbf-menu-item').is('.lbf-menu-item-disable')){
                return this;
            }
            
            $item.parents('div.lbf-menu').find('a').removeClass('selected');
            var $subMenusPrev = $item.parents('div.lbf-menu').eq(0).prev();
            if($subMenusPrev.hasClass('lbf-menu-label-hasSubMenu')) {
                $subMenusPrev.addClass('selected');
            }
            $item.addClass('selected');

            // pure link
            if(event && /undefined|#;|javascript:(?:void\(0?\))?;/.test($item.prop('href'))){
                event.preventDefault();
            }

            /**
             * Fired when item selected
             * @event select
             * @param {jQuery.event} event
             * @param {Object} conf Config of selected item
             * @param {jQuery} $menu JQuery instance of menu
             */
            this.trigger('select', [itemConf, $item]);

            return this;
        },

        /**
         * Get item by index
         * @method getItemByIndex
         * @param {Number|Array} index Index of item, array means item from sub menu
         * @return {Object} JQuery instance of item and subMenu
         */
        getItemByIndex: function(index){
            var subMenus = this.subMenus;

            // locate current level item
            if(isArray(index) && index.length === 1){
                index = index[0];
            }

            if(!isArray(index)){
                return {
                    $item: this.find('>.lbf-menu-item').eq(index),
                    subMenu: subMenus[index]
                };
            }

            // seek item from sub menu
            return subMenus[index[0]] && subMenus[index.shift()].getItemByIndex(index);
        },

        open: function(){
            Dropdown.prototype.open.apply(this, arguments);

            this.css('zIndex', zIndexGenerator());
        },

        /**
         * Disable menu
         * @chainable
         */
        disable: function(){
            Dropdown.prototype.disable.apply(this, arguments);

            this.addClass('lbf-menu-disable');
            return this;
        },

        /**
         * Enable menu
         * @chainable
         */
        enable: function(){
            Dropdown.prototype.enable.apply(this, arguments);

            this.removeClass('lbf-menu-disable');
            return this;
        },

        /**
         * Disable item by index, multiple indexes are accepted as batch argument
         * @method disableItem
         * @param {Number|Array} index Index of item, array means item from sub menu
         * @chainable
         */
        disableItem: function(){
            var args = [].slice.call(arguments, 0),
                menu = this;

            forEach(args, function(index){
                var item = menu.getItemByIndex(index);

                item.$item.addClass('lbf-menu-item-disable');

                item.subMenu && item.subMenu.disable();

                /**
                 * Fired when an item disabled
                 * @event disableItem
                 * @param {Number|Array} index Index of item, array means item from sub menu
                 * @param {jQuery} item JQuery instance of item
                 */
                menu.trigger('disableItem', [index, item]);
            });

            return this;
        },

        /**
         * Enable item by index, multiple indexes are accepted as batch argument
         * @method enableItem
         * @param {Number|Array} index Index of item, array means item from sub menu
         * @chainable
         */
        enableItem: function(){
            var args = [].slice.call(arguments, 0),
                menu = this;

            forEach(args, function(index){
                var item = menu.getItemByIndex(index);

                item.$item.removeClass('lbf-menu-item-disable');

                item.subMenu && item.subMenu.enable();

                /**
                 * Fired when an item disabled
                 * @event enableItem
                 * @param {Number|Array} index Index of item, array means item from sub menu
                 * @param {jQuery} item JQuery instance of item
                 */
                menu.trigger('enableItem', [index, item]);
            });

            return this;
        }
    });

    Menu.include(extend(true, {}, Dropdown, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            wrapTemplate: [
                '<div class="lbf-popup lbf-menu">',
                    '<%== content %>',
                '</div>'
            ].join(''),

            itemTemplate: [
                '<ul class="lbf-menu-panel">',
                    '<% for(var i= 0, len= items.length, item; i<len; i++){ %>',
                        '<% item = items[i]; %>',
                        '<% if(item.type === \'split\') { %>',
                            '<li class="lbf-menu-split"></li>',
                        '<% } else { %>',
                            '<li class="lbf-menu-item <%== item.disabled ? \'lbf-menu-item-disable\' : \'\' %>">',
                                '<a class="lbf-menu-label <%== item.isSelected && item.isSelected == 1 ? \'selected\' : \'\' %> <%== item.items && item.items.length > 0 ? \'lbf-menu-label-hasSubMenu\' : \'\' %>" title="<%== item.title || \'\' %>" target="<%== item.target || \'_self\' %>" href="<%== item.href || \'javascript:;\' %>" data-level="<%== level %>" data-index="<%== i %>" data-value="<%== item.value %>"><%== item.content %></a>',
                            '</li>',
                        '<% } %>',
                    '<% } %>',
                '</ul>'
            ].join(''),

            direction: 'right',

            level: 0,

            isHideAfterSelect: true,

            adjust: {
                x: 0,
                y: 0
            },

            events: {}
        }
    }));

    return Menu;
});