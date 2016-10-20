/**
 * User: sqchen
 * Date: 15-07-07
 * Time: 下午14:40
 * 公众号同步控件
 */

LBF.define('qidian.comp.AccountSync', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        Panel = require('qidian.comp.Panel'),
        Tip = require('ui.Nodes.Tip'),
        LightTip = require('qidian.comp.LightTip'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        iCheckbox = require('ui.widget.ICheckbox.ICheckbox');

    var qqImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/QQdefault.png',
        wxImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/weixindefault.png';

    var AccountSync = module.exports = Class.inherit({
        /**
         * 公众号同步控件
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
                syncUrl: '',
                pageType: 0,
                accountID: '',
                accountType: '',
                accountList: [],
                beforeMsg: '<h6>确定操作？</h6>',
                tpl: {
                    content: [
                        '<div class="sync-action">',
                        '    <div class="info-item current-item">',
                        '       <%== currentItem %>',
                        '    </div>',
                        '    <p class="tit">同步到以下多个公众号</p>',
                        '    <div class="list">',
                        '        <ul>',
                        '           <%== accountItem %>',
                        '        </ul>',
                        '    </div>',
                        '</div>'
                    ].join(''),
                    currentItem: [
                        '<div class="info">',
                        '   <p class="avatar"><img src="<%== icon %>" width="50" height="50" alt="<%= name %>" title="<%= name %>"/></p>',
                        '   <dl>',
                        '       <dt class="name"><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '           <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '       </dl>',
                        '</div>'
                    ].join(''),
                    accountItem: [
                        '<li class="info-item">',
                        '<div class="lbf-icheckbox"><input type="checkbox" id="chk_<%= accountID %>" data-accountID="<%= accountID %>" data-type="<%= type %>"></div>',
                        '<div class="info">',
                        '    <p class="avatar"><img src="<%== icon %>" width="50" height="50" alt="<%= name %>" title="<%= name %>"/></p>',
                        '    <dl>',
                        '        <dt class="name"><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '        <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '    </dl>',
                        '</div>',
                        '</li>'
                    ].join(''),
                    resultList: [
                        '<div class="sync-result">',
                        '    <% if(allStatus == 0 || allStatus == 1) { %>',
                        '    <p class="status complate"><i class="icon-success"></i>以下公众号已同步成功！</p>',
                        '    <% } else if(allStatus == 2) { %>',
                        '    <p class="status fail"><i class="icon-fail"></i>同步失败</p>',
                        '    <% } %>',
                        '    <% if(allStatus == 0 || allStatus == 1) { %>',
                        '    <div class="list">',
                        '        <ul>',
                        '           <% for(var i = 0, l = accountList.length; i < l; i++) { %>',
                        '           <% if(accountList[i].resultStatus != 0) { %>',
                        '           <li class="info-item">',
                        '               <div class="info">',
                        '                   <p class="avatar"><img width="50" height="50" title="<%= accountList[i].name %>" alt="<%= accountList[i].name %>" src="<%= accountList[i].icon %>"></p>',
                        '                   <dl>',
                        '                       <dt class="name"><%= accountList[i].name %><%==  accountList[i].verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (accountList[i].type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '                       <dd class="type"><%= accountList[i].type == 1 ? "微信" : "QQ" %><%= accountList[i].accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '                   </dl>',
                        '               </div>',
                        '           </li>',
                        '           <% } %>',
                        '           <% } %>',
                        '        </ul>',
                        '    </div>',
                        '    <% } %>',
                        '</div>'
                    ].join('')
                },
                events: {}
            }, opts),
            that = this;

            this.syncUrl = opts.syncUrl;
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

            new ConfirmPanel({
                title: '公众号同步',
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
                        content: '同步',
                        sort: 'primary'
                    },
                    {
                        content: '取消',
                        sort: 'link'
                    }
                ],
                events: {
                    ok: function() {
                        var _this = this,
                            lis = $('.sync-action .list li.selected'),
                            curInput,
                            ids = [];

                        for(var i = 0, l = lis.length; i < l; i++) {
                            curInput = $(lis[i]).find('.lbf-icheckbox input');
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
                            LightTip.error('请选择需要同步的公众号');
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

            that.initCheckbox();
        },

        /**
         * 初始化Checkbox
         */
        initCheckbox: function() {
            var accountList = this.accountList;

            for(var i = 0, l = accountList.length; i < l; i++) {
                this.checkboxList['chk_' + accountList[i].accountID] = new iCheckbox({
                    selector: '.sync-action #chk_' + accountList[i].accountID
                });
            }

            this.bindListEvents();
        },

        /**
         * 绑定列表整行勾选事件
         */
        bindListEvents: function() {
            var that = this;

            $('.sync-action').click(function(event) {
                var $li = $(event.target).closest('.info-item'),
                    $input = $li.find('input[type=checkbox]');

                if($input[0]) {
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
                url: that.syncUrl,
                data: {
                    from: {
                        id: that.accountID,
                        type: that.accountType
                    },
                    to: aIds
                }
            }).done(function(data) {
                var successList = data.succ,
                    errorList = data.error,
                    accountList = that.accountList,
                    resultStatus,
                    resultList = [],
                    allStatus;
                
                that.hideLoading();

                if(successList.length > 0 && errorList.length > 0) {
                    allStatus = 0;      //同时有同步成功和失败情况
                } else if(successList.length > 0 && errorList.length == 0) {
                    allStatus = 1;      //全部成功
                } else if(successList.length == 0 && errorList.length > 0) {
                    allStatus = 2;      //全部失败
                }

                for(var i = 0, l = aIds.length; i < l; i++) {
                    if($.inArray(+aIds[i].id, successList) != -1) {
                        resultStatus = 1;
                    } else if($.inArray(+aIds[i].id, errorList) != -1) {
                        resultStatus = 0;
                    } else {
                        break;
                    }

                    for(var j = 0, jL = accountList.length; j < jL; j++) {
                        if(aIds[i].id == accountList[j].accountID) {
                            accountList[j].icon = accountList[j].icon ? accountList[j].icon : (accountList[j].type == 1 ? wxImg : qqImg);
                            resultList.push($.extend({
                                resultStatus: resultStatus
                            }, accountList[j]));
                        }
                    }
                }

                new ConfirmPanel({
                    title: '&nbsp;',
                    content: template(that.tpl.resultList)({
                        accountList: resultList,
                        allStatus: allStatus
                    }),
                    buttons: [
                        {
                            content: '完成',
                            sort: 'primary'
                        },
                        {
                            content: '取消',
                            sort: 'link'
                        }
                    ],
                    events: {
                        ok: function() {
                            location.reload();
                        },
                        close: function() {
                            location.reload();
                        }   
                    }
                });

                $('.sync-result').parent().next().find('.lbf-button-link').hide();
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
                '            <dd>正在同步</dd>',
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
    AccountSync.include($.extend(true, {
        
    }));
});
