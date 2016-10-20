/**
 * User: sqchen
 * Date: 15-07-18
 * Time: 下午16:10
 * 群发预览选号控件
 */

LBF.define('qidian.comp.GroupSendPreview', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        Panel = require('qidian.comp.Panel'),
        Tip = require('ui.Nodes.Tip'),
        LightTip = require('qidian.comp.LightTip'),
        TextInput = require('qidian.comp.TextInput'),
        logger = require('qidian.comp.logger'),
        IRadio = require('ui.widget.IRadio.IRadio'),
        Cookie = require('util.Cookie'),
        RecentTips = require('qidian.comp.RecentTips'),
        TabView = require('qidian.comp.TabView');

    var qqImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/QQdefault.png',
        wxImg = '//bqq.gtimg.com/qidian/src/themes/blue/mp/account/images/weixindefault.png',
        qquinInput, wxuinInput, panel, tabView, selTabIndex;

    var GroupSendPreview = module.exports = Class.inherit({
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
                accountList: [],
                beforeMsg: '<h6>确定操作？</h6>',
                tpl: {
                    content: [
                        '<div class="preview-action">',
                            '<div class="tabview">',
                                '<ul class="lbf-tabview-tabs">',
                                    '<li class="lbf-tabview-tab lbf-tabview-tab-selected">QQ公众号</li>',
                                    '<li class="lbf-tabview-tab">微信公众号</li>',
                                    '<i class="lbf-tabview-tab-line"></i>',
                                '</ul>',
                                '<div class="lbf-tabview-contents">',
                                    '<div class="lbf-tabview-content lbf-tabview-content-selected">',
                                        '<ul class="acount-list">',
                                            '<%== qqAccountItem ? qqAccountItem : \'<p class=\"empty-holder\">暂无QQ公众号</p>\'%>',
                                        '</ul>',
                                        '<%if(qqAccountItem){%>',
                                            '<div class="lbf-text-input"><input type="text" id="qquin" placeholder="填写QQ号接收预览"></div>',
                                            '<ul class="qquin-list"></ul>',
                                        '<%}%>',
                                    '</div>',
                                    '<div class="lbf-tabview-content">',
                                        '<ul class="acount-list">',
                                            '<%== wxAccountItem ? wxAccountItem : \'<p class=\"empty-holder\">暂无微信公众号</p>\'%>',
                                        '</ul>',
                                        '<%if(wxAccountItem){%>',
                                            '<div class="lbf-text-input"><input type="text" id="wxuin" placeholder="填写微信号接收预览"></div>',
                                            '<ul class="wxuin-list"></ul>',
                                        '<%}%>',
                                    '</div>',
                                '</div>',
                            '</div>',
                        '</div>'
                    ].join(''),
                    accountItem: [
                        '<li class="info-item">',
                        //'   <% if(type == 2) { %>',
                        '    <div class="rule-enable lbf-iradio"><input id="chk_<%= accountID %>" name="selectImport" data-accountID="<%= accountID %>" data-type="<%= type %>" type="radio"></div>',
                        /*'   <% } else { %>',
                        '    <div class="rule-enable" style="padding-top:16px; color:#f00; float:right;">暂不支持</div>',
                        '   <% } %>',*/
                        '    <div class="info">',
                        '        <p class="avatar"><img src="<%= faceUrl %>" width="50" height="50" alt="<%= accountName %>" title="<%= accountName %>"/></p>',
                        '        <dl>',
                        '            <dt class="name"><%= accountName %><%== verifyType <= 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '            <dd class="type"><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '        </dl>',
                        '    </div>',
                        '</li>'
                    ].join(''),
                    uinItem: [
                        '<li>',
                            '<a class="uin-holder" href="javascript:;" data-uin="<%= uin %>"><span><%= uin %></span></a><a class="icon-holder" href="javascript:;" data-uin="<%= uin %>"><i class="icon-mp icon-mp-remove-grey-s"></i></a>',
                        '</li>'
                    ].join('')
                },
                events: {}
            }, opts);

            this.importUrl = opts.importUrl;
            this.accountID = opts.accountID;
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
                accountID = that.accountID,
                accountList = that.accountList,
                qqAccountListArr = [], wxAccountListArr = [], accountItem;

            for(var i = 0, l = accountList.length; i < l; i++) {
                if(accountList[i].accountID != accountID) {
                    if(accountList[i].verifyType > 0) {
                        accountItem = template(that.tpl.accountItem)({
                            accountID: accountList[i].accountID,
                            accountName: accountList[i].accountName,
                            type: accountList[i].type,
                            accountType: accountList[i].accountType,
                            verifyType: accountList[i].verifyType,
                            faceUrl: accountList[i].faceUrl ? accountList[i].faceUrl : (accountList[i].type == 1 ? wxImg : qqImg)
                        });
                        accountList[i].type == 1 ? wxAccountListArr.push(accountItem) : qqAccountListArr.push(accountItem);
                    }
                }
            }

            panel = Panel.panel({
                title: '选择公众号发送预览',
                content: template(that.tpl.content)({
                    qqAccountItem: qqAccountListArr.join(''),
                    wxAccountItem: wxAccountListArr.join('')
                }),
                buttons: [
                    {
                        content: '确定',
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
                                this.remove();
                            }
                        }
                    }
                ],
                events: {
                    ok: function(event) {
                        var _this = this,
                            _item = $('.preview-action .lbf-tabview-content:eq(' + selTabIndex + ') .acount-list li.selected input:eq(0)'),
                            _accountID = _item.attr('data-accountID'),
                            _type = _item.attr('data-type'),
                            _input = selTabIndex == 0 ? $('.lbf-panel #qquin') : $('.lbf-panel #wxuin'),
                            _uinAccount = _input.val();

                        if(typeof _accountID != 'undefined' && _accountID.length) {
                            //没符合校验逻辑
                            if($.trim(_uinAccount) === '') {
                                _input.focus();
                                return;
                            }

                            that.events.onSelect.call(that, event, {
                                data: {
                                    puinAccountId: _accountID,
                                    mpType: _type,
                                    uinAccount: _uinAccount
                                },
                                panel: _this,
                                okBtn: _this.buttons[0]
                            });

                            that.saveRecentPreviewUins(_uinAccount, _type);
                        } else {
                            LightTip.error('请选择公众号');
                        }
                    },
                    close: function() {
                        this.remove();
                    }
                }
            });

            qquinInput = new TextInput({
                selector: '.lbf-panel #qquin',
                immediate: false,
                validate: function(event, value) {
                    if(!value || $.trim(value) === '') {
                        return this.setTipContent('请输入QQ号');
                    }
                    return '';
                }
            });

            wxuinInput = new TextInput({
                selector: '.lbf-panel #wxuin',
                immediate: false,
                validate: function(event, value) {
                    if(!value || $.trim(value) === '') {
                        return this.setTipContent('请输入微信号');
                    }
                    return '';
                }
            });

            that.initTabView();

            that.initRadio();

            that.initRecentTips();
        },

        /**
         * 初始化TabView
         */
        initTabView: function () {
            tabView = new TabView({
                autoChangeTitle: false,
                selector: panel.$el.find('.tabview'),
                events: {
                    selectItem: function (event, tabViewItem, index, currSelTab) {
                        var underline = panel.$el.find('.tabview ul i'),
                            $tab = currSelTab.$tab;
                        underline.css({
                            display: 'block',
                            left: $tab.position().left,
                            width: $tab.width()
                        });
                        selTabIndex = index;
                    }
                }
            });
        },

        /**
         * 初始化Radio
         */
        initRadio: function() {
            var accountList = this.accountList;

            for(var i = 0, l = accountList.length; i < l; i++) {
                this.checkboxList['chk_' + accountList[i].accountID] = new IRadio({
                    selector: '.preview-action #chk_' + accountList[i].accountID
                });
            }

            this.bindListEvents();
        },

        /**
         * 绑定列表整行勾选事件
         */
        bindListEvents: function() {
            var that = this;

            $('.preview-action').click(function(event) {
                var $li = $(event.target).closest('.info-item'),
                    $input = $li.find('input[type=radio]'),
                    type = $input.attr('data-type');

                if($input[0]) {
                    if($li.hasClass('selected')) {
                        that.checkboxList[$input.attr('id')].uncheck();
                        $li.removeClass('selected');
                    } else {
                        for(var p in that.checkboxList) {
                            that.checkboxList[p].uncheck();
                            panel.$el.find('.info-item').removeClass('selected');
                        }

                        that.checkboxList[$input.attr('id')].check();
                        $li.addClass('selected');
                    }
                }
            });
        },

        /**
         * 保存最近三次预览的qq或微信号
         * @param {String} uin 最近一次预览的qq或微信号
         * @param {Number} type 最近一次预览的号码类型, 1-wx, 2-qq
         */
        saveRecentPreviewUins: function(uin, type) {
            var uin = $.trim(uin),
                WXs = Cookie.get('qidianPreviewWXs'),
                QQs = Cookie.get('qidianPreviewQQs'),
                WXsArr = [],
                QQsArr = [];

            if(WXs) {
                WXsArr = WXs.split(',');
            }

            if(QQs) {
                QQsArr = QQs.split(',');
            }

            if(type == 1) {
                this.setRecentPreviewCookie('qidianPreviewWXs', uin, WXsArr);
            } else if(type == 2) {
                this.setRecentPreviewCookie('qidianPreviewQQs', uin, QQsArr);
            }
        },

        /**
         * 将最近三次预览的qq或微信号存储进cookie
         * @param {String} name cookie字段名
         * @param {String} uin 最近一次预览的qq或微信号
         * @param {Array} historyArr 历史预览过的号码
         */
        setRecentPreviewCookie: function(name, uin, historyArr) {
            var index = $.inArray(uin, historyArr);

            if(index == -1) {
                historyArr.splice(0, 0, uin);
                Cookie.set(name, historyArr.slice(0, 3).join(','),'','/', 1000 * 1800);
            } else {
                historyArr.splice(index, 1);
                historyArr.splice(0, 0, uin);
                Cookie.set(name, historyArr.join(','),'','/', 1000 * 1800);
            }
        },

        /**
         * 初始化最近三次预览的qq或微信号选择
         */
        initRecentTips: function() {
            this.renderRecentTips();
        },

        renderRecentTips: function () {
            var that = this,
                wxUins = Cookie.get('qidianPreviewWXs'),
                qqUins = Cookie.get('qidianPreviewQQs'),
                uinsArr, wxUinsArr, qqUinsArr, wxUinsItem = [], qqUinsItem = [], $uinList, $wxUinList, $qqUinList, i, len;

            wxUinsArr = wxUins ? wxUins.split(',') : [];
            qqUinsArr = qqUins ? qqUins.split(',') : [];

            for(i = 0, len = wxUinsArr.length; i < len; i++) {
                wxUinsItem.push(template(that.tpl.uinItem)({
                    uin: wxUinsArr[i]
                }));
            }

            for(i = 0, len = qqUinsArr.length; i < len; i++) {
                qqUinsItem.push(template(that.tpl.uinItem)({
                    uin: qqUinsArr[i]
                }));
            }

            $uinList = panel.$el.find('.wxuin-list, .qquin-list');
            $wxUinList = panel.$el.find('.wxuin-list');
            $qqUinList = panel.$el.find('.qquin-list');

            $wxUinList.html(wxUinsItem.join(''));
            $qqUinList.html(qqUinsItem.join(''));

            $uinList.find('.uin-holder').click(function (event) {
                var $currTarget = $(event.currentTarget),
                    uin = $currTarget.data('uin'),
                    $input = selTabIndex == 0 ? panel.$el.find('#qquin') : panel.$el.find('#wxuin');

                $input.val(uin).focus();
            });

            $uinList.find('.icon-holder').click(function (event) {
                var $currTarget = $(event.currentTarget),
                    uin = "" + $currTarget.data('uin'), index;
                    uinsArr = selTabIndex == 0 ? qqUinsArr : wxUinsArr;
                    index = $.inArray(uin, uinsArr);

                if(index !== -1) {
                    uinsArr.splice(index, 1);

                    selTabIndex == 0 ? Cookie.set("qidianPreviewQQs", uinsArr.join(','),'','/', 1000 * 1800) : Cookie.set("qidianPreviewWXs", uinsArr.join(','),'','/', 1000 * 1800);
                    that.renderRecentTips();
                }
            });
        }
    });


    /**
     * 类的静态属性
     */
    GroupSendPreview.include($.extend(true, {}));
});
