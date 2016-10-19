/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-18 下午2:03
 */
LBF.define('ui.widget.Dropdown.Dropdown', function(require){
    var proxy = require('lang.proxy'),
        template = require('util.template'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Popup = require('ui.Nodes.Popup');

    require('{theme}/lbfUI/css/Dropdown.css');

    /**
     * Simple lbf-dropdown component for select-like cases
     * @class Menu
     * @namespace ui.widget.Dropdown
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Popup
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node, default value is the parent of node
     * @param {Boolean} [opts.isSingle] if is Single mode
     * @param {String|jQuery|documentElement} [opts.trigger] Select an existed tag and replace it with this. If opts.container is set, opts.trigger will fail
     * @param {Object[]} [opts.content] Menu' content
     * @param {Object} [opts.show] Menu' show param
     * @param {Object} [opts.show.mode] the event mode of opening up menu
     * @param {Object} [opts.show.delay] the detention of opening up menu
     * @param {Object} [opts.show.effect] the effect of opening up menu
     * @param {Object} [opts.hide] Menu' hide param
     * @param {Object} [opts.hide.mode] the event mode of hiding menu
     * @param {Object} [opts.hide.delay] the detention of hiding menu
     * @param {Object} [opts.hide.effect] the effect of hiding menu
     * @param {Object} [opts.events] Events to be bound to the node
     * @example
     *      new Dropdown({
     *          container: 'someContainerSelector',
     *          trigger: 'JQ selector'.
     *          content: '',
     *          show {
     *              mode: 'click',
     *              delay: 0,
     *              effect: function(){
     *                  this.show();
     *              }
     *          },
     *          hide: {
     *              delay: 0,
     *              effect: function(){
     *                  this.hide();
     *              }
     *          },
     *          events: {
     *              load: function(){},
     *              unload: function(){},
     *              show: function(){},
     *              hide: function(){},
     *              enable: function(){},
     *              disable: function(){}
     *          }
     *      });
     */
    var Dropdown = Popup.inherit({
        events: {
            'change:direction': 'onChangeDirection'
        },

        /**
         * Render the node
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var $ = this.jQuery,
                isSingle = this.get('isSingle'),
                trigger = this.get('trigger'),
                content = this.get('content'),
                show = this.get('show');

            //非单例模式
            if(!isSingle) {
                //trigger不存在
                if(!trigger || (this.jQuery(trigger).length === 0)){
                    throw new Error('Assign valid trigger or content to Dropdown');
                    return;
                }

                //缓存
                var $trigger = this.$trigger = $(trigger);

                // use trigger's parent as default container
                !this.get('container') && this.set('container', $trigger.offsetParent2());

                Popup.prototype.render.apply(this, arguments);

                //根据交互模式定制事件绑定
                this._adjustMode();

                //默认设置popup不展开标志
                this.set('isShown', false);
            } else {                    //如果设置为单例模式
                var _this = this;

                this.$lastTrigger = [];

                this.set('container', 'body');

                Popup.prototype.render.apply(this, arguments);

                this.set('isShown', false);

                $(document).bind('click.singleDropdownClose', function(e) {
                    //如果在hover模式下，鼠标在label上时触发点击，不让隐藏optionPanel
                    var target = e && e.target;

                    if(target && _this.$trigger) {
                        if(
                            $.contains(_this.el, target)
                            //解决target不在整个文档流内则不做处理
                            || !$.contains(document, target)
                            || _this.el === target
                            || $.contains(_this.$trigger.get(0), target) || _this.$trigger.get(0) === target
                        ) {
                            return;
                        }
                    }

                    _this.close();
                });
            }

            return this;
        },

        _adjustMode: function() {
            var _this = this,
                $ = _this.jQuery,
                show = _this.get('show');

            //如果展开事件模式为click
            if(show.mode === 'click'){
                //绑定点击事件
                this.$trigger.click(function(){
                    if(_this.get('isShown') === false){
                        _this.open();
                        setTimeout(function(){
                            $(document).bind('click.close', _this._tryHidePanel);
                        }, 0);
                    }else{
                        _this.close();
                        $(document).unbind('click.close', _this._tryHidePanel);
                    }
                });
            }else if(show.mode === 'hover'){
                //如果展开事件模式为hover

                //对labelPanel绑定hover事件
                this.$trigger.hover(proxy(_this.open, _this), function(e){
                    var relatedTarget = e.toElement || e.relatedTarget;
                    if($.contains(_this.el, relatedTarget) || _this.el === relatedTarget){
                        return;
                    }
                    _this._tryHidePanel();
                });

                //对optionPanel绑定hover事件
                this.hover(proxy(_this.open, _this), function(e){
                    var relatedTarget = e.toElement || e.relatedTarget;
                    if($.contains(_this.$trigger.get(0), relatedTarget) || _this.$trigger.get(0) === relatedTarget){
                        return;
                    }
                    _this._tryHidePanel();
                });
            }else if(show.mode === 'none'){

            }

            _this._tryHidePanel = function(e){
                //如果在hover模式下，鼠标在label上时触发点击，不让隐藏optionPanel
                var target = e && e.target;

                if(target){
                    if(
                        $.contains(_this.el, target) || _this.el === target
                        || $.contains(_this.$trigger.get(0), target) || _this.$trigger.get(0) === target
                        //解决target不在整个文档流内则不做处理
                        || !$.contains(document, target)
                    ){
                        return;
                    }
                }

                _this.close();

                $(document).unbind('click.close');
            };
        },

        _adjustPos: function() {
            var $ = this.$,
                container = this.get('container'),
                show = this.get('show'),
                direction = this.get('direction'),
                adjust = this.get('adjust'),
                $trigger = this.$trigger,
                $win = this.$(window),
                winHeight = $win.height(),
                winWidth = $win.width(),
                scrollTop = $win.scrollTop(),
                scrollLeft = $win.scrollLeft(),
                popupWidth = this.outerWidth(),
                popupHeight = this.outerHeight(),
                offsetParent = $trigger.offsetParent(),
                outerPosition = $trigger.outerPosition(),
                offset = $trigger.offset(),
                pos = {};

            // container = $trigger.parent()
            if(container[0] !== $('body')[0] && container !== 'body') {
                triggerPos = {
                    top: outerPosition.top + offsetParent.scrollTop(),
                    left: outerPosition.left + offsetParent.scrollLeft()
                };
            } else {
                /**
                 * container = body
                 */
                triggerPos = {
                    top: offset.top,
                    left: offset.left
                }
            }

            // 按照默认方向显示popup
            switch(direction){
                case 'top':
                    pos = {
                        top: triggerPos.top - popupHeight,
                        left: triggerPos.left
                    };
                    break;
                case 'right':
                    pos = {
                        top: triggerPos.top,
                        left: triggerPos.left + $trigger.outerWidth()
                    };
                    break;
                case 'bottom':
                    pos = {
                        top: triggerPos.top + $trigger.outerHeight(),
                        left: triggerPos.left
                    };
                    break;
                case 'left':
                    pos = {
                        top: triggerPos.top,
                        left: triggerPos.left - popupWidth
                    };
                    break;
            }

            //adjust微调值
            pos.top += adjust.y;
            pos.left += adjust.x;

            /*
             * 视窗适配
             */
            var moveX, moveY;

            //Y adjust. Tip过大，这种情况属于设计问题了
            if(winHeight < popupHeight){
                moveY = 0;
            } else {
                //两边都secured，不动，基本也只能调整Tip高度来解决了
                if(winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < popupHeight && triggerPos.top < popupHeight){
                    moveY = 0;
                }else{
                    //下secured
                    if(direction === 'bottom' && winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < popupHeight){
                        moveY = $trigger.outerHeight() + popupHeight
                    }else if(direction === 'top' && triggerPos.top < popupHeight){
                        //上secured
                        moveY = -$trigger.outerHeight() - popupHeight
                    }else if(triggerPos.top + popupHeight > winHeight + scrollTop){
                        moveY = triggerPos.top + popupHeight - winHeight - scrollTop;
                    } else {
                        moveY = 0;  
                    }
                }
            }

            //X adjust. Tip过大，这种情况属于设计问题了
            if(winWidth < popupWidth){
                moveX = 0;
            } else {
                //两边都secured，不动，基本也只能调整Tip宽度来解决了
                if(winWidth + scrollLeft - triggerPos.left - $trigger.outerWidth() < popupWidth && triggerPos.left < popupWidth){
                    moveX = 0;
                }else{
                    //右secured
                    if(direction === 'right' && winWidth - triggerPos.left - $trigger.outerWidth() < popupWidth){
                        moveX = $trigger.outerWidth() + popupWidth
                    }else if(direction === 'left' && triggerPos.left < popupWidth){
                        //左secured
                        moveX = -$trigger.outerWidth() - popupWidth
                    }else{
                        moveX = 0;
                    }
                }
            }

            pos.top -= moveY;
            pos.left -= moveX;

            //设置位置样式
            this.css(pos);
        },

        onChangeDirection: function(event, dir){
            // 组件宽高只限制一边，由方向决定
            this.resize();
        },

        /**
         * Resize width or height components, depending on drop direction
         * @method resize
         */
        // resize: function(){
        //     var $trigger = this.$trigger,
        //         dir = this.get('direction');

        //     if(dir === 'top' || dir === 'bottom' ){
        //         var width = this.get('width') || Math.max( $trigger.outerWidth(), this.outerWidth() );
        //         this.outerWidth(width)
        //     } else {
        //         var height = this.get('height') || Math.max( $trigger.outerHeight(), this.outerHeight() );
        //         this.outerHeight(height);
        //     }

        //     return this;
        // },

        /**
         * Show option panel, which lists lbf-dropdown's all items
         * @method show
         * @chainable
         */
        open: function() {
            if(!this.get('isSingle')) {
                if(this.get('isShown') || this.get('disabled')){
                    return this;
                }
            }

            this.set('isShown', true);

            //每次显示之前重新计算位置
            this._adjustPos();
            
            this.$trigger.addClass('lbf-dropdown-on');
            this.get('show').effect.apply(this, arguments);
            this.updateZIndex();
            this.trigger('open', [this]);

            return this;
        },

        /**
         * Hide option panel, which lists lbf-dropdown's all items
         * @method hide
         * @chainable
         */
        close: function(){
            var hide = this.get('hide');

            this.set('isShown', false);
            if(this.$trigger) {
                this.$trigger.removeClass('lbf-dropdown-on');
            }
            this.get('hide').effect.apply(this, arguments);
            this.trigger('close.Dropdown', [this]);

            return this;
        },

        /**
         * Toggle Dropdown
         * @chainable
         */
        toggle: function() {
            if(this.get('isSingle')) {
                if(this.$trigger[0] != this.$lastTrigger[0]) {
                    this.open();
                    this.set('isShown', true);
                    this.$lastTrigger[0] = this.$trigger[0];
                } else {
                    if(this.get('isShown')) {
                        this.close();
                        this.set('isShown', false)
                    } else {
                        this.open();
                        this.set('isShown', true)
                    }
                }
            } else {
                if(this.get('isShown')) {
                    this.close();
                    this.set('isShown', false)
                } else {
                    this.open();
                    this.set('isShown', true)
                }
            }

            return this;
        },

        /**
         * Disable lbf-dropdown
         * @chainable
         */
        disable: function(){
            this.close();
            this.set('disabled', true);
            this.$trigger.addClass('lbf-dropdown-disable');
            this.trigger('disable', [this]);
            return this;
        },

        /**
         * Enable lbf-dropdown
         * @chainable
         */
        enable: function(){
            this.set('disabled', false);
            this.$trigger.removeClass('lbf-dropdown-disable');
            this.trigger('enable', [this]);
            return this;
        }
    });

    Dropdown.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            //模板
            wrapTemplate: '<div class="lbf-popup lbf-dropdown"><%== content %></div>',

            //触发元素
            trigger: null,

            //指定dropdown宽度
            width: false,

            //指定dropdown高度
            height: false,

            //内容，支持HTML
            content: '',

            //Dropdown方向
            direction: 'bottom',

            //距离微调，最佳实践：原则上不建议这个值太大
            adjust: {
                x: 0,
                y: 0
            },

            //展示效果定制
            show: {
                //显示模式
                mode: 'click',

                //显示效果
                effect: function(){
                    this.show();
                }
            },

            //隐藏效果定制
            hide: {
                //隐藏效果
                effect: function(){
                    this.hide();
                }
            },

            //回调事件
            events: {
                load: function(){},
                unload: function(){},
                open: function(){},
                'close.Dropdown': function(){},
                enable: function(){},
                disable: function(){}
            }
        }
    });

    return Dropdown;
});
