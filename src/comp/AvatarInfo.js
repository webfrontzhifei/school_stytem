/**
 * 头部头像hover出修改密码链接
 * @author: vergilzhou
 * @version: 1.0.0
 * @date: 2015/11/23
 */
LBF.define('qidian.comp.AvatarInfo', function(require, exports, module){
	var $ = require('lib.jQuery'),
		Tip = require('ui.Nodes.Tip'),
		//ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
		Panel = require('qidian.comp.Panel'),
        md5 = require('util.md5'),
		TextInput = require('qidian.comp.TextInput'),
		REST = require('qidian.comp.REST'),
        LightTip = require('qidian.comp.LightTip'),
    	PTLogin = require('qidian.comp.PTLogin');
    
    var isAdmin = $('.avatar').hasClass('is-admin'),
    	// pwdCodeImgUrl = '/mp/accountManage/getVerify',
    	pwdCodeImgUrl = 'http://captcha.qq.com/getimage?aid=3000401&uin=&r=' ,
    	content = '<a href="https://aq.qq.com" target="_blank">修改密码</a>';

    if (!isAdmin) {
    	content = '<a href="javascript:void(0);" id="avatarModifyPwd">修改密码</a>';
    }

    $('.avatar').length && new Tip({
		className: 'avatar-tip',
		trigger: '.header .info',
		container: 'body',
		adjust: {
			// y: -10,
			y: -8,
			x:10
		},
		content: content,
		show: {
			mode: 'hover'
		}
	}).hide();

	/**
     * 刷新验证码
     */
    var verifyCode = function(){
        var code = $('.global-reset-pwd #pwdCodeImg');
        // code.attr('src', pwdCodeImgUrl + '?t=' + Math.random());
        code.attr('src', pwdCodeImgUrl  + Math.random());
    };

    /**
     * 初始化表单元素与校验
     */
    /* var initFormElements = function() {
 
    	var pwdOld = new TextInput({
            selector: '.global-reset-pwd #pwdOld',
            validate: function(event, value){
                var value = this.val();

                if(!value || value === '') {
                    return this.setTipContent('请填写旧密码');
                }
                return '';
            }
        });

        var pwdNew = new TextInput({
            selector: '.global-reset-pwd #pwdNew',
            validate: function(event, value){
                var value = this.val(),
                reg = /^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).+|(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+|(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+)$/;

                if(!value || value === '') {
                    return this.setTipContent('请填写新密码');
                }

                if(!reg.test(value)){
                    return this.setTipContent('您输入的密码不符合安全强度要求');
                }

                if (value.length < 6 || value.length > 16) {
                    return this.setTipContent('您输入的密码长度不符合要求');
                }

                return '';
            }
        });

        new TextInput({
            selector: '.global-reset-pwd #pwdNew2',
            validate: function(event, value){
                var value = this.val();

                if(!value || value === '') {
                    return this.setTipContent('请再次填写新密码');
                }

                if(value !== $('.global-reset-pwd #pwdNew').val()) {
                    return this.setTipContent('两次密码输入不一致');
                }

                return '';
            }
        });

        new TextInput({
            selector: '.global-reset-pwd #pwdCode',
            validate: function(event, value){
                var value = this.val();

                if(!value || value === '') {
                    return this.setTipContent('请填写验证码');
                }
                return '';
            }
        }); 
        
        
    }; */

    /**
     * 重置密码
     * @param {Object} oCfg 请求的参数
     * @param {Object} panel 修改密码弹框
     */
     /*
    var changePwd = function(oCfg, panel) {
        REST.create({
            url: '/mp/accountManage/ModifyPwd',
            data: oCfg
        }).done(function(data) {
            LightTip.success('修改密码成功！');
            panel.remove();
            setTimeout(function() {
                //登出当前页
                PTLogin.logout();
            }, 2000);
        }).fail(function(e) {
        	verifyCode();
            LightTip.error(e.message);
        });
    };
    */

	// $('document').ready(function() {

        $('.global-reset-pwd #pwdCodeLink').live('click', function() {
        	verifyCode();
        });

		$('#avatarModifyPwd').click(function() {

			var loginName = $('.header .header-info-name').text(),
                phone = $('.header .avatar[data-phone]').attr('data-phone');
            
            if(!phone){
                Panel.alert({
                    className: 'global-unbind-dialog',
                    content: '<h6>无法修改密码</h6><p>账号<span class="name">'+loginName+'</span>没有绑定有效的手机号，<br/>请联系管理员帮您重置密码。</p>'
                });
                return;
            }
            
			var pwdPanel = Panel.panel({
                className: 'global-modifypwd-dialog',
                width: 500,
		        title: '修改密码',
		        content: [
                    '<div id="glModifypwdDialog">',
                        '<ol class="mpop_step"><li class="mpop_step_1 mpop_col2 active"><span class="mpop_step_num">1</span> 帐号验证</li><li class="mpop_step_2 mpop_col2 "><span class="mpop_step_num">2</span> 修改密码</li> </ol>',
                        '<div class="area-step area-step1">',
                            '<div class="modifypwd-wrap">',
                                '<ul>',
                                '    <li>请使用<span class="name">'+loginName+'</span>已绑定的手机号<span class="phone">'+phone+'</span>接收验证码</li>',
                                '    <li class="verify-code">',
                                '        <div class="item-head">验证码</div>',
                                '        <div class="item-body">',
                                '            <div class="lbf-text-input"><input id="glCode"><label class="lbf-text-input-placeholder"></label></div>',
                                '            <div class="lbf-button lbf-button-link lbf-button-normal sendcode-btn">发送验证码</div>',
                                '        </div>',
                                '    </li>',
                                '</ul>',
                                '<div class="btn-box">',
                                '   <div class="nextstep-btn lbf-button lbf-button-primary lbf-button-normal">下一步</div>',
                                '</div>',
                            '</div>',
                            '<div class="tips-bottom"><i class="icon icon-tips-info-v2"></i>如果一直未接收到验证码，请联系管理员帮您重置密码。</div>',
                        '</div>',
                        '<div class="area-step area-step2">',
                            '<div class="modifypwd-wrap">',
                                '<div class="lbf-text-input"><input type="password" id="glPwdNew" required><label class="lbf-text-input-placeholder">新密码</label><p class="lbf-text-input-remind">密码长度须6-16位，且包含以下情况的3种：大写字母、小写字母、数字、符号&、*、%等</p></div>',
                                '<div class="lbf-text-input"><input type="password" id="glPwdRenew" required><label class="lbf-text-input-placeholder">重复密码</label></div>',
                                '<div class="btn-box">',
                                '   <div class="save-btn lbf-button lbf-button-primary lbf-button-normal">保存</div>',
                                '   <div class="cancel-btn lbf-button lbf-button-normal">取消</div>',
                                '</div>',
                            '</div>',
                            '<div class="tips-bottom"><i class="icon icon-tips-info-v2"></i>修改密码后，您需要重新登录企点帐号。</div>',
                        '</div>',
                    '</div>',
		        ].join(''),
		        /*events: {
		            ok: function(event) {
		                if(!$('.global-reset-pwd .lbf-text-input').hasClass('lbf-text-input-error')) {
		                    var postData = {
		                    	kfext: curId,
		                        oldPwd: md5($('.global-reset-pwd #pwdOld').val()),
		                        newPwd: md5($('.global-reset-pwd #pwdNew').val()),
		                        vcode: $('.global-reset-pwd #pwdCode').val()
		                    };

		                    changePwd(postData, this);
		                }
		            }
		        }*/
		    });
            
            initPwdDialog(pwdPanel);
            
			//initFormElements();

			//$('.global-reset-pwd #pwdOld').focus();
		});
	// });
	
    //从客户端修改密码跳转链接直接显示浮层
    if(getQuery('resetpwd') === '1'){
        $('#avatarModifyPwd').trigger('click');
    }
    
    
    function initPwdDialog(panel){
        var dialog = $('#glModifypwdDialog');
        /* var mobileInput = new TextInput({
            selector: dialog.find('#glMobile'),
            validate: function(event, value){
                var value = $.trim(this.val()),
                    reg = /^13[0-9]{9}$|^14[0-9]{9}|^15[0-9]{9}$|^18[0-9]{9}$|^17[0-9]{9}$|^16[0-9]{9}$/;
                    
                if(value == '') {
                    this.setTipContent('手机号不能为空');
                    this.focus();
                    return false;
                }else if(!reg.test(value)){
                    this.setTipContent('请输入正确的手机号码');
                    this.focus();
                    return false;
                }
                return true;
            }
        }); */
        
        var verifyCodeInput = new TextInput({
            selector: dialog.find('#glCode'),
            validate: function(){
               var value = $.trim(this.val());
                if(value == '') {
                    this.setTipContent('验证码不能为空');
                    this.focus();
                    return false;
                }
                return true;
            }
        });
        
        var pwdInput = new TextInput({
            selector: dialog.find('#glPwdNew'),
            validate: function(event, value) {
                var value = $.trim(this.val()),
                    passValidate = false;
                
                if(value == '') {
                    this.setTipContent('密码不能为空');
                }else if(value.length < 6) {
                    this.setTipContent('密码最小长度为6位');
                }else if(value.length > 16) {
                    this.setTipContent('密码最大长度为16位');
                }else if(!/^(?:(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+|(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).+|(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+|(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+)$/.test(value)) {
                    this.setTipContent('不符合安全强度要求');
                }else {
                    passValidate = true;
                }
                
                if(!passValidate){
                    this.focus();
                }
                
                return passValidate;
            }
        });
            
        var repwdInput = new TextInput({
            selector: dialog.find('#glPwdRenew'),
            validate: function(){
                var value = $.trim(this.val()),
                    passValidate = false;
                    
                if(value == '') {
                    this.setTipContent('密码不能为空');
                }else if(value != $.trim(pwdInput.val())) {
                    this.setTipContent('密码不一致，请重新输入');
                }else {
                    passValidate = true;
                }
                
                if(!passValidate){
                    this.focus();
                }
                
                return passValidate;
            }
        });
        
        var showStep2 = function(){
            dialog.find('.mpop_step li').removeClass('active');
            dialog.find('.mpop_step_2').addClass('active');
            dialog.find('.area-step').hide();
            dialog.find('.area-step2').show();
        }
        
        dialog.find('.sendcode-btn').on('click',function(){
            var _this = $(this);
                if(_this.hasClass('lbf-button-disabled')) {
                    return false;
                }
                
                _this.addClass('lbf-button-disabled');

                REST.create({
                    url: '/mng/passwd/vcode',
                    type: 'post',
                    data: {
                    },
                    success: function(ret){
                        switch(ret.r){
                            case 0:
                                //验证码倒计时
                                codeCountdown(_this);
                                break;
                            case 1:
                                showSystemError();
                                break;
                            case 2:
                                verifyCodeInput.setTipContent('手机号不存在');
                                verifyCodeInput.focus();
                                break;
                        }
                    },
                    complete: function(){
                        _this.removeClass('lbf-button-disabled');
                    }
                })
                .fail(showSystemError);
                
        })
        
        dialog.find('.nextstep-btn').on('click',function(){
            var _this = $(this);
            if(_this.hasClass('lbf-button-loading') || !verifyCodeInput.validate()){
                return false;
            }
            _this.addClass('lbf-button-loading');
            
            REST.create({
                url: '/mng/passwd/verifycode',
                type: 'post',
                data: {
                    verifycode: $.trim(verifyCodeInput.val()),
                    //phone: $.trim(mobileInput.val())
                },
                success: function(ret){
                    switch(ret.r){
                        case 0:
                            showStep2();
                            break;
                        case 1:
                        case 2:
                            verifyCodeInput.setTipContent('验证码错误，请重新输入');
                            verifyCodeInput.focus();
                            break;
                        case 3:
                            verifyCodeInput.setTipContent('已输错5次，请重新获取');
                            verifyCodeInput.focus();
                            break;
                        
                    }
                },
                complete: function(){
                    _this.removeClass('lbf-button-loading');
                }
            })
            .fail(self.showSystemError);
               
            
            if($(this).hasClass('lbf-button-loading') || !verifyCodeInput.validate()) {
                return false;
            }
        })
        
        dialog.find('.save-btn').on('click',function(){
            var _this = $(this);
            if(_this.hasClass('lbf-button-loading') || !pwdInput.validate() || !repwdInput.validate()){
                return false;
            }
            $(this).addClass('lbf-button-loading');
            
            REST.create({
                url: '/mng/passwd/reset',
                data: {
                    verifycode: $.trim(verifyCodeInput.val()),
                    pwd: md5($.trim(pwdInput.val()))
                },
                success: function(ret){
                    switch(ret.r){
                        case 0:
                            showSuccPanel();
                            break;
                        default:
                            pwdInput.setTipContent('修改密码失败');
                            pwdInput.focus();
                            break;
                    }
                },
                complete: function(){
                    _this.removeClass('lbf-button-loading');
                }
            })
            .fail(self.showSystemError);
            
            
            var _this = $(this);  
            if(_this.hasClass('lbf-button-loading') || !pwdInput.validate() || !repwdInput.validate()){
                return false;
            }
            _this.addClass('lbf-button-loading');
            
            REST.ajax({
                url: '/mng/password/reset',
                data: {
                    code: $.trim(verifyCodeInput.val()),
                    pwd: md5($.trim(pwdInput.val()))
                }
            })
            .done(function(){
                Panel.alert({
                    content: '<h6>新密码设置成功</h6>',
                    type: 'success',
                    events: {
                        ok: function(){
                            PTLogin.logout();
                        },
                        close: function(){
                            PTLogin.logout();
                        }
                    }
                });
                
                //离开页面时要退出
                $(window).one('beforeunload', function(){
                    //$.getScript('https://ui.ptlogin2.qq.com/js/ptloginout.js');
                    PTLogin.logout();
                    //$('.header-logout').trigger('click');
                });
               
            }).fail(function(e) {
                LightTip.error(e.message);
            }).complete(function(e){
                _this.removeClass('lbf-button-loading');
            });
            
            //pwdInput.setTipContent('密码重置有误');
            //focus
        })
        
        dialog.find('.cancel-btn').on('click',function(){
            panel.remove();
        })        
        
        
    }
    
    //验证码倒计时
    function codeCountdown(btn){
        if(!btn){
            return false;
        }
        var wait = 60,
            timer;
        $(btn).html(wait);
        
        timer = setInterval(function(){
            wait--;
            if(wait < 0){
                clearInterval(timer);
                $(btn).removeClass('lbf-button-disabled');
                $(btn).html('发送验证码');
            }else {
                $(btn).html(wait);
            }
            
        },1000)
        
        setTimeout(function(){
            $(btn).addClass('lbf-button-disabled');
        },0)
    }
    
    function showSystemError(e){
        e = e || {};
        var errMsg = e.message || '系统错误，请重试';
        LightTip.error(errMsg);
    }
    
    function showSuccPanel(){
        Panel.alert({
            content: '<h6>新密码设置成功</h6>',
            type: 'success',
            events: {
                ok: function(){
                    PTLogin.logout();
                },
                close: function(){
                    PTLogin.logout();
                }
            }
        });
        

        //离开页面时要退出
        //提前加载logoutjs以防刷新时触发不了logout
        $.getScript('https://ui.ptlogin2.qq.com/js/ptloginout.js');
        $(window).one('beforeunload', function(){
            PTLogin.logout();
        });
    }
    
    //获取url参数
    function getQuery(key,url) {
        url = url || location.href;
        var reg = new RegExp("(^|&|\\?|#)" + key + "=([^&#]*)(&|$|#)", "");
        var match = url.match(reg);
        if (match) {
            return match[2];
        }
        return null;
    }
    
    
});