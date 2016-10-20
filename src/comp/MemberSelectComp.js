/**
 * Created by sqchen on 12/2/14.
 */

// 这中一个成员选择组件
// 左边是一棵组织树，正上方是一个搜索框，右边是一个已选择的成员, 如果你想要这种结构的树，那就找对了

LBF.define('qidian.comp.MemberSelectComp', function(require, exports, module) {
    var extend = require('lang.extend'),
        Node = require('ui.Nodes.Node'),
        Promise = require('util.Promise'),
        template = require('util.template'),
        Tasks = require('util.Tasks'),
        Controller = require('qidian.comp.Controller'),
        OrgTreeSearchInput = require('qidian.comp.OrgTreeSearch'),
        MemberController = require('qidian.comp.MemberSelectCompMemberController'),
        MemberModel = require('qidian.comp.MemberSelectCompMemberModel'),
        Model = require('qidian.comp.Model'),
        TreeController = require('qidian.comp.OrgTree'),
        logger = require('qidian.comp.logger');



    var memberSelectComp = exports = module.exports = Node.inherit({
        events: {
            // click 树节点的回调函数
            'onClick': 'onClickTreeNode',

            // 树创建成功的回调
            'onTreeCreateFailure': 'onTreeCreateFailure',

            // 树创建失败的回调
            'onTreeCreateSuccess': 'onTreeCreateSuccess',

            // 选择搜索框选项的回调
            'selectOption': 'onSelectOption'
        },

        initialize: function () {
            logger.log('[memberSelectComp][initialize] enter initialize.');
            var node = this;

            // 初始化Node
            Node.prototype.initialize.apply(this, arguments);

            logger.log('[memberSelectComp][initialize] leave initialize.');
        },

        // events below
        // 传递treeNodeClicked 事件
        triggerTreeNodeClicked: function(curNode) {
            logger.log('[memberSelectComp][triggerTreeNodeClicked] enter treeNodeClicked');

            var controller = this,
                showMemberController = this.showMemberController;

            showMemberController && showMemberController.trigger('treeNodeClicked', [curNode]);

            logger.log('[memberSelectComp][triggerTreeNodeClicked] leave treeNodeClicked');
        },

        // 选中搜索框option触发的事件
        onSelectOption: function (e, option) {
            var controller = this,
                orgTree = controller.orgTree;

            // 默认使用第一个组织链
            orgTree.expandOrgChain(option.uin, option.orgids[0])
                .done(function (ret) {
                    // 选中curNode
                    var tree = ret.tree,
                        curNode = ret.treeNode;

                    // 选中
                    tree.selectNode(curNode);

                    // 传递treeNodeClicked 事件
                    controller.triggerTreeNodeClicked(curNode);
                });
        },


        // 点击树节点触发的事件
        onClickTreeNode: function (e1, e2, treeNodeId, curNode) {
            logger.log('[memberSelectComp][onClickTreeNode] enter treeNodeClicked');

            var controller = this;

            // 传递treeNodeClicked 事件
            this.triggerTreeNodeClicked(curNode);

            logger.log('[memberSelectComp][onClickTreeNode] leave treeNodeClicked');
        },

        // 创建树失败触发的事件
        onTreeCreateFailure: function () {
            logger.error('Tree Controller initialized failed!!!');
        },

        // 创建树成功触发的事件
        onTreeCreateSuccess: function () {
            var controller = this;

            // save the reference to orgTree.tree
            controller.tree = controller.orgTree.tree;
        },

        /**
         * @method getCurSelected
         * @returns {*}
         */
        getCurSelected: function() {
            var node = this;
            return node.showMemberController.getCurSelected();
        },

        render: function () {
            logger.log('[memberSelectComp][render] enter render.');
            var node = this;

            Node.prototype.render.apply(this, arguments);

            var memberSelectCompTemplate = template(this.get('memberSelectCompTemplate'));

            // 生成外部框架
            this.$el.html(memberSelectCompTemplate({}));

            // 生成组织树组件
            var orgTree = this.orgTree = new TreeController({
                    el: node.find('.members-select-left'),
                    tree: node.get('treeSetting')
                })
                .on('onCreateSuccess', function () {
                    node.trigger('onTreeCreateSuccess', [].slice.apply(arguments));
                })
                .on('onCreateFailure', function () {
                    node.trigger('onTreeCreateFailure', [].slice.apply(arguments));
                });

            // 生成搜索组件
            var searchInput = node.searchInput = new OrgTreeSearchInput({
                    selector: node.find('#members-select-search'),
                    resultContainer: node.find('#members-select-search').parent().parent(),
                    userSearchUrl: node.get('searchSetting').userSearchUrl,
                    grepRegexp: node.get('searchSetting').grepRegexp
                });

            // 右边搜索的成员展示，其示我们不是很关心
            // 所以就不需要进行初始化了
            // 直接将showMemberController.$el插入到dialog-select-right的div里面
            // 如果showMemberController == null ，则用预置的showMemberController
            var showMemberController = this.showMemberController =  node.get('showMemberController') ||
                    new MemberController({
                            model: new MemberModel({
                                list: node.get('list'),
                                totalAllowed: node.get('totalAllowed')
                            }),
                            showListTemplate: node.get('showListTemplate')
                        });

            showMemberController && showMemberController.$el && node.find('.dialog-select-right').html(showMemberController.$el);
        }
    });

    // 配置项
    memberSelectComp.include(extend({

        name: 'memberSelectComp',

        settings: {

            // 设置controller的$el
            selector: '',

            // 树设置项
            // 可参照ztree的设置项
            treeSetting: {},

            // 搜索框设置项
            searchSetting: {
                userSearchUrl: '/mng/org/userSearch',
                grepRegexp: '^(.*)\\('
            },

            // 成员选择的外框模板
            memberSelectCompTemplate: [
                '<div id="dialog-choose" class="dialog-select">',
                    '<div class="dialog-select-left">',
                        '<div class="members-select-search">',
                            '<div class="lbf-text-input lbf-search-input">',
                                '<a href="javascript:;"><i class="icon-search">搜索</i></a>',
                                '<input id="members-select-search" type="search">',
                            '</div>',
                        '</div>',
                        '<div class="members-select-box members-select-left">',
                            '<span class="dib tc" style="width:100%;padding-top: 160px;">',
                                '<s class="loading"></s>',
                            '</span>',
                        '</div>',
                    '</div>',
                    '<i class="icon icon-arrow-right"></i>',
                    '<div class="dialog-select-right"></div>',
                '</div>'].join(''),

            // 右边成员list成员信息
            list: [],

            // 总共能够选择的人数
            totalAllowed: 200,

            showListTemplate: [
                '<div class="members-select-text">',
                    '成员人数：<span class="<% if(list.length < totalAllowed) {%> blue <% } else {%> red <% }%> mr5 f16"><%= list.length%></span><span class="f12 gray">/<%= totalAllowed %></span>',
                '</div>',
                '<div id="membersSelectBox" class="members-select-box members-select-right">',
                    '<ul>',
                    '<% for(var i = 0; i < list.length; i ++) {%>',
                        '<% var li = list[i];%>',
                        '<li class="members-item members-select-list <% if(li.disable) {%> disabled <% }%>" data-id="<%= li.id%>">',
            <!-- 有icon 显示icon-->
                            '<span class="icon" style="<% if(li.icon){%> background:url(<%== li.icon%>) no-repeat; <% } else if(li.gender == 1) {%>background:url(/static/hrtx2/dist/themes/default/common/images/orgs_male.png) no-repeat;<% } else {%> background:url(/static/hrtx2/dist/themes/default/common/images/orgs_female.png) no-repeat;<% }%>"></span>',
                            '<% if(li.account) {%>',
                                '<%= li.name%>(<%= li.account %>)',
                            '<% } else {%>',
                                '<%= li.name %>',
                            '<% } %>',
                            '<a class="deleteLi icon icon-clear" href="javascript:;"></a>',
                         '</li>',
                     '<% }%>',
                     '</ul>',
                '</div>'
            ].join(''),

            events: {
                addMemberSuccess: function() {
                    var $membersSelectBox = this.$el.find('#membersSelectBox');
                    if($membersSelectBox[0]) {
                        $membersSelectBox.scrollTop($membersSelectBox[0].scrollHeight);
                    }
                },

                delMemberSuccess: function() {
                    var $membersSelectBox = this.$el.find('#membersSelectBox');
                    if($membersSelectBox[0]) {
                        $membersSelectBox.scrollTop($membersSelectBox[0].scrollHeight);
                    }
                }
            },

            // 如果想深度自定义controller, 可以在此传入
            showMemberController: null
        }
    }));
});
