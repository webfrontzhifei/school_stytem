/**
 * panel 中的确定取消按钮渲染到dropdown
 * Created by dericktang on 2016/1/22.
 */
LBF.define('qidian.comp.DropdownPanel', function(require){
    var Dropdown = require('qidian.comp.Dropdown'),
        Button = require('ui.Nodes.Button'),
        forEach = require('lang.forEach'),
        proxy = require('lang.proxy'),
        extend = require('lang.extend');

    var DropdownPanel = Dropdown.inherit({

        elements: {
            $buttons: '.lbf-dropdown-panel-foot',
            $closeButton: '.lbf-dropdown-panel-close'
        },

        initialize: function(opts){
            this.mergeOptions(opts);
            this.buttons = [];
            var panel=this,
                buttons = this.get('buttons');

            Dropdown.prototype.initialize.apply(this, arguments);
            //也可以用apply方法
//            this.render();
//            this.trigger('load', [this]);
            
            var buttonsDefaults = [
                {
                    className: 'lbf-button-primary',
                    content: '确定',
                    events: {
                        click: function() {
                            this.trigger('ok', [this]);
                        }
                    }
                }, {
                    className: 'lbf-button-link',
                    content: '取消',
                    events: {
                        click: function() {
                            this.trigger('cancel', [this]);
                        }
                    }
                }
            ];


            if(buttons && buttons.length > 0) {
                forEach(buttons, function(button, index){
                    panel.addButton(extend({}, buttonsDefaults[index], button));
                });
            };
            this.$closeButton.click(proxy(function(){
	            var events = this.get('events');
	            if(events.hasOwnProperty('cancel.ddp')){//使用cancel.ddp事件名用于解决cancel事件会冒泡到父级cancel的问题
		            this.trigger('cancel.ddp', [this]);
	            }else {
		            this.trigger('cancel', [this]);
	            }
                return false;
            }, this));
            this.close();
        },
        addButton: function(opts){
            opts.delegate = this;
            if(opts.events){
                var events = opts.events,
                    proxyEvents = {};
                for(var i in events){
                    if(events.hasOwnProperty(i)){
                        proxyEvents[i] = proxy(events[i], this);
                    }
                }
                opts.events = proxyEvents;
            }

            var button = new Button(opts);
            this.$buttons.append(button.$el);
            this.buttons.push(button);
            return button;
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
                popupHeight = this.$container.find(".lbf-popup").height(),
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

//            pos.top=pos.top-scrollTop

            //获取infomation宽度
            var infoWidth = $(offsetParent).width();
            //比较与win窗口大小
            var calWidth=0;;
            if(infoWidth<winWidth){
                calWidth=infoWidth;
            }else{
                calWidth=winWidth;
            }

            //如果到了页面最右边，则自动往左侧移动
            var diff = calWidth-outerPosition.left;
            if(diff<popupWidth){

                pos.left=pos.left-(popupWidth-diff);
            }


            //设置位置样式
            this.css(pos);
        },

        /**
         * 这里重写open原因是：在dropdown下面再有一个dropdown会产生trigger.open()方法使第一个dropdown多少调用open方法
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
            this.trigger('show', [this]);
            this._adjustPos();
            return this;
        }
    });


    DropdownPanel.include({

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Dropdown.settings, {
            wrapTemplate: [
                '<div class="lbf-popup lbf-dropdown">',
                '<div class="lbf-dropdown-panel">',
                '<a href="javascript:;" class="lbf-dropdown-panel-close"></a>',
                '<div class="lbf-dropdown-panel-head"><%== title %></div>',
                '<div class="lbf-dropdown-panel-body"><%== content %></div>',
                '<div class="lbf-dropdown-panel-foot"></div>',
                '</div>',
                '</div>'
            ].join(''),
            buttons: [
                {
                    className: 'lbf-button-primary',
                    content: '确定',
                    events: {
                        click: function() {
                            this.trigger('ok', [this]);
                        }
                    }
                }, {
                    className: 'lbf-button-link',
                    content: '取消',
                    events: {
                        click: function() {
                            this.trigger('cancel', [this]);
                        }
                    }
                }
            ], events: {
                load:function(){

                },
                ok: function(e, panel){
                    this.close();
                },
                cancel: function(){
                    this.close();
                }
            }
        })
    });

    return DropdownPanel;


});