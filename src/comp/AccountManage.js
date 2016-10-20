/**
 * User: sqchen
 * Date: 15-07-08
 * Time: 上午17:40
 * 公众号列表控件
 */

LBF.define('qidian.comp.AccountManage', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Controller = require('qidian.comp.PageController'),
        template = require('util.template'),
        LocalStorage = require('util.localStorage'),
        Tip = require('ui.Nodes.Tip'),
        LightTip = require('qidian.comp.LightTip'),
        REST = require('qidian.comp.REST'),
        ls = require('util.localStorage'),
        logger = require('qidian.comp.logger'),
        AccountSync = require('qidian.comp.AccountSync'),
        AccountImport = require('qidian.comp.AccountImport');

    var AccountManage = Controller.extend({
        el: '.content',

        events: {
            'click .account-manage ul li': 'clickAccountManage',        //公众号菜单列表
            'click .account-manage .btn-sync': 'clickAccountSync',      //公众号同步
            'click .account-manage .btn-import': 'clickAccountImport',  //公众号导入
            'click .account-manage .account-list-turnleft': 'turnLeft',     //向左滚动
            'click .account-manage .account-list-turnright': 'turnRight'    //向右滚动
        },

        initialize: function(options) {
            this.options = options || {};
            this.pageType = options.pageType || 0;      //调用AccountManage的页面类型,0-菜单页面,1-自动回复页面
            this.accountID = options.accountID || '';
            this.accountList = options.accountList || [];
            this.syncValidate = options.syncValidate || function() { return true; }
            this.kfuin = options.kfuin || '';
            
            //如果前端缓存中记录了最后一次展示的公众号，则展示
            this.showCachedAccountId();
            
            //滚动与场景切换
            this.listUl = null;
            this.listParentWidth = 0;
            this.listItemWidth = 0;
            this.listUlWidth = 0;
            this.sceneTotal = 0;        //场景数量
            this.sceneIndex = 0;        //场景索引

            this.initAccountList();
            this.initAccountManage();
            this.initManageCtrlBtn();

            var that = this;
            $(window).bind('resize', function() {
                setTimeout(function() {
                    that.initAccountList();
                }, 500);        //因为左侧菜单折叠展开有动画效果,这里做了延迟处理
            });
        },
        
        showCachedAccountId: function() {
            var self = this,
                accList = this.accountList,
                accountID = this.accountID,
                canJump = false,
                cachedAccountId = ls.getItem(this.kfuin);
                
            logger.info('cahced id:' + cachedAccountId);
                
            if (cachedAccountId && cachedAccountId != accountID) {
                 for (var i = 0, len = accList.length; i < len; i++) {
                     if (accList[i].accountID == cachedAccountId) {
                         canJump = true;
                         break;
                     };
                 }
                 
                 if (canJump) {
                     //this.jumpAccountId(cachedAccountId);
                 }
            }
        },

        /**
         * 初始化公众号菜单列表样式
         */
        initAccountList: function() {
            var listParent = $('.account-manage .account-list'),
                listItem = listParent.find('li');

            this.listUl = listParent.find('ul:eq(0)');
            this.listParentWidth = listParent.width();
            this.listItemWidth = listItem.width();
            this.listUlWidth = listItem.length * this.listItemWidth;
            this.sceneWidth = Math.floor(this.listParentWidth / this.listItemWidth) * this.listItemWidth;
            this.sceneTotal = Math.ceil(this.listUlWidth / this.sceneWidth);
            
            this.sceneIndex = 0;
            
            this.listUl.css({
                width: this.listUlWidth + 'px',
                left: 0
            });
           
            
            if(this.listUlWidth > this.listParentWidth) {
                $('.account-manage .account-list-turnleft, .account-manage .account-list-turnright').show();
                $('.account-list').addClass('over');
                
                this.sceneIndex = Math.floor($('.account-list li.selected').index() * this.listItemWidth / this.sceneWidth);
                
                
                if(this.sceneIndex > 0){
                    this.listUl.animate(
                        {
                            left: -this.sceneWidth * this.sceneIndex
                        },
                    500, 'swing', function() {});
                    
                    if(this.sceneIndex < this.sceneTotal - 1){
                        $('.account-manage .account-list-turnright').removeClass('account-list-turnright-dis');
                    }else {
                        $('.account-manage .account-list-turnright').addClass('account-list-turnright-dis');
                    }
                }else {
                    $('.account-manage .account-list-turnleft').addClass('account-list-turnleft-dis');
                    $('.account-manage .account-list-turnright').removeClass('account-list-turnright-dis');
                }
  
            } else {
                $('.account-manage .account-list-turnleft, .account-manage .account-list-turnright').hide();
                $('.account-list').removeClass('over');
            }   
            
        },

        /**
         * 点左箭头触发滚动
         */
        turnLeft: function() {
            var _linkLeft = $('.account-manage .account-list-turnleft'),
                _linkRight = $('.account-manage .account-list-turnright');

            if(this.sceneIndex >= 1) {
                _linkRight.removeClass('account-list-turnright-dis');
                if(this.sceneIndex == 1) {
                    _linkLeft.addClass('account-list-turnleft-dis');
                }
            }

            if(this.sceneIndex >= 1) {
                this.sceneIndex--;
                this.listUl.animate(
                    {
                        //left: -this.listParentWidth * this.sceneIndex
                        left: -this.sceneWidth * this.sceneIndex
                    },
                500, 'swing', function() {});
            }
        },

        /**
         * 点右箭头触发滚动
         */
        turnRight: function() {
            var _linkLeft = $('.account-manage .account-list-turnleft'),
                _linkRight = $('.account-manage .account-list-turnright');

            if(this.sceneIndex < this.sceneTotal - 1) {
                _linkLeft.removeClass('account-list-turnleft-dis');
                if(this.sceneIndex == this.sceneTotal - 2) {
                    _linkRight.addClass('account-list-turnright-dis');
                }
            }

            if(this.sceneIndex < this.sceneTotal - 1) {
                this.sceneIndex++;
                this.listUl.animate(
                    {
                        //left: -this.listParentWidth * this.sceneIndex
                        left: -this.sceneWidth * this.sceneIndex
                    },
                500, 'swing', function() {});
            }
        },

        /**
         * 初始化公众号菜单列表
         */
        initAccountManage: function() {
            var that = this,
                list = $('.account-manage ul li'),
                thisItem,
                accountID,
                type,
                verifyType,
                name;

            /* for(var i = 0, l = list.length; i < l; i++) {
                thisItem = $(list[i]);
                accountID = thisItem.attr('data-accountID');
                type = thisItem.attr('data-type');
                accountType = thisItem.attr('data-accountType');
                verifyType = thisItem.attr('data-verifyType');
                name = thisItem.attr('data-name');
                new Tip({
                    trigger: thisItem,
                    content: template([
                        '<div class="account-info-tip<%= verifyType == 0 ? \' account-noauth-tip\' : \'\' %>">',
                        '    <% if(verifyType == 0) { %>',
                        '    <p class="tip"><i class="icon-warn"></i>未认证<%= accountType == 1 ? "订阅号" : "服务号" %><%= pageType == 0 && type == 1 && verifyType == 0 ? "不支持编辑菜单" : "" %><% if(type == 1) { %><% } %><br /><a href="<%= type == 1 ? wxAuthUrl : qqAuthUrl %>" target="_blank" class="btn-go">去认证</a></p>',
                        '    <% } else { %>',
                        '    <dl>',
                        '        <dt><%= name %><%== verifyType == 0 ? "<span class=\'no-auth\'>未认证</span>" : (type == 1 ? "<i class=\'icon-wx-authed\'></i>" : "<i class=\'icon-authed\'></i>") %></dt>',
                        '        <dd><%= type == 1 ? "微信" : "QQ" %><%= accountType == 1 ? "订阅号" : "服务号" %></dd>',
                        '    </dl>',
                        '    <% } %>',
                        '</div>'
                    ].join(''))({
                        name: name,
                        type: type,
                        accountType: accountType,
                        verifyType: verifyType,
                        pageType: that.pageType,
                        qqAuthUrl: 'http://mp.qq.com/verify/mp_verify',
                        wxAuthUrl: 'https://mp.weixin.qq.com'
                    }),
                    container: $('body'),
                    direction: 'top',
                    show: { mode: 'hover' }
                });
            } */
            
            //如果当前公众号是未认证的微信号,则不允许编辑菜单
            if(that.pageType == 0 && $('.account-manage ul li.selected').hasClass('disabled')) {
                $('.page .content').append([
                    '<div class="sync-mask">',
                    '    <div class="mask-bg"></div>',
                    '</div>'
                ].join(''));
                $('.account-list .selected').trigger('mouseover');
            }
        },

        /**
         * 初始化“同步”、“导入”操作按钮的tips
         */
        initManageCtrlBtn: function() {
            var syncContent = [
                    template([
                        '<div class="account-info-tip account-noauth-tip">',
                        '    <p class="tip"><i class="icon-warn"></i>绑定多个帐号才可使用该功能<a href="<%= bindUrl %>" class="btn-go">去绑定</a></p>',
                        '</div>'
                    ].join(''))({
                        bindUrl: '/mp/accountInfo'
                    }),
                    '同步发布当前' + (this.pageType == 0 ? '菜单' : '所有自动回复') + '<br />给多个公众号',
                    '高效同步' + (this.pageType == 0 ? '菜单内容' : '自动回复') + '各项内容，<br />无需重复编辑'
                ],
                accountListLen = this.countEnableAccount();

            var syncTip = new Tip({
                trigger: $('.account-manage .account-action .btn-sync'),
                content: syncContent[accountListLen > 1 ? 1 : 0],
                container: $('.account-manage .account-action'),
                direction: 'right',
                adjust: {
                    x: accountListLen > 1 ? (this.pageType == 0 ? -185 : -235) : -265
                },
                show: {
                    mode: 'hover',
                    effect: function() {
                        this.show();
                    }
                }
            });
        },

        /**
         * 公众号菜单列表点击
         */
        clickAccountManage: function(event) {
            var $target = this.$(event.target).closest('li');
            
            if(!$target.hasClass('disabled')) {
                var id = $target.attr('data-accountID');
                //缓存住这个点击的accountID
                ls.setItem(this.kfuin, id);
                this.jumpAccountId(id);
            }
        },
        
        jumpAccountId: function(id) {
            location.href = location.protocol + '//' + location.host + location.pathname + '?accountID=' + id;
        },

        /**
         * 计算已认证数量
         */
        countEnableAccount: function() {
            var accountList = this.accountList,
                enableCount = 0;

            for(var i = 0, l = accountList.length; i < l; i++) {
                if(!(this.pageType == 0 && accountList[i].accountType == 1 && accountList[i].verifyType == 0 && accountList[i].type == 1)) {
                    enableCount++;
                }
            }

            return enableCount;
        },

        /**
         * 公众号同步
         */
        clickAccountSync: function() {
            if($('.account-action').hasClass('disabled')) { return; }

            if(
                !$('.account-manage ul li.selected').hasClass('disabled')
                &&
                this.syncValidate()
            ) {
                new AccountSync({
                    pageType: this.pageType, //调用AccountManage的页面类型,0-菜单页面,1-自动回复页面
                    syncUrl: this.options.syncUrl,
                    accountID: this.accountID,
                    accountList: this.accountList,
                    beforeMsg: '<h6>确定同步？</h6> <p>此操作将更新所选公众号的' + (this.pageType == 0 ? '菜单设置' : '自动回复') + '</p>',
                    events: {}
                });
            }
        },

        /**
         * 公众号导入
         */
        clickAccountImport: function() {
            if($('.account-action').hasClass('disabled')) { return; }

            if(
                !$('.account-manage ul li.selected').hasClass('disabled')
            ) {
                new AccountImport({
                    pageType: this.pageType, //调用AccountManage的页面类型,0-菜单页面,1-自动回复页面
                    importUrl: this.options.importUrl,
                    accountID: this.accountID,
                    accountList: this.accountList,
                    beforeMsg: '<h6>确定导入？</h6> <p>此操作将更新当前公众号的' + (this.pageType == 0 ? '菜单设置' : '自动回复') + '</p>',
                    events: {}
                });
            }
        }
    });


    return AccountManage;
});
