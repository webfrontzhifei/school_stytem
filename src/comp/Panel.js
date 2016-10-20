/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.Panel', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Panel = require('ui.widget.Panel.Panel'),
        AlertPanel = require('ui.widget.Panel.AlertPanel'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel');
	
	var arrType = ['warning', 'remind', 'success', 'warning2'];

    var MAX_ZINDEX = 2147483100; //最大z-index值为2147483647，某些恶心的chrome扩展直接写死这个值

    var createContainer = function(el) {
        var isWebkit = 'WebkitAppearance' in document.documentElement.style || typeof document.webkitHidden != "undefined";

        // 弹框容器
        var $container = el;
        if (!$container) {
            if (history.pushState) {
                $container = $('<dialog class="lbf-panel-container" open></dialog>')
                // 动画结束之后移除类名，避免某些重绘触发不必要的动画
                $container.get(0).addEventListener(isWebkit? 'webkitAnimationEnd': 'animationend', function(event) {
                    if (event.target.tagName.toLowerCase() == 'dialog') {
                        this.classList.remove('lbf-panel-animation');
                    }
                });
            } else {
                $container = $('<div class="lbf-panel-container"></div>');
            }
        }
        // 前置插入，使用CSS控制只会出现一个蒙板层
        var $containerExist = $('.lbf-panel-container');

        if ($containerExist.length) {
            $container.insertBefore($containerExist.eq(0));
        } else {            
            $('body').append($container.addClass('lbf-panel-animation'));
        }

        // z-index最大值处理
        var zIndex = $container.css('zIndex') * 1 || 19, maxIndex = zIndex;
        $('body').children().each(function() {
            //修改一下逻辑，这里的z-index只取非diaplay:none的元素，因为有太多浏览器插件会在页面加载时注入display为none的元素
            var $elem = $(this), z;
            if($elem.css('display') != 'none') {
                z = $elem.css('zIndex') * 1;
                maxIndex = (z && z < MAX_ZINDEX) ? Math.max(z, maxIndex) : maxIndex;
            }     
        });
        $container.css('zIndex', (zIndex < maxIndex ? maxIndex + 1 : zIndex + 1));
        return $container;
    }, aviodScroll = function($container) {
        var containers = $('.lbf-panel-container'), isDisplayed = false;
        containers.each(function() {
            if ($(this).css('display') != 'none') {
                isDisplayed = true;
            }
        });

        // 因为去掉了滚动条，所以宽度需要偏移，保证页面内容没有晃动 
        if (isDisplayed) {
            var widthScrollbar = 17;
            // 当前容器是否显示
            var isThisDisplayed = $container.css('display') == 'block';

            if (isThisDisplayed && typeof window.innerWidth == 'number') {
                widthScrollbar = window.innerWidth - document.documentElement.clientWidth;
            }
            document.documentElement.style.overflow = 'hidden';

            if (isThisDisplayed) {
                $(document.body).css('border-right', widthScrollbar + 'px solid transparent');
            }
        } else {
            document.documentElement.style.overflow = '';
            $(document.body).css('border-right', '');
        }   
    }, replaceMethod = function(panel, $container) {
        panel.remove = function() {
            $container.remove();
            aviodScroll($container);
        };

        panel.hide = function() {
            $container.hide();
            aviodScroll($container);
        };

        panel.show = function() {
            if ($container && document.body.contains($container[0]) == false) {
                createContainer($container);
                panel.render();
            }

            $container.show();
            aviodScroll($container);
        };

        aviodScroll($container);
    };
	
    module.exports = exports = Panel;

    exports.alert = function(options) {
        if (typeof options == 'string') {
            options = {
                content: '<h6>' + options + '</h6>'
            };
        }
        var $container = createContainer().addClass('lbf-panel-alert');

        var defaults = {
            container: $container,
            type: 'normal',
            modal: false,
            buttons: [{
                className: 'lbf-button-normal',
                content: '知道了'
            }]
        };

        var params = $.extend({}, defaults, options || {});

        if (params.msg && !params.content) {
            params.content = params.msg;
        }

        // 对之前的msg参数做兼容
        params.content = '<div class="lbf-panel-'+ params.type +' lbf-panel-tip">'+ params.content +'</div>'

        var panel = new AlertPanel(params);
        
        replaceMethod(panel, $container);

        // 遵循之前的处理逻辑，返回primise
        return panel;
    };

    exports.confirm = function(options) {
        var $container = createContainer().addClass('lbf-panel-confirm');

        var defaults = {
            modal: false,
            container: $container,
            type: 'normal',
            buttons: [{
                content: options.txtOk || '确定',
                className: 'lbf-button-primary'
            }, {
                content: '取消',
                className: 'lbf-button-normal'
            }]
        };

        options = options || {};
        var params = $.extend({}, defaults, options);

        // 对之前的msg参数做兼容
        if (params.msg && !params.content) {
            params.content = params.msg;
        }

        // 兼容之前的wait参数
        if(params.wait){
            params.events = $.extend(params.events || {}, {
                ok: function(){
                    //点击主按钮后变为loading，且panel暂不消息
                    this.buttons[0].addClass('lbf-button-loading');
                    this.show();
                }
            });
        }

        if (options.buttons && options.buttons.length) {
            //对value的处理
            params.buttons = $.map(options.buttons, function(obj, index) {
                 if ((params.type == 'warning' || params.type == 'error') && index == 0 && !obj.className) {
                       obj.className = 'lbf-button-warning'; 
                    }
                return $.extend({}, defaults.buttons[index], obj);
            })
        } else if (params.type == 'warning' || params.type == 'error') {
            params.buttons[0].className = 'lbf-button-warning';
        }

        // 弹框内容
        params.content = '<div class="lbf-panel-'+ params.type +' lbf-panel-tip">'+ params.content +'</div>';

        var panel = new ConfirmPanel(params);

        replaceMethod(panel, $container);

        // 兼容业务中实例调用resolve\reject方法
        panel.resolve = panel.reject = function(){
            this.buttons[0].removeClass('lbf-button-loading');
            this.remove();
        };

        return panel;
    };
    
    exports.warning = function(params){
        params = params || {};
        params.type = 'warning';
        return exports.confirm(params);
    };

    exports.warning2 = function(params){
        return exports.warning(params);
    };
    
    exports.info = function(params){
        return exports.confirm(params);
    };
    
    exports.success = function(params){
        params = params || {};
        params.type = 'success';
        return exports.confirm(params);
    };

    // 任意内容面板
    exports.Panel = function(options) {
        var $container = createContainer();

        var panel = new Panel($.extend({
            modal: false,
            drag: false,
            container: $container,
            zIndex: 10,
            opacity: 0.91,
            centered: true
        }, options));

        // 替换底层的show/hide/remove方法
        replaceMethod(panel, $container);

        if (options && options.auto) {
            panel.$el.addClass('lbf-panel-auto');
        }

        return panel;
    };
    exports.panel = function(options) {
        return exports.Panel(options);
    };
});