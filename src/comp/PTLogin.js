/**
 * Created by apple on 14-5-15.
 */
LBF.define('qidian.comp.PTLogin', function(require, exports){
    var extend = require('lang.extend'),
        Event = require('util.Event'),
        Popup = require('ui.Nodes.Popup'),
        Overlay = require('ui.Plugins.Overlay'),
        zIndexGenerator = require('util.zIndexGenerator'),
        conf = require('qidian.conf.main').ptlogin,
        logger = require('qidian.comp.logger'),
        Cookie = require('util.Cookie'),
        request = require('util.request'),
        REST = require('app.REST');

    // require outside module ptlogin.js
    var PTLOGIN_JS_SRC = 'https://ui.ptlogin2.qq.com/js/ptloginout.js',
        HOMEPAGE = '/mp/imgTxtMaterial'; //和测试交互约定换号之后跳转到首页

    var global = window;

    // methods to be attached to global
    var ptGlobalMethods = {
        onPtlogin2success: function(){
            // console.log("onPtlogin2success");
            exports.trigger('success');
        },

        ptlogin2_onResize: function(width, height) {
            exports.trigger('resize', width, height);
        },

        ptlogin2_onLogin: function() {
            // 如果需要继续登录操作，则返回true, 否则，请返回false
            return true;
        },

        ptlogin2_onClose: function() {
            // console.log("ptlogin2_onClose");
            exports.trigger('close');
        }
    };

    // attach to global
    extend(global, ptGlobalMethods);

    if (typeof window.postMessage !== 'undefined') {
        window.onmessage = function(event) {
            var msg = event || window.event; // 兼容IE8
            var data;
            if (typeof  JSON !== 'undefined') // IE7兼容模式不存在JSON对象
                data = JSON.parse(msg.data);
            else
                data = str2JSON(msg.data);

            switch (data.action) {
                case 'close':
                    ptlogin2_onClose();
                    break;

                case 'resize':
                    ptlogin2_onResize(data.width, data.height);
                    break;

                default: //什么也不做，便于我们扩展接口
                    break;
            }
            // 考虑到ptlogin接口的扩展性，希望业务在对于data.action的条件处理也要保持一定的可扩展性
            // 如不要采用：data.action == 'resize' ? ptlogin2_onResize(data.width, data.height) : ptlogin2_onClose()
            // 一旦ptlogin支持了新的接口，那么该代码将会无法正常工作，影响业务正常使用
        }
    }

    /**
     * [str2JSON 降字符串转换成json对象（供业务参考）]
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    function str2JSON(str) {
        eval('var __pt_json='+str);
        return __pt_json;
    }

    function getLoginUin(){
        return Cookie.get('ptui_loginuin');
    }

    extend(exports, Event, {
        //popupLoginFrame: '<iframe id="login_div" width="100%" height="100%" frameborder="0" scrolling="auto" src="https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=' + conf.appid + '&s_url=' + conf.successUrl + '&style=33&pt_bqq=1&proxy_url=' + conf.proxyUrl + '&border_radius=1&daid=' + conf.domainId + '&enable_qlogin=0&target=self"></iframe>',
        popupLoginFrame: '<iframe id="login_div" width="100%" height="100%" frameborder="0" scrolling="auto" src="https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=' + conf.appid + '&s_url=' + conf.successUrl + '&style=33&pt_bqq=1&hide_reg=1&hide_vip=1&hide_feedback=1&proxy_url=' + conf.proxyUrl + '&border_radius=1&target=self&daid='+ conf.domainId +'"></iframe>',

        popupLogin: function(oldUin){
            if(!!document.getElementById('login_div')) return;//防止弹出多个PTlogin

            logger.info('[PTLogin][popupLogin] popup begin');

            var popup =
                this.popup =
                    new Popup({
                        container: 'body',
                        content: this.popupLoginFrame,
                        centered: true,
                        width: 340,
                        events: {
                            unload: function(){
                                exports.unbind('resize');
                            }
                        }
                    })
                    .plug(Overlay, {
                        container: 'body'
                    }),

                loginFrame = popup.find('iframe'),
                oldLoginUin = getLoginUin();

            popup.css('zIndex', zIndexGenerator());
            
            this
                .once('success', function(){
                    //popup.remove();
                    popup['_PLUGINS']['Overlay'].remove();
                    popup.$el.remove();
                    if(getLoginUin() && getLoginUin() == oldLoginUin) {
                        //如果uin没有发生变化则继续发送之前的ajax请求
                        REST.trigger('goon');
                    } else {
                        window.location.href = HOMEPAGE;
                    }
                    logger.info('[PTLogin][popupLogin] login success');
                })
                .on('resize', function(width, height){
                    loginFrame
                        .css({
                            width: width,
                            height: height,
                            visibility: 'hidden'
                        })
                        // 先隐藏，在显示，这样可以避免滚动条的出现
                        .css('visibility', 'visible');

                    popup.setToCenter();
                });
        },

        logout: function(){
            logger.info('[PTLogin][logout] logout begin');

            if(!global.pt_logout) {
                request(PTLOGIN_JS_SRC, function(){
                    exports.logout();
                });
                return;
            }

            // call pt logout function
            global.pt_logout.logout(function(state){
                if(state) {
                    logger.info('[PTLogin][logout] logout succeed');
                    exports.trigger('logout');

                    window.location.href = '/ac/login';
                } else {
                    logger.warn('[PTLogin][logout] logout failed! state:' + state);
                }
            });
        }
    });
});

