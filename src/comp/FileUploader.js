/**
 * Created by amos on 14-4-9.
 */
LBF.define('qidian.comp.FileUploader', function(require){
    var FileUploader = require('ui.widget.FileUploader.FileUploader'),
		extend = require('lang.extend'),
        LightTip = require('qidian.comp.LightTip'),
		Cookie = require('util.Cookie'),
		config = require('qidian.conf.main').FileUploader,
		settings = extend({}, FileUploader.settings, config);

    var HOMEPAGE = '/mp/imgTxtMaterial'; //和测试交互约定换号之后跳转到首页

    function getPersonalUin(){
        var uin = Cookie.get('p_uin');
        return typeof uin === 'string' ? uin.replace(/(o0*)/, '') : null;
    }

    //检测cookie中的p_uin与之前页面直出的已登录的loginUin是否相同
    function hasSameLoginUin(uploader){
        var r = true; //默认相同

        //如果cookie中的p_uin与之前页面直出的已登录的loginUin不同，取消上传操作，防止文件提交到web后台
        //kf.loginUin来自于页面模板(commonHeader.html)中暴露在window作用域下的变量
        if((typeof kf != "undefined") && kf.loginUin && getPersonalUin() && kf.loginUin != getPersonalUin()){
            uploader.cancel(); //调用FileUploader的cancel方法
            LightTip.error('请求失败').on('hide',function(){
                setTimeout(function(){
                    window.location.href = HOMEPAGE;//这个跳转可能被用户在beforeunload事件中手动中止
                },16);//加延时为了使“非企点账号登录”的error事件在此之前执行
            });
            r = false; //不相同
        }
        return r;
    }

    //是否需要阻止上传
    FileUploader.prototype.isUploadPrevented = function(){
        var r = false; //默认为不需要阻止
        if(hasSameLoginUin(this) == false){
            r = true; //需要阻止
        }
        return r;
    };


    return FileUploader.include({
		settings: settings
	});
});
