/**
 * Created by Dan on 15-11-23.
 */
LBF.define('qidian.comp.GetLoginStatus', function(require, exports, module){
    var Class = require('lang.Class'),
        REST = require('qidian.comp.REST');

    var GetLoginStatus = module.exports = Class.inherit({
        initialize: function (statusOnCallback, statusOffCallback, failCallback) {
            /*
             与php侧约定，借用DataReport接口回包code实现对企点账号登录态是否超时的判断
             请求参数：{type: 99}
             反回参数：{e.code: 3(登录超时)}
             */
            
            REST.read({
                url: '/mp/accountInfo/dataReport',
                data: {
                    type: 99
                }
            }).done(function(e){
                if(e.code == 3){
                    typeof statusOffCallback == 'function' && statusOffCallback.call(this);
                }
                else {
                    typeof statusOnCallback == 'function' && statusOnCallback.call(this);
                }

            }).fail(function(e){
                typeof failCallback == 'function' && failCallback.call(this, e);
            });
        }
    });
});