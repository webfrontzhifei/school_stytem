/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-12-28 上午9:35
 */
LBF.define('ui.widget.LightTip.LightTip', function(require){
    var $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node'),
        Popup = require('ui.Nodes.Popup'),
        Overlay = require('ui.Plugins.Overlay'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/LightTip.css');

    /**
     * Base popup component
     * @class Popup
     * @namespace ui.Success
     * @module Success
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {String} [opts.className] className of node
     * @param {String} [opts.width] Width of node
     * @param {String} [opts.height] Height of node
     * @param {Object} [opts.hide] Param of node when hide
     * @param {Object} [opts.hide.delay] 组件展示时间
     * @param {Object} [opts.hide.effect] 隐藏时的效果
     * @param {Object} [opts.modal] 是否采用模态层，默认开启，莫忒曾透明度为0，Overlay的参数透传
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @example
     *      new Success({
     *          content: '提交成功'
     *      });
     */
    var LightTip = Popup.inherit({
        /**
         * Render Success
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var success = this,
                wrapTemplate = this.template(this.get('wrapTemplate')),
                $el = this.$(wrapTemplate({
                    content: this.get('content')
                })),
                $container = this.$container = this.$(this.get('container'));

            this.setElement($el);

            this.get('className') && $el.addClass(this.get('className'));

            // overlay should be added to DOM before $el
            if(this.get('modal')){
                var modal = this.get('modal');
                //写死body， by rains
                modal.container = this.get('container');
                this.plug(Overlay, modal);
            }

            // update z-index later than overlay plugin
            // update z-index later than overlay plugin
            $container.append($el.css({
                zIndex: this.get('zIndex') || zIndexGenerator()
            }));

            //基本认为宽度界面上是可控的
            if(this.get('width') !== 'auto'){
                this.width(this.get('width'));
            }

            //对高度进行处理
            if(this.get('height') !== 'auto'){
                var height = this.get('height') < $(window).outerHeight() ? this.get('height') : $(window).outerHeight();

                //对success高度赋值
                this.height(height);
            }

            // element should be in the DOM when set to center
            this.get('centered') && this.setToCenter();

            //这里不能直接this.hide(); 不然Overlay Plugin也会受影响，看有没其他方法 by rains
            this.$el.hide();

            //显示效果定制
            setTimeout(function(){
                success.get('show').effect.apply(success, [success]);
            }, success.get('show').delay);

            //隐藏（删除）效果定制
            setTimeout(function(){
                success.get('hide').effect.apply(success, [success]);
            }, success.get('hide').delay);

            return this;
        }
    });

    LightTip.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Popup.settings, {

            //success popup 结构模板
            wrapTemplate: [
                '<div class="lbf-light-tip"><%== content %></div>'
            ].join(''),

            //默认装载容器
            container: 'body',

            //定制样式接口
            className: '',

            //success popup width
            width: 'auto',

            //success popup height
            height: 'auto',

            show: {
                delay: 0,
                effect: function(success){
                    this.fadeIn('normal', function(){
                        success.trigger('show', [success]);
                    });
                }
            },

            //隐藏时的参数定制，延时多久关闭、隐藏效果，定制此参数时，请trigger close。 建议不修改，一致讨论最佳实践。
            hide: {
                delay: 2000,
                effect: function(success){
                    this.fadeOut('normal', function(){
                        success.trigger('hide', [success]);
                    });
                }
            },

            //success popup 是否居中
            centered: true,

            //success popup 是否使用模态层
            modal: {
                opacity: 0,
                backgroundColor: 'black'
            },

            events: {
                hide: function(e, success){
                    success.remove();
                }
            }
        })
    });

    return LightTip;
});