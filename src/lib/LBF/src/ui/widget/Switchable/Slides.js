/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-7 上午10:24
 */
LBF.define('ui.widget.Switchable.Slides', function(require){
    var extend = require('lang.extend'),
        browser = require('lang.browser'),
		inArray = require('lang.inArray'),
        css3Detect = require('util.css3Detect'),
        Switchable = require('ui.widget.Switchable.Switchable');

    var isIE7Below = browser.msie && parseInt(browser.version, 10) < 8,
        supportTransition = css3Detect('transition');

    /**
     * Simple image slider for switching images.
     * @class Slides
     * @namespace ui.widget.Switchable
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.Switchable.Switchable
     * @uses util.Attribute
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Number} [opts.viewportSize] Size ( width or height, according to opts.hslide )
     * @param {Boolean} [opts.effect] slider switches in [hslide, vslide, none]
     * @param {Boolean} [opts.eventMode] click or hover event mode
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Number} [opts.defaultIndex] defaultIndex tab's index on initialization
     * @param {String} [opts.wrapTemplate] Wrap template of switchable
     * @param {String} [opts.tabTemplate] Template for each tab.
     * @param {String} [opts.contentTemplate] Template for each tab content.
     * @param {Boolean} [opts.autoPlay=false] Auto play or not
     * @param {Number} [opts.autoPlayGap=4000] Auto play time gap
     * @param {Boolean} [opts.stopOnHover=true] Stop auto play when mouse over sliders
     * @param {Object[]} [opts.itemSettings] Default options for each tab
     * @param {String|jQuery|documentElement} [opts.itemSettings.tab] Tab handler's innerHTML
     * @param {String|jQuery|documentElement} [opts.itemSettings.content] Tab content's innerHTML
     * @param {String} [opts.itemSettings.tabTemplate] Template for the tab
     * @param {String} [opts.itemSettings.contentTemplate] Template for the tab content
     * @param {String} [opts.itemSettings.closable] Is the tab closable
     * @param {Object[]} [opts.items] All items and their contents' options
     * @param {String|jQuery|documentElement} [opts.items[].tab] Tab's innerHTML
     * @param {String|jQuery|documentElement} [opts.items[].content] Tab's innerHTML
     * @param {String} [opts.items[].tabTemplate] Template for the tab
     * @param {String} [opts.items[].contentTemplate] Template for the tab content
     * @param {Object} [opts.events] Events to be bound to switchable
     * @param {Function} [opts.events.addItem] Callback when a tab is add
     * @param {Function} [opts.events.selectItem] Callback when a tab is defaultIndex
     * @param {Function} [opts.events.removeItem] Callback when a tab is removed
     * @example
     *      new Slides({
     *          container: 'someContainerSelector',
     *
     *          defaultIndex: 0,
     *
     *          // specialize tab and content html
     *          itemSettings: {
     *              tabTemplate: '<li class="lbf-slides-btn-item"><a class="lbf-slides-btn" href="javascript:;"><%==tab%></a></li>',
     *              contentTemplate: '<li class="lbf-slides-item"><%==content%></li>'
     *          },
     *
     *          // all items
     *          items: [
     *              {
     *                  tab: 'tab1',
     *                  content: 'tab1 content',
     *
     *                  // use different template for a specific tab
     *                  tabTemplate: '<li class="lbf-slides-btn-item"><a class="lbf-slides-btn" href="javascript:;"><%==tab%></a></li>',
     *                  contentTemplate: '<li class="lbf-slides-item"><%==content%></li>'
     *              },
     *              {
     *                  tab: 'tab2',
     *                  content: 'tab2 content'
     *              }
     *          ],
     *
     *          viewportSize: 365
     *      });
     */
    var Slides = Switchable.inherit({
        /**
         * Delegate events for default UI action
         * @property events
         */
        events: {
            'click .lbf-slides-prev': 'prev',
			'click .lbf-slides-next': 'next',
			'click .lbf-slides-tabs a': '_onClickBtn',
            'mouseenter .lbf-slides-tabs a': '_onMouseInBtn',
            'mouseout > .lbf-slides-tabs a': '_onMouseOutBtn'
        },

        /**
         * Fast access to frequently used elements
         * @property elements
         */
        elements: {
            /**
             * Tab's container ( wrap )
             * @property $tabs
             */
            $tabs: '.lbf-slides-tabs',

            /**
             * Tab
             * @property $tab
             */
            $tab: '.lbf-slides-tabs li',

            /**
             * Tab's button ( wrap )
             * @property $tabsBtn
             */
			$tabsBtn: '.lbf-slides-tabs a',

            /**
             * Content's container ( wrap )
             * @property $contents
             */
            $contents: '.lbf-slides-contents',

            /**
             * Content's items ( wrap )
             * @property $contentItems
             */
			$contentItems: '.lbf-slides-contents li',
            /**
             * Prevous button
             * @property $prevBtn
             */
            $prevBtn: '.lbf-slides-prev',
            /**
             * Next button
             * @property $nextBtn
             */
            $nextBtn: '.lbf-slides-next'
        },

        render: function(){
            var node = this;

            if(node.get('selector')) {

                //selector模式
                var selector = node.get('selector'),
                    items = [];

                node.setElement(selector);

                //缓存items数据
                node.items = [];

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

                node.set('width', node.width());
                node.set('height', node.height());
            }else{
                //create方案
                Switchable.prototype.render.apply(this, arguments);
            }

            node.update();

            //设置上一帧、下一帧按钮文本
            this.$prevBtn.text(this.get('prevText'));
            this.$nextBtn.text(this.get('nextText'));

            //默认选中帧
            this._switchTab(this.get('defaultIndex'));
            this.items[this.get('defaultIndex')].$tab.addClass('lbf-slides-tab-selected');
            this.items[this.get('defaultIndex')].$content.addClass('lbf-slides-content-selected');
            this.set('selected', this.get('defaultIndex'));

            //自动轮播
            this.get('autoPlay') && this.startPlay();

            //鼠标悬停在面板上是否停止自动播放
            this.get('autoPlay') && this.get('stopOnHover') && this.hover(
                function(){
                    node.stopPlay();
                },
                function(){
                    node.startPlay();
                }
            );

            return this;
        },

        /**
         * Update all state and cache size for animations
         * @method update
         * @chainable
         */
        update: function(){
            var $ = this.jQuery,
                items = this.items,
                effect = this.get('effect'),
                containerPos = 0,
                itemWidth,
                itemHeight;

            //后续要优化
            this.$contentItems = this.find('.lbf-slides-contents').children('li');

            this.$contentItems.each(function(i){
                itemWidth = $(this).width();
                itemHeight = $(this).height()

                if(effect === 'hslide'){
                    items[i].pos = containerPos;
                    containerPos += (items[i].size = $(this).width());
                }else if(effect === 'vslide'){
                    items[i].pos = containerPos;
                    containerPos += (items[i].size = $(this).height());
                }
            });

            if(effect === 'hslide'){
                this.$contents.width(containerPos);
            }else if(effect === 'vslide'){
                this.$contents.height(containerPos);
            }

            this.width(this.get('width'));
            this.height(this.get('height'));

            return this;
        },

        /**
         * Switch the selected tab and the one to be selected. Tip: you can add additional effects of switching tab by overwriting this method
         * @method switchTab
         * @param {Number} index The tab index to be selected
         * @chainable
         */
        _switchTab: function(index){
            var effect = this.get('effect'),
                items = this.items,
                selected = this.get('selected'),
                len = items.size,
                $contents = this.$contents,
                startPos = items[selected] ? items[selected].pos : 0,
                endPos = items[index] ? items[index].pos : 0,
                node = this;

            //异常返回
            if(index < 0 || index >= len || selected < 0 || selected >= len){
                return this;
            }

            //如果效果为hslide
            if(effect === 'hslide'){
                if(supportTransition){
                    $contents.css('marginLeft', -endPos)
                } else {
                    $contents
                        .stop()
                        .animate({
                            'marginLeft': -endPos
                        });
                }
            //如果效果为vslide
            }else if(effect === 'vslide'){
                if(supportTransition){
                    $contents.css('marginTop', -endPos)
                } else {
                    $contents
                        .stop()
                        .animate({
                            'marginTop': -endPos
                        });
                }
            //如果效果为none
            }else if(effect === 'none'){
                this.$contentItems.each(function(i){
                    node.$(this).hide();
                });
                this.$contentItems.eq(index).show();
            }

            return this;
        },

        /**
         * Callback when mouse in a btn
         * @method mouseOverTab
         * @protected
         * @param {Event} event
         */
        _onMouseInBtn: function(event){
            var $target = this.jQuery(event.currentTarget);

            isIE7Below && $target.addClass('lbf-slides-tab-hover');
            if(this.get('eventMode') === 'hover'){
                this.selectItem(this.indexOf($target.parent().get(0)));
            }
        },

        /**
         * Callback when mouse out a btn
         * @method _onMouseOutBtn
         * @param {Event} event
         * @protected
         */
        _onMouseOutBtn: function(event){
            var $target = this.jQuery(event.currentTarget);
            isIE7Below && $target.removeClass('lbf-slides-tab-hover');
        },

        /**
         * Callback when click a btn
         * @method _onClickBtn
         * @param {Event} event
         * @protected
         */
        _onClickBtn: function(event){
            var $target = this.jQuery(event.currentTarget);
			this.$tabs.find('.lbf-slides-tab-selected').removeClass('lbf-slides-tab-selected');
			$target.parent().addClass('lbf-slides-tab-selected');
            this.$contents.find('.lbf-slides-content-selected').removeClass('lbf-slides-content-selected');
            this.items[this.get('selected')].$content.addClass('lbf-slides-content-selected');

            this.selectItem(inArray($target.get(0), this.$tabs.children().children()));
        },

        /**
         * Start auto play sliders
         * @method startPlay
         * @chainable
         */
        startPlay: function(){
            var handler = this.get('autoPlayHandler');

            if(handler){
                handler.run();
                return this;
            }

            var node = this,
                silent = false;

            require.async(['util.Tasks'], function(Tasks){
                var handler = Tasks.add(function(){
                    silent = true;
                    node.next();
                }, node.get('autoPlayGap')).run();

                node
                    .set('autoPlayHandler', handler)
                    .on('change:autoPlayGap', function(event, autoPlayGap){
                        var handler = node.get('autoPlayHandler');
                        handler && handler.setGap(autoPlayGap);
                    })
                    .on('change:selected', function(){
                        if(silent){
                            silent = false;
                            return;
                        }

                        var handler = node.get('autoPlayHandler');
                        handler && handler.delay(node.get('autoPlayGap'));
                    });
            });

            return this;
        },

        /**
         * Stop auto play sliders
         * @method stopPlay
         * @chainable
         */
        stopPlay: function(){
            this.get('autoPlayHandler') && this.get('autoPlayHandler').pause();
            return this;
        },

        /**
         * Switch to previous slider
         * @method prev
         * @chainable
         */
        prev: function(){
            var len = this.items.length;

            this.selectItem((this.get('selected') + len - 1) % len);
			this.$tabs.find('.lbf-slides-tab-selected').removeClass('lbf-slides-tab-selected');
			this.items[this.get('selected')].$tab.addClass('lbf-slides-tab-selected');
            this.$contents.find('.lbf-slides-content-selected').removeClass('lbf-slides-content-selected');
            this.items[this.get('selected')].$content.addClass('lbf-slides-content-selected');

            return this;
        },

        /**
         * Switch to next slider
         * @method next
         * @chainable
         */
        next: function(){
            var len = this.items.length;

            this.selectItem((this.get('selected') + 1) % len);
            this.$tabs.find('.lbf-slides-tab-selected').removeClass('lbf-slides-tab-selected');
            this.items[this.get('selected')] && this.items[this.get('selected')].$tab.addClass('lbf-slides-tab-selected');
            this.$contents.find('.lbf-slides-content-selected').removeClass('lbf-slides-content-selected');
            this.items[this.get('selected')] && this.items[this.get('selected')].$content.addClass('lbf-slides-content-selected');

            return this;
        }
    });

    Slides.include({
        settings: extend(true, {}, Switchable.settings, {

            //selector
            selector: null,

            width: 'auto',

            height: 'auto',

            //Switchable结构模板
            wrapTemplate: [
                '<div class="lbf-slides">',
                    '<ul class="lbf-slides-tabs"></ul>',
                    '<ul class="lbf-slides-contents"></ul>',
                    '<a href="javascript:;" class="lbf-slides-prev"></a>',
                    '<a href="javascript:;" class="lbf-slides-next"></a>',
                '</div>'
            ].join(''),

            //item默认内容、格式配置，最佳实践不建议暴露给使用者了 - rains
            itemSettings: {

                //item中tab内容，支持html
                tab: '',

                //item中content内容，支持html
                content: '',

                index: 'auto',

                //item中tab模板定制
                tabTemplate: '<li><a href="javascript:;"></a></li>',

                //item中content模板定制
                contentTemplate: '<li><%==content%></li>'
            },

            //触发切换的事件类型，默认为'click', [click, hover]
            eventMode: 'click',

            //slide效果，['hslide', 'vslide', 'none', 'fade(not yet)']
            effect: 'hslide',

            //step
            //step: 1,

            //默认选中items index，第一帧
            defaultIndex: 0,

            //由hslide、vslide决定
            viewportSize: 'auto',

            //是否自动轮播
            autoPlay: false,

            //轮播间隔
            autoPlayGap: 4000,

            //鼠标悬停在面板上是否停止自动播放，默认为true
            stopOnHover: true,

            //上一帧按钮默认文案
            prevText: '<',

            //下一帧按钮默认文案
            nextText: '>'
        })
    });

    return Slides;
});
