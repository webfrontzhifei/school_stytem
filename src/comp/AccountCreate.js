/**
 * User: sqchen
 * Date: 15-08-10
 * Time: 下午13:40
 * 一键开号选择器控件
 */

LBF.define('qidian.comp.AccountCreate', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        Panel = require('qidian.comp.Panel'),
        Tip = require('ui.Nodes.Tip'),
        LightTip = require('qidian.comp.LightTip'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        IRadio = require('ui.widget.IRadio.IRadio');

    var qqImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/QQdefault.png',
        wxImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/weixindefault.png';

    var AccountCreate = module.exports = Class.inherit({
        /**
         * 公众号导入控件
         * @param {Object} opts 配置项
            {
                * @param {Object} trigger 触发点
                * @param {Object} tpl {String} 模板
                events {Object}: 事件
                {
                    
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                accountType: '',
                accountList: [],
                tpl: {
                    content: [
                        '<div class="create-action">',
                        '<p class="tit title-create">一个微信公众号只能开通一个对应的QQ公众号，认证情况保持一致</p>',
                        '<div class="list">',
                        '    <ul>',
                        '        <%== accountItem %>',
                        '    </ul>',
                        '</div>',
                        '</div>'
                    ].join(''),
                    contentNullAccount: [
                        '<div class="create-null-info">',
                        '<div class="icon-openqqBindWx"></div>',
                        '<p class="msg-null">快速开通QQ公众号需要先绑定一个即有微信公众号</p>',
                        '</div>'
                    ].join(''),
                    accountItem: [
                        '<li class="info-item">',
                        '    <div class="rule-enable lbf-iradio"><input id="chk_<%= id %>" name="selectImport" data-id="<%= id %>" data-type="<%= type %>" data-pubQQNum="<%= pubQQNum %>" type="radio"<%== showDisabled %>></div>',
                        '    <div class="info">',
                        '        <p class="avatar"><img src="<%= icon ? icon : (type == 1 ? wxImg : qqImg); %>" width="50" height="50" alt="<%= name %>" title="<%= name %>"/></p>',
                        '        <dl>',
                        '            <dt class="name"><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '            <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %><%== isSupportPubQQ == 1 ? (pubQQNum > 0 ? "(已使用)" : "") : "(暂不支持)" %></dd>',
                        '        </dl>',
                        '    </div>',
                        '</li>'
                    ].join('')
                },
                events: {}
            }, opts),
            that = this;

            this.accountType = opts.accountType;
            this.accountList = opts.accountList;
            this.tpl = opts.tpl;

            this.checkboxList = {};
            
            this.events = opts.events;

            this.drawPanel();
            
            return this.superclass.prototype.initialize.apply(this, arguments);
        },

        /**
         * 初始化弹框
         */
        drawPanel: function() {
            var that = this,
                content,
                currentItem = {},
                accountList = that.accountList,
                accountListArr = [];

            for(var i = 0, l = accountList.length; i < l; i++) {
                if(accountList[i].wxPubQQStatus == 1) {
                    accountListArr.push(template(that.tpl.accountItem)({
                        id: accountList[i].id,
                        name: accountList[i].name,
                        type: accountList[i].type,
                        accountType: accountList[i].accountType,
                        verifyType: accountList[i].verifyType,
                        pubQQNum: accountList[i].pubQQNum,
                        icon: accountList[i].icon ? accountList[i].icon : (accountList[i].type == 1 ? wxImg : qqImg),
                        //pubQQNum是已经对应一键开通QQ公众号数量,只有没开通过的才能开
                        showDisabled: accountList[i].pubQQNum == 0 && accountList[i].isSupportPubQQ == 1 ? '' : ' disabled="disabled"',
                        isSupportPubQQ: accountList[i].isSupportPubQQ
                    }));
                }
            }

            //没有已绑定的微信公众号
            if(accountListArr.length == 0){
                new ConfirmPanel({
                    className: 'panel-openAccountNull',
                    content: template(that.tpl.contentNullAccount)(),
                    buttons: [
                        {
                            content: '立即去绑定微信公众号',
                            sort: 'primary'
                        },
                        {
                            className: 'hidden',
                            content: '',
                            sort: 'disabled'
                        }
                    ],
                    events: {
                        ok: function(){
                            $('#li_bindwxpub').trigger('click', 'openqq'); //触发点击“绑定微信公众号”的授权流程, 传递"openqq"参数用于微信授权后跳转到开号表单页
                        },
                        close: function() {
                            this.remove();
                            that.events.onClose && that.events.onClose.call();
                        }
                    }
                });
                return; //结束后续操作
            }

            //有已绑定的微信公众号
            new ConfirmPanel({
                className: 'panel-openAccountWxList',
                title: '选择已绑定的微信公众号',
                content: template(that.tpl.content)({
                    accountItem: accountListArr.join('')
                }),
                buttons: [
                    {
                        content: '一键开号',
                        sort: 'primary'
                    },
                    {
                        content: '取消',
                        sort: 'link'
                    },
                    {
                        content: '绑定其他微信公众号',
                        sort: 'link fl link-bindOtherWxPub'
                    }
                ],
                events: {
                    load: function(panel){
                        var thisPanel = this;
                        if(accountListArr.length == 1) {
                            //如果只有一个已绑定的微信公众号，默认选中
                            setTimeout(function(){
                                thisPanel.$el.find(".create-action .info-item:first").click();
                            },100);
                        }
                        thisPanel.$el.find(".link-bindOtherWxPub").off("click").one("click",function(){
                            $('#li_bindwxpub').trigger('click', 'openqq'); //触发点击“绑定微信公众号”的授权流程, 传递"openqq"参数用于微信授权后跳转到开号表单页
                        });
                    },
                    ok: function() {
                        var _this = this,
                            curInput = $('.create-action .list li.selected').find('.lbf-iradio input'),
                            _id = curInput.attr('data-id');

                            if(_id) {
                                location.href = '/mp/wxPubQQ/getWxAccountInfoEp?id=' + _id;
                            } else {
                                LightTip.error('请选择已绑定的微信公众号');
                            }
                    },
                    cancel: function() {
                        this.remove();
                        that.events.onCancel && that.events.onCancel.call();
                    },
                    close: function() {
                        this.remove();
                        that.events.onClose && that.events.onClose.call();
                    }
                }
            });

            //"i"说明文字
            /*new Tip({
                trigger: $('.title-create i'),
                content: '一个认证微信公众号只能开一个对应的QQ公众号，<br />未认证微信号可以开通1个QQ公众号',
                container: $('body'),
                direction: 'bottom',
                show: { mode: 'hover' }
            });*/

            //"已使用"提示文字
            /*var openedTrigger = $('.create-action .info-item .no-auth-blue');

            for(var i = 0, l = openedTrigger.length; i < l; i++) {
                (function(n) {
                    new Tip({
                        trigger: $(openedTrigger[n]),
                        content: '已使用该微信公众号资质开通过对应的QQ公众号',
                        container: $('body'),
                        direction: 'bottom',
                        show: { mode: 'hover' }
                    });
                })(i);
            }*/

            that.initRadio();
        },

        /**
         * 初始化Radio
         */
        initRadio: function() {
            var accountList = this.accountList;

            for(var i = 0, l = accountList.length; i < l; i++) {
                this.checkboxList['chk_' + accountList[i].id] = new IRadio({
                    selector: '.create-action #chk_' + accountList[i].id
                });
            }

            this.bindListEvents();
        },

        /**
         * 绑定列表整行勾选事件
         */
        bindListEvents: function() {
            var that = this;

            $('.create-action').click(function(event) {
                var $li = $(event.target).closest('.info-item'),
                    $input = $li.find('input[type=radio]');

                if($input[0] && !$input[0].disabled) {
                    for(var p in that.checkboxList) {
                        that.checkboxList[p].uncheck();
                    }
                    $li.parent().find('.info-item').removeClass('selected');

                    if($li.hasClass('selected')) {
                        that.checkboxList[$input.attr('id')].uncheck();
                        $li.removeClass('selected');
                    } else {
                        that.checkboxList[$input.attr('id')].check();
                        $li.addClass('selected');
                    }
                }
            });
        }
    });


    /**
     * 类的静态属性
     */
    AccountCreate.include($.extend(true, {
        
    }));
});
