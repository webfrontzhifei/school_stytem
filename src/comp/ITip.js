/**
 * Created by dericktang on 2015/11/16.
 */
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-12-5 上午11:44
 */
LBF.define('qidian.comp.ITip', function(require){
    var $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Node = require('ui.Nodes.Node'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    require('{theme}/lbfUI/css/Tip.css');

    var Tip = Dropdown.inherit({
        /**
         * 缓存，快捷访问，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            '$content': '.lbf-tip-content',
            '$arrowBefore': '.lbf-tip-arrow-before',
            '$arrowAfter': '.lbf-tip-arrow-after'
        },

        /**
         * Tip default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-tip-button-close': '_close'
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var that = this,
                wrapTemplate = that.get('wrapTemplate'),
                attributes = that.attributes(),
                trigger = that.get('trigger'),
                isSingle = this.get('isSingle'),
                direction = that.get('direction'),
                adjust = that.get('adjust'),
                show = that.get('show');

            //非单例模式
            if(!isSingle) {
                if(!trigger) {
                    return;
                }

                //缓存
                that.$trigger = $(trigger);
                that.adjust = adjust;
                that.direction = direction;

                Dropdown.prototype.render.apply(this, arguments);

                //Dropdown不支持follow模式
                if(show.mode === 'follow'){
                    that._follow();
                }else{
                    //1、调整arrow带来的位置偏差
                    //2、调整Dropdown从0,0计算，tip默认居中对齐
                    that._adjustArrow();
                }
            } else {
                that.adjust = adjust;
                that.direction = direction;

                Dropdown.prototype.render.apply(this, arguments);
            }

            return this;
        },

        _follow: function(){
            var y0,
                x0,
                that = this,
                triggerPos = {
                    top: that.$trigger.offset().top + $(window).scrollTop(),
                    left: that.$trigger.offset().left + $(window).scrollLeft()
                };

            that.adjust = {
                x: -30,
                y: -45
            },


                that.$trigger.hover(
                    function(e){
                        y0 = e.pageY,
                            x0 = e.pageX;

                        that.css({
                            top: y0 + that.adjust.y,
                            left: x0 + that.adjust.x,
                            visibility: 'visible',
                            zIndex: that.get('zIndex') || zIndexGenerator()
                        });

                        that.open(e);

                        //避免重复绑定
                        $('body').bind('mousemove', watchHover);
                    },
                    function(e){
                        that.close(e);
                        $('body').unbind('mousemove', watchHover);
                    }
                );

            function watchHover(e){
                var top = e.pageY + that.adjust.y,
                    left = e.pageX + that.adjust.x;

                that.css({
                    top: top,
                    left: left
                });
            }
        },

        _adjustArrow: function() {
            var that = this,
                width = that.outerWidth(),
                height = that.outerHeight(),
                triggerWidth = that.$trigger.outerWidth(),
                triggerHeight = that.$trigger.outerHeight(),
                direction = this.get('direction'),
                $trigger = this.$trigger,
                $win = $(window),
                winHeight = $win.height(),
                winWidth = $win.width(),
                tipWidth = this.outerWidth(),
                tipHeight = this.outerHeight(),
                triggerPos = {
                    top: $trigger.offset().top,
                    left: $trigger.offset().left
                },
                scrollTop = $win.scrollTop(),
                scrollLeft = $win.scrollLeft(),
                arrowHeight = this.$arrowBefore.outerHeight(),
                arrowWidth = this.$arrowBefore.outerWidth();

            switch(direction){
                case 'top':
                    if(triggerPos.top < tipHeight){
                        this.removeClass('lbf-tip-top').addClass('lbf-tip-bottom');
                        this.css('marginTop', arrowHeight);
                    }else{
                        this.removeClass('lbf-tip-bottom').addClass('lbf-tip-top');
                        this.css('marginTop', -arrowHeight);
                    }

                    this.css('marginLeft', (triggerWidth - width)/2);

                    break;
                case 'right':
                    if(winWidth + scrollLeft - triggerPos.left - $trigger.outerWidth() < tipWidth){
                        this.removeClass('lbf-tip-right').addClass('lbf-tip-left');
                        this.css('marginLeft', -arrowWidth);
                    }else{
                        this.removeClass('lbf-tip-left').addClass('lbf-tip-right');
                        this.css('marginLeft', arrowWidth);
                    }

                    this.css('marginTop', (triggerHeight - height)/2);

                    break;
                case 'bottom':
                    if(winHeight + scrollTop - triggerPos.top - $trigger.outerHeight() < tipHeight){
                        this.removeClass('lbf-tip-bottom').addClass('lbf-tip-top');
                        this.css('marginTop', -arrowHeight);
                    }else{
                        this.removeClass('lbf-tip-top').addClass('lbf-tip-bottom');
                        this.css('marginTop', arrowHeight);
                    }

                    this.css('marginLeft', (triggerWidth - width)/2);

                    break;
                case 'left':
                    if(triggerPos.left < tipWidth){
                        this.removeClass('lbf-tip-left').addClass('lbf-tip-right');
                        this.css('marginLeft', arrowWidth);
                    }else{
                        this.removeClass('lbf-tip-right').addClass('lbf-tip-left');
                        this.css('marginLeft', -arrowWidth);
                    }

                    this.css('marginTop', (triggerHeight - height)/2);

                    break;
            }
        },

        /**
         * Click close button to hide tip
         * @method close
         * @protect
         * @chainable
         */
        _close: function(e){
            e.stopPropagation();

            this.close();

            return this;
        },

        /**
         * open Tip
         * @method open
         * @chainable
         */
        open: function(e){
            if(this.get('show').mode == 'follow'){
                this.get('show').effect.apply(this, [e]);

                /**
                 * Fire when open Tip
                 * @event open
                 * @param {Event}
                 */
                this.trigger('open');
            }else{
                this._adjustArrow();

                Dropdown.prototype.open.apply(this, [e]);
            }

            return this;
        },

        /**
         * close Tip
         * @method close
         * @chainable
         */
        close: function(e){
            if(this.get('show').mode === 'follow'){
                this.get('hide').effect.apply(this, [e]);

                /**
                 * Fire when hide Tip
                 * @event show
                 * @param {Event}
                 */
                this.trigger('close.Tip');
            }else{
                Dropdown.prototype.close.apply(this, [e]);
            }

            return this;
        },

        /**
         * Toggle Tip
         * @chainable
         */
        toggle: function(){
            Dropdown.prototype.toggle.apply(this, arguments);

            return this;
        },

        /**
         * Set Tip content
         * @method setContent
         * @param {String} html
         * @chainable
         */
        setContent: function(html){
            this.$content.html(html);
            return this;
        }
    });

    Tip.include(extend(true, {}, Dropdown, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            //模板定制
            wrapTemplate: [
                '<div class="lbf-popup lbf-dropdown lbf-tip lbf-tip-<%== direction %>">',
                '<div class="lbf-tip-content"><%== content %></div>',
                '<% if(closable){ %>',
                '<a href="javascript:;" class="lbf-button-close lbf-tip-button-close"></a>',
                '<% } %>',
                '<div class="lbf-tip-arrow">',
                '<div class="lbf-tip-arrow-before"></div>',
                '<div class="lbf-tip-arrow-after"></div>',
                '</div>',
                '</div>'
            ].join(''),

            //Tip方向
            direction: 'top',

            //是否显示关闭按钮，closable=true时mouseout事件不触发
            closable: false
        }
    }));

    return Tip;
});