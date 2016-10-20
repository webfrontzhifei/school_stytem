/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.LightTip', function(require, exports, module){
    var LightTip = require('ui.widget.LightTip.LightTip'),
        $ = require('lib.jQuery'),
        extend = require('lang.extend');

    var MAX_ZINDEX = 2147483647; //传说中的z-index最大值
    var defaults = {
        hide: {
            delay: 2000
        },
        modal: false,
        events: {
            load: function() {
                var self = this;
                setTimeout(function() {
                    self.$el.css('z-index', MAX_ZINDEX); //和流氓扩展做斗争，夺回最大值
                }, 20);
            }
        }
    };

    exports = module.exports = LightTip.inherit({});

    exports.success = function(content, options){
        if(content)//防止传入空参数时报错
        return new LightTip(extend({}, defaults, options, {content: '<i class="icon"></i>' + content}));
    };

    exports.error = function(content, options){
        if(content)
        return new LightTip(extend({}, defaults, options, {content: '<i class="icon"></i>' + content.toString().replace(/^Error:/,''), className: 'lbf-light-tip-error'}));
    };

    exports.tip = function(content, options){
        if(content)
        return new LightTip(extend({}, defaults, options, {content: content, className: 'lbf-light-tip-normal'}));
    };
});
