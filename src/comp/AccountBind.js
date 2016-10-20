/**
 * User: sqchen
 * Date: 15-07-09
 * Time: 下午15:40
 * 绑定QQ公众号-选号控件
 */

LBF.define('qidian.comp.AccountBind', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        LightTip = require('qidian.comp.LightTip'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        iCheckbox = require('ui.widget.ICheckbox.ICheckbox');

    var AccountBind = module.exports = Class.inherit({
        /**
         * 绑定QQ公众号-选号控件
         * @param {Object} opts 配置项
            {
                * @param {Object} tpl {String} 模板
                events {Object}: 事件
                {
                    
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                uin: '',
                tpl: [
                    '<div id="panelBindAction" class="sync-action bind-action<%== accountList.length == 1 ? \' bind-action-only\' : (accountList.length == 0 ? \' bind-action-none\' : \'\'); %>">',
                    '<% if(accountList.length) { %>',
                    /*/// '    <p class="select-all"><span class="lbf-icheckbox"><input type="checkbox" id="chk_accountAll"></span>全选</p>',*/
                    '    <div class="list<%== accountList.length == 1 ? " list-only" : ""; %>">',
                    '        <ul id="accountBindList">',
                    '            <% for(var i = 0, l = accountList.length; i < l; i++) { %>',
                    '            <li class="info-item<%== accountList.length == 1 ? " info-item-only" : ""; %>">',
                    /*/// '                <div class="lbf-icheckbox"><input type="checkbox" id="chk_<%= accountList[i].accountID %>" data-accountID="<%= accountList[i].accountID %>"></div>',*/
                    '                <div<%== accountList.length == 1 ? " class=\'lbf-iradio lbf-iradio-checked\'" : " class=\'lbf-icheckbox\'"; %>><input type="checkbox" id="chk_<%= accountList[i].accountID %>" data-accountID="<%= accountList[i].accountID %>"></div>',
                    '                <div class="info">',
                    '                    <p class="avatar"><img src="<%= accountList[i].faceUrl %>" width="50" height="50" alt="<%= accountList[i].accountName %>" title="<%= accountList[i].accountName %>"/></p>',
                    '                    <dl>',
                    '                        <dt class="name"><%= accountList[i].accountName %><% if(accountList[i].verifyType == 0) { %><span class="no-auth">未认证</span><% } else { %><i class="<%= accountList[i].type == 1 ? \'icon-wx-authed\' : \'icon-authed\'; %>"></i><% } %></dt>',
                    '                        <dd class="type">QQ<%= accountList[i].accountType == 1 ? "订阅号" : "服务号" %></dd>',
                    '                    </dl>',
                    '                </div>',
                    '            </li>',
                    '            <% } %>',
                    '        </ul>',
                    '    </div>',
                    '    <p class="tip">如果该公众号已启用开发者模式并绑定到第三方平台，则绑定过程中会自动解绑再绑定到企点平台</p>',
                    '<% } else { %>',
                    '<div class="empty">',
                    '    <dl>',
                    '        <dt></dt>',
                    '        <dd>没有可绑定的公众号</dd>',
                    '    </dl>',
                    '</div>',
                    '<% } %>',
                    '</div>'
                ].join(''),
                events: {}
            }, opts),
            that = this;

            this.uin = opts.uin;
            this.tpl = opts.tpl;

            this.checkboxAll;
            this.checkboxList = {};
            
            this.events = opts.events;

            this.drawPanel();
            
            return this.superclass.prototype.initialize.apply(this, arguments);
        },

        /**
         * 初始化弹框
         */
        drawPanel: function() {
            var that = this;

            REST.read({
                url: '/mp/accountInfo/getQQAccountList',
                data: {
                    adminQQ: that.uin
                }
            }).done(function(data) {
                var list = [],
                    isIn,
                    trs = $('#table_AccountInfoList tr');

                //如果页面上已经有这个号，则过滤掉
                for(var i = 0, l = data.length; i < l; i++) {
                    isIn = false;
                    for(var j = 0, jL = trs.length; j < jL; j++) {
                        if(trs[j].id == 'tr_pubacc_' + data[i].accountID) {
                            isIn = true;
                            break;
                        }
                    }
                    if(!isIn) {
                        list.push(data[i]);
                    }
                }

                new ConfirmPanel({
                    title: (list.length == 1 ? '需要' : '选择') + '绑定的公众号',
                    content: template(that.tpl)({
                        accountList: list
                    }),
                    buttons: [
                        {
                            content: '绑定',
                            sort: 'primary'
                        },
                        {
                            content: '取消',
                            sort: 'link'
                        }
                    ],
                    events: {
                        ok: function(event) {
                            var _this = this,
                                ///inputs = $('#accountBindList li.selected input[type=checkbox]'),
                                inputs = $('#accountBindList li input[type=checkbox]'),
                                ids = [];

                            for(var i = 0, l = inputs.length; i < l; i++) {
                                ids.push($(inputs[i]).attr('data-accountID'));
                            }

                            this.remove();
                            that.events.onSelect.call(that, event, ids);
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
                
                if(!list.length) {
                    $('#panelBindAction').closest('.lbf-panel').find('.lbf-panel-foot').hide();
                }

                ///that.initCheckbox();
            }).fail(function(e) {
                logger.log(e.message);
                LightTip.error(e.message).on('hide',function(){
                    //当登录的QQ号不是公众号或无法获取公众号列表时的处理
                    that.events.onDataFail && that.events.onDataFail.call();
                });
            });
        },

        /**
         * 初始化Checkbox
         */
        initCheckbox: function() {
            var that = this,
                chks = $('#accountBindList li input[type=checkbox]');

            for(var i = 0, l = chks.length; i < l; i++) {
                this.checkboxList[chks[i].id] = new iCheckbox({
                    selector: $(chks[i])
                });
            }

            this.checkboxAll = new iCheckbox({
                selector: $('#chk_accountAll'),
                events: {
                    check: function() {
                        that.resetCheckboxList(1);
                    },
                    uncheck: function() {
                        that.resetCheckboxList(0);
                    }
                }
            });

            this.bindListEvents();
        },

        /**
         * 重置列表的勾选
         * @param {Number} nType 1-设置成全勾选，0-设置成全不勾选
         */
        resetCheckboxList: function(nType) {
            var checkboxList = this.checkboxList;

            for(var p in checkboxList) {
                checkboxList[p][nType == 1 ? 'check' : 'uncheck']();
            }

            $('#accountBindList li.info-item')[nType == 1 ? 'addClass' : 'removeClass']('selected');
        },

        /**
         * 绑定列表整行勾选事件
         */
        bindListEvents: function() {
            var that = this;

            $('#accountBindList').click(function(event) {
                var $li = $(event.target).closest('.info-item'),
                    $input = $li.find('input[type=checkbox]'),
                    $this = $(this);

                if($input[0]) {
                    if($li.hasClass('selected')) {
                        that.checkboxList[$input.attr('id')].uncheck();
                        $li.removeClass('selected');
                    } else {
                        that.checkboxList[$input.attr('id')].check();
                        $li.addClass('selected');
                    }

                    setTimeout(function() {
                        that.checkboxAll[$this.find('li.selected').length == $this.find('li').length ? 'check' : 'uncheck']();
                    }, 1);
                    
                }
            });
        }
    });


    /**
     * 类的静态属性
     */
    AccountBind.include($.extend(true, {
        
    }));
});
