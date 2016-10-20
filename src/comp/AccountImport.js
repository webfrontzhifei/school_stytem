/**
 * User: sqchen
 * Date: 15-07-07
 * Time: 下午17:40
 * 公众号导入控件
 */

LBF.define('qidian.comp.AccountImport', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        Panel = require('qidian.comp.Panel'),
        Tip = require('ui.Nodes.Tip'),
        LightTip = require('qidian.comp.LightTip'),
        LocalStorage = require('util.localStorage'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        IRadio = require('ui.widget.IRadio.IRadio');

    var qqImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/QQdefault.png',
        wxImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/weixindefault.png';

    var AccountImport = module.exports = Class.inherit({
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
                importUrl: '',
                accountID: '',
                accountType: '',
                accountList: [],
                beforeMsg: '<h6>确定操作？</h6>',
                tpl: {
                    content: [
                        '<div class="import-action">',
                        /*'<p class="tit">请选择一个公众号</p>',*/
                        '<div class="list">',
                        '    <ul>',
                        '        <%== accountItem %>',
                        '    </ul>',
                        '</div>',
                        '<p class="tit">导入到当前公众号</p>',
                        '<div class="info-item current-item">',
                        '    <%== currentItem %>',
                        '</div>',
                        '</div>'
                    ].join(''),
                    currentItem: [
                        '<div class="info">',
                        '   <p class="avatar"><img src="<%= icon ? icon : (type == 1 ? wxImg : qqImg); %>" width="50" height="50" alt="<%= name %>" title="<%= name %>"/></p>',
                        '   <dl>',
                        '       <dt class="name"><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '       <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '   </dl>',
                        '</div>'
                    ].join(''),
                    accountItem: [
                        '<li class="info-item">',
                        '    <div class="rule-enable lbf-iradio"><input id="chk_<%= accountID %>" name="selectImport" data-accountID="<%= accountID %>" data-type="<%= type %>" type="radio"></div>',
                        '    <div class="info">',
                        '        <p class="avatar"><img src="<%= icon ? icon : (type == 1 ? wxImg : qqImg); %>" width="50" height="50" alt="<%= name %>" title="<%= name %>"/></p>',
                        '        <dl>',
                        '            <dt class="name"><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '            <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '        </dl>',
                        '    </div>',
                        '</li>'
                    ].join('')
                },
                events: {}
            }, opts),
            that = this;

            this.importUrl = opts.importUrl;
            this.pageType = opts.pageType;
            this.accountID = opts.accountID;
            this.accountType = opts.accountType;
            this.accountList = opts.accountList;
            this.beforeMsg = opts.beforeMsg;
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
                pageType = that.pageType,
                accountID = that.accountID,
                accountList = that.accountList,
                accountListArr = [];

            for(var i = 0, l = accountList.length; i < l; i++) {
                if(accountList[i].accountID != accountID) {
                    //qq未认证账号 可以进行自动回复操作和菜单设置。微信未认证账号，不支持菜单设置，但自动回复可以操作
                    if(
                        pageType == 1
                        ||
                        (
                            pageType == 0
                            &&
                            (
                                accountList[i].type == 2
                                ||
                                (
                                    accountList[i].type == 1
                                    &&
                                    !(
                                        accountList[i].accountType == 1
                                        &&
                                        accountList[i].verifyType == 0
                                    )
                                )
                            )
                        )
                    ) {
                        accountListArr.push(template(that.tpl.accountItem)({
                            accountID: accountList[i].accountID,
                            name: accountList[i].name,
                            type: accountList[i].type,
                            accountType: accountList[i].accountType,
                            verifyType: accountList[i].verifyType,
                            icon: accountList[i].icon ? accountList[i].icon : (accountList[i].type == 1 ? wxImg : qqImg)
                        }));
                    }
                } else {
                    //如果是当前公众号
                    currentItem = accountList[i];
                    that.accountType = currentItem.type;
                }
            }

            Panel.panel({
                title: '公众号导入',
                content: template(that.tpl.content)({
                    currentItem: template(that.tpl.currentItem)({
                        accountID: currentItem.accountID,
                        name: currentItem.name,
                        type: currentItem.type,
                        accountType: currentItem.accountType,
                        verifyType: currentItem.verifyType,
                        icon: currentItem.icon ? currentItem.icon : (currentItem.type == 1 ? wxImg : qqImg)
                    }),
                    accountItem: accountListArr.join('')
                }),
                buttons: [
                    {
                        content: '导入',
                        sort: 'primary',
                        events: {
                            click: function() {
                                this.trigger('ok');
                            }
                        }
                    },
                    {
                        content: '取消',
                        sort: 'link',
                        events: {
                            click: function() {
                                this.trigger('cancel');
                            }
                        }
                    }
                ],
                events: {
                    load: function(){
                        var _this = this;
                        !_this.find(".lbf-panel-foot .import-tip").length && _this.find(".lbf-panel-foot").prepend('<span class="import-tip fl"><i class="icon-tip-attention"></i>如果被导入公众号的状态为开启，导入后将立即开启并发布</span>');
                    },
                    ok: function() {
                        var _this = this,
                            lis = $('.import-action .list li.selected'),
                            curInput,
                            ids = [];

                        for(var i = 0, l = lis.length; i < l; i++) {
                            curInput = $(lis[i]).find('.lbf-iradio input');
                            ids.push({
                                id: curInput.attr('data-accountID'),
                                type: curInput.attr('data-type')
                            });
                        }

                        if(ids.length) {
                            Panel.info({
                                msg: that.beforeMsg
                            }).bind('ok', function() {
                                _this.remove();
                                that.doSync(ids);
                            });
                        } else {
                            LightTip.error('请选择需要导入的公众号');
                        }
                    },
                    cancel: function() {
                        this.remove();
                    },
                    close: function() {
                        this.remove();
                    }
                }
            });

            that.initRadio();
        },

        /**
         * 初始化Radio
         */
        initRadio: function() {
            var accountList = this.accountList;

            for(var i = 0, l = accountList.length; i < l; i++) {
                this.checkboxList['chk_' + accountList[i].accountID] = new IRadio({
                    selector: '.import-action #chk_' + accountList[i].accountID
                });
            }

            this.bindListEvents();
        },

        /**
         * 绑定列表整行勾选事件
         */
        bindListEvents: function() {
            var that = this;

            $('.import-action').click(function(event) {
                var $li = $(event.target).closest('.info-item'),
                    $input = $li.find('input[type=radio]');

                if($input[0]) {
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
        },

        /**
         * 发送"公众号同步"请求
         * @param {Array} aIds 需要同步的公众号
         */
        doSync: function(aIds) {
            var that = this;

            that.showLoading();
            REST.update({
                url: that.importUrl,
                data: {
                    from: {
                        id: that.accountID,
                        type: that.accountType
                    },
                    to: aIds
                }
            }).done(function(data) {
                that.hideLoading();
                LightTip.success('导入成功');

                //标记第一次访问这个页面"导入"完成之后,下次进来页面,会自动弹气泡提示去做"同步"操作
                LocalStorage.setItem((that.pageType == 1 ? 'menuImportTipsTimes' : 'replyImportTipsTimes'), 1);

                setTimeout(function() {
                    location.reload();
                }, 1000);
            }).fail(function(e) {
                that.hideLoading();
                logger.log(e.message);
                LightTip.error(e.message);
            });
        },

        /**
         * 显示loading
         */
        showLoading: function() {
            $('.page .content').append([
                '<div class="sync-mask">',
                '    <div class="mask-bg"></div>',
                '    <div class="mask-content">',
                '        <dl>',
                '            <dt class="loading whiteSpin"></dt>',
                '            <dd>正在导入</dd>',
                '        </dl>',
                '    </div>',
                '</div>'
            ].join(''))
        },

        /**
         * 去除loading
         */
        hideLoading: function() {
            $('.page .content .sync-mask').remove();
        }
    });


    /**
     * 类的静态属性
     */
    AccountImport.include($.extend(true, {
        
    }));
});
