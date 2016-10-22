/**
 * Created by apple on 14-4-9.
 */
LBF.define('qidian.conf.main', function(require, exports, module){
    var globalSettings = require('globalSettings'),
        $ = require('lib.jQuery'),
        LightTip = require('qidian.comp.LightTip');

    // env variables
    var env = globalSettings.env,
        host = location.host || location.hostname,
        protocol = location.protocol || 'https:',
        staticHost = ({
            development: 'dev.gtimg.com',
            test: 'oa.gtimg.com',
            production: 'bqq.gtimg.com'
        })[env];

    // project main config
    module.exports = exports = {
        name: 'qidian',

        env: env,

        protocol: protocol,

        //todo:手动调整在控制台输出信息
        debug: true,//globalSettings.debug,

        host: host,

        staticHost: staticHost,

        lazyLoadTimeout: 10000,
        
        appId: 10086
    };

    // console config
    exports.logger = {
        // report debug level
        reportLevel: 'notice',
        // report url 
        reportUrl: '/uls/UlsRpt/UlsRpt'
    };

    exports.speed = {
        proxy: 'https://' + host + '/mp/commonProxy/Proxy?url={url}',

        appId: 7818
    };

    // REST config
    exports.REST = {
        errorStatusCode: 508, //与PHP同学@qgzhang约定，企点错误状态码由608改为508

        //killOutCode: 10, //踢下线code

        log: {
            fn: 'REST'
        },

        CSRF: {
            token: '_bqq_csrf'
        },

        speed: {
            proxy: exports.speed.proxy
        }
    };

    // ptlogin config
    exports.ptlogin = {
        appid: 1600000279,
        proxyUrl: encodeURIComponent(protocol + '//' + host + '/static_proxy/qidian/src/comp/login/proxy.html'),
        successUrl: encodeURIComponent(protocol + '//' + host + '/static_proxy/qidian/src/comp/login/redirect.html?host=' + host + '&protocol=' + protocol + '&url=' + window.location.href),
        domainId: 358
    };
    /**
     * normal login config
     * @type {{appid: number}}
     */
    exports.normalQQLogin = {
        appid: 3000401
    };

    /**
     * 记录所有弹出层里实例化之后的Dropdown实例，用于方便在弹出层关闭后进行销毁
     */
    exports.dropdownInDialog = [];
    

    /**
     * 调整Dropdown遇到边界,则贴边显示
     * @param {Object} elDropdown Dropdown外围元素
     * @param {Object} trigger trigger元素,
     * @param {Boolean} isInBody 是否在body内,false或缺省在弹出层的dialog元素内
     */
    exports.adjustDropdownPos = function(elDropdown, trigger, isInBody) {
        //让Dropdown遇到边界时贴边显示
        var container = $('.lbf-panel-container'),
            documentScrollTop = document.documentElement.scrollTop || document.body.scrollTop,
            documentScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft,
            documentClientHeight = document.documentElement.clientHeight || document.body.clientHeight,
            documentClientWidth = document.documentElement.clientWidth || document.body.clientWidth,
            fixHeight = 6,
            elDropdownTop = trigger.offset().top + trigger.height(),
            elDropdownLeft = trigger.offset().left;

        if(!isInBody) {
            var containerScrollTop = container[0].scrollTop,
                containerScrollLeft = container[0].scrollLeft,
                panel = container.find('.lbf-panel'),
                panelOffset = panel.offset(),
                panelTop = documentClientHeight > panel.height() + 30 * 2 ? panelOffset.top : 30,       //如果panel超级高,则上先要预留30像素空间
                panelLeft = panelOffset.left;

            elDropdown.css({
                top: elDropdownTop + elDropdown.height() + fixHeight < documentClientHeight ? elDropdownTop + containerScrollTop + fixHeight - panelTop : documentClientHeight + containerScrollTop - elDropdown.height() - panelTop,
                left: elDropdownLeft + elDropdown.width() < documentClientWidth ? elDropdownLeft + containerScrollLeft - panelLeft : documentClientWidth + containerScrollLeft - elDropdown.width() - panelLeft
            });
        } else {
            elDropdown.css({
                top: elDropdownTop + elDropdown.height() - documentScrollTop + fixHeight < documentClientHeight ? elDropdownTop + fixHeight : documentScrollTop + (documentClientHeight - elDropdown.height()),
                left: elDropdownLeft + elDropdown.width() - documentScrollLeft < documentClientWidth ? elDropdownLeft : documentScrollLeft + (documentClientWidth - elDropdown.width())
            });
        }
    };

    /**
     * tree icons
     */
    exports.treeIcons = (function() {
        var domainName = document.location.hostname,
            imgDomain = 'bqq.gtimg.com',
            path,
            iconHash = {
                Tc: 'orgs_corp_admin.png',
                Tm: 'orgs_male.png',
                Tw: 'orgs_female.png',
                Ta: 'orgs_admin.png',
                IcoTa: 'orgs_admin.png',
                Td: 'orgs_disabled.png',
                Tc_h: 'orgs_corp_admin_h.png',
                Tm_h: 'orgs_male_h.png',
                Tw_h: 'orgs_female_h.png',
                IcoTa_h: 'orgs_admin_h.png',
                Td_h: 'orgs_disabled_h.png',
                IcoDis: 'out-of-service.png',
                IcoDel: 'members-del.png',
                IcoRec: 'trash-bin.png'
            };

        if(domainName.indexOf('oa.qidian.qq.com') != '-1' || domainName.indexOf('local.') != '-1') {
            imgDomain = 'oa.gtimg.com';
        } else if(domainName.indexOf('dev.qidian.qq.com') != '-1') {
            imgDomain = 'dev.gtimg.com';
        }

        path = 'https://' + imgDomain + '/qidian/src/themes/blue/common/images/';

        for(var p in iconHash) {
            iconHash[p] = path + iconHash[p];
        }

        return iconHash;
    })();

    //统一错误callback
    exports.ajaxError = function(e) {
        LightTip.error(e.message);
    };
    
    //华佗测速相关
    exports.htSpeed = {
        flag1: 21267,
        flag2: 1
    }

    //图片缩略图相关,预留先
    // exports.imgCacheConf =  function (e) {
    //     var thumb={
    //         hosts:['p.qpic.cn'],//设置需要获取缩略图的域名
    //         imageSize : ['0','120','360','160','900']//图片大小的设置 其中 0表示原图,120表示120*120,360表示360*200,900表示900*500
    //     };
    //     return thumb;
    // }
});