/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 13-6-28 下午2:14
 */
LBF.define('ui.widget.Gotop', function(require){
    var $ = require('lib.jQuery'),
		zIndexGenerator = require('util.zIndexGenerator'),
        Node = require('ui.Nodes.Node');

    /**
     * Extensive pagination with plenty options, events and flexible template
     * @class Gotop
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Function} [opts.events.click] Callback when attribute changed
     * @param {Function} [opts.events.]
     * @example
     *      new Gotop({
     *          container: 'someContainerSelector'
     *      });
     */
    var Gotop = Node.inherit({
        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click a': 'goTop'
        },

        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var node = this;

            if(!this.get('selector')){
                this.setElement(this.get('template'));
            }

            //插入结构
            this.appendTo(this.get('container'));

            //插入样式
            this.get('className') != '' && this.addClass(this.get('className'));

            //默认隐藏
            this.hide();

            //页面初始时做一次计算，判断是否显示,420是经验值，与Q首保持一致
            $(document).scrollTop() > 420 ? this.show() : this.hide();

            $(window).bind('scroll.gotop', function() {
                $(document).scrollTop() > 420 ? node.show() : node.hide();
            });

            return this;
        },

        goTop: function(){
            $('html, body').animate({scrollTop: '0px'}, 250);
        }
    });

    Gotop.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selector: null,

            //gotop结构模板
            template: [
                '<div class="lbf-gotop"><a target="_self" href="javascript:;"></a></div>'
            ].join(''),

            //默认容器
            container: 'body',

            //样式定制接口容器
            className: ''
        }
    });

    return Gotop;
});
