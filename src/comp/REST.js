/**
 * Created by amos on 14-4-9.
 */
LBF.define('qidian.comp.REST', function(require){
    var REST = require('app.REST'),
        conf = require('qidian.conf.main'),
        logger = require('qidian.comp.logger'),
        extend = require('lang.extend'),
        Cookie = require('util.Cookie'),
        PTLogin = require('qidian.comp.PTLogin'),
        LightTip = require('qidian.comp.LightTip'),
        JSON = require('lang.JSON'),
        Panel = require('qidian.comp.Panel');

    var LOGIN_STATUS_TIMEOUNT = 3,// 登录态超时
        KILL_OUT_USER = 10,//用户账户停用，没有继续操作的权限
        AUTH_STATUS_NOT_ALLOWED = 7,
        NON_QIDIAN_USER_LOGIN = 11, //Ajax PTlogin弹框：非企点账号登录账户中心(与PHP侧同学约定)
        UNKNOWN = 'unknown',
        HOMEPAGE = '/mp/imgTxtMaterial'; //和测试交互约定换号之后跳转到首页

    var requestSettings;

    function R3() {
        return Math.random().toString().substring(2, 5);
    }

    function getPersonalUin(){
        var uin = Cookie.get('p_uin');
        return typeof uin === 'string' ? uin.replace(/(o0*)/, '') : null;
    }

    REST
        .on('error' + LOGIN_STATUS_TIMEOUNT, function(){
            logger.warn('[REST][on error] LOGIN_STATUS_TIMEOUNT');
            PTLogin.popupLogin();
            LightTip.error("登录超时，请重新登录腾讯企点");
            REST.preventDefault(); //阻止业务里的错误逻辑被触发
        })
        .on('error' + AUTH_STATUS_NOT_ALLOWED, function(res){
            Panel.alert(res.message || '权限错误');
            REST.preventDefault(); //阻止业务里的错误逻辑被触发
        })
        .on('error' + NON_QIDIAN_USER_LOGIN, function(){
            logger.warn('[REST][on error] NON QIDIAN USER LOGIN');
            LightTip.error("请您使用企点账号登录").on('hide',function(){
                //PTLogin.popupLogin();
                PTLogin.logout();
                window.location.href = '/ac/login';
            });
            REST.preventDefault(); //阻止业务里的错误逻辑被触发
        })
        .on('error' + KILL_OUT_USER, function(res){
            Panel.alert({
            	content: '<h6>帐号已停用</h6><p>您的帐号已被停用，如需使用请联系企业管理员</p>',
                buttons:[{
                    content: '知道了',
                    className: 'user-invalid'
                }]
            });
            document.getElementsByClassName('user-invalid')[0].onclick =function () {
                document.getElementsByClassName('header-logout')[0].click();//需要注销
            };
            document.getElementsByClassName('lbf-panel-close')[0].onclick =function () {
                document.getElementsByClassName('header-logout')[0].click();//需要注销
            };

            REST.preventDefault(); //阻止业务里的错误逻辑被触发
        })
        .on('beforeSend', function(settings) {
            var transId = (function() {
                return R3()+R3()+R3();
            })();
            settings.data = settings.data || {};
            if(typeof settings.data !== 'string') {
                settings.data.transId = transId;
            } else {
                settings.data = JSON.parse(settings.data);
                settings.data.transId = transId;
                settings.data = JSON.stringify(settings.data);
            }
            requestSettings = settings;
            requestSettings.transId = transId;

            //如果cookie中的p_uin与之前页面直出的已登录的loginUin不同，将请求参数和url置空，防止数据提交到web后台
            //kf.loginUin来自于页面模板(commonHeader.html)中暴露在window作用域下的变量
            if((typeof kf != "undefined") && kf.loginUin && getPersonalUin() && kf.loginUin != getPersonalUin()){
                LightTip.error('请求失败').on('hide',function(){
                    setTimeout(function(){
                        window.location.href = HOMEPAGE;//这个跳转可能被用户在beforeunload事件中手动中止
                    },16);//加延时为了使“非企点账号登录”的error事件在此之前执行
                });
                settings.url = 'badRequest';
                settings.data = null;
                REST.preventDefault(); //阻止业务里的错误逻辑被触发
            }
        })
        .on('error', function(err){
            var options = {
                ErrorId: err.status,
                transId: requestSettings.transId,
                xhrSettings: {
                    type: requestSettings.type || UNKNOWN,
                    url: requestSettings.url || UNKNOWN,
                    data: requestSettings.data || UNKNOWN
                }
            };
            options = extend({}, REST.get('log'), options);
            logger.error(err, null, options); //默认上报
        });

    return REST
            .set(conf.REST)
            // .use('errorLog')
            .use('speedReport')
            .use('CSRFPatch');
});