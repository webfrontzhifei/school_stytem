/**
 * User: sqchen
 * Date: 14-11-11
 * Time: 上午10:20
 * 组织架构树
 */

LBF.define('qidian.comp.Tree', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        Main = require('qidian.conf.main'),
        REST = require('qidian.comp.REST'),
        Panel = require('qidian.comp.Panel'),
        zTree = require('ui.widget.ZTree.ZTree');

    var BigTree = module.exports = Class.inherit({
        /**
         * 大容量版本树生成类
         * @param {Object} opts 配置项
            {
                * @param {String} containerId 树组件容器Id
                * @param {Object} cgi
                {
                    * @param {String} getOrgTreeNodes 获取组织节点
                    * @param {String} getOrgAndUserTreeNodes 获取组织节点和成员节点
                }
                * @param {Boolean} isHrtxCgiCrossDomain 是否跨域请求
                * @param {String} permission_id 权限值，如果传了的话，且id==0，则只返回对应管理范围的记录。组织架构：0x00000040，信息监控：0x000000100 广播：0x00001000
                * @param {Number} show_dis 是否显示已停用帐号,值为1是显示,0或缺省时为不显示
                * @param {Number} show_del 是否显示已删除帐号,值为1是显示,0或缺省时为不显示
                * @param {Number} show_rec 是否显示帐号回收站,值为1是显示,0或缺省时为不显示
                * @param {Boolean} showOrgOnly 是否只显示组织节点,默认为false
                * @param {Boolean} isHideParentErr 搜索时获取不到父组织id是否隐藏提示，默认为不隐藏
                * @param {Object} setting 树组件初始化配置项
                * @param {Array} data 树数据
                * @param {Object} events 事件
                {
                    * @param {Function} onCreate 树创建完成后的事件回调函数
                    * @param {Function} onSelect 自动展开并自动选择某节点后的事件回调函数
                    {
                        * @param {Object} event 事件event
                        * @param {Object} node 当前树节点
                    }
                    * @param {Function} onAddNode 点"节点的添加图标"的事件回调函数
                    {
                        * @param {Object} event 事件event
                        * @param {Object} node 当前树节点
                    }
                    * @param {Function} onEditNode 点"节点的编辑图标"的事件回调函数
                    {
                        * @param {Object} event 事件event
                        * @param {Object} node 当前树节点
                    }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                containerId: '',
                //默认拉取该节点的"直属成员+直属组织"
                cgi: {
                    getOrgTreeNodes: '/mng/org/getOrgTreeNodes',
                    getOrgAndUserTreeNodes: '/mng/org/getOrgAndUserTreeNodes'
                },
                isHrtxCgiCrossDomain: false,
                setting: {
                    view: {
                        selectedMulti: false,
                        showLine: false,
                        //expandSpeed: 'normal',
                        showIcon: function(treeId, treeNode) {
                            return !treeNode.isParent;
                        },
                        addDiyDom: function(treeId, treeNode) {
                            var spaceWidth = 15,
                                switchObj = $("#" + treeNode.tId + "_switch"),
                                icoObj = $("#" + treeNode.tId + "_ico"),
                                parentNode;

                            switchObj.remove();
                            icoObj.before(switchObj);

                            if(treeNode.level >= 1) {
                                var spaceStr;
                                parentNode = treeNode.getParentNode();
                                spaceStr = "<span id='" + treeNode.tId + "_ico_before' class='tree_ico_before" + (parentNode && parentNode.manager_uin == treeNode.id ? " tree_ico_leader" : "") + "' style='width:" + (spaceWidth * treeNode.level)+ "px;'>&nbsp;</span>";

                                switchObj.before(spaceStr);
                            }
                        },
                        addHoverDom: function(treeId, treeNode) {
                            var aObj = $('#' + treeNode.tId + '_a'), linksStr = '',
                                _this = this,
                                _isParent = treeNode.isParent || treeNode.children;

                            aObj.find('.edit').hide();

                            if(that.setting.edit.showRenameBtn) {
                                if($('#treeBtnCtrlRight_' + treeNode.id)[0]) {
                                    return;
                                }
                                
                                linksStr = '<span id="treeBtnCtrlRight_' + treeNode.id + '" class="tree_btn_right">'
                                    + (_isParent && treeNode.level != 0 ? '<span type="button" class="icon-mng-edit-disable" id="treeBtnCtrlEdit_' + treeNode.id + '" title="编辑部门"></span>' : '')
                                    + (_isParent ? '<span type="button" class="icon-mng-create-org-disable" id="treeBtnCtrlAdd_' + treeNode.id + '" title="创建部门"></span>' : '')
                                    + '</span>';

                                aObj.append(linksStr);

                                that.resetRightIcon();

                                //"编辑"图标
                                $('#treeBtnCtrlEdit_' + treeNode.id).bind('mouseover', function() {
                                    $(this).addClass('icon-mng-edit');
                                }).bind('mouseout', function() {
                                    $(this).removeClass('icon-mng-edit');
                                }).click(function(event) {
                                    that.events.onAddNode.call(that, event, treeNode);
                                });

                                //"添加"图标
                                $('#treeBtnCtrlAdd_' + treeNode.id).bind('mouseover', function() {
                                    $(this).addClass('icon-mng-create-org');
                                }).bind('mouseout', function() {
                                    $(this).removeClass('icon-mng-create-org');
                                }).click(function(event) {
                                    that.events.onAddNode.call(that, event, treeNode);
                                });
                            }
                        },
                        removeHoverDom: function(treeId, treeNode) {
                            $('#treeBtnCtrlRight_' + treeNode.id).unbind().remove();
                        }
                    },
                    data: {
                        keep: {
                            parent: true,
                            leaf: true
                        },
                        key: {
                            name: 'cname'
                        }
                    },
                    edit: {
                        enable: false,
                        showRemoveBtn: false,
                        showRenameBtn: false,
                        showDeleteBtn: true
                    },
                    async: $.extend({
                        enable: true,
                        url: function(treeId, treeNode) {
                            var appId = typeof hrtxAppId != 'undefined' ? hrtxAppId : '',
                                companyId = typeof hrtxCompanyId != 'undefined' ? hrtxCompanyId : '',
                                _url = that.showOrgOnly != 'undefined' && that.showOrgOnly ? that.cgi.getOrgTreeNodes : that.cgi.getOrgAndUserTreeNodes;

                            return _url + '?' + 'id=' + treeNode.id + (that.recursive == 1 ? '&recursive=1' : '') + (appId != '' ? '&appId=' + appId : '') + (companyId != '' ? '&companyId=' + companyId : '') + '&t=' + new Date().getTime();
                        },
                        type: 'GET',
                        dataFilter: function(treeId, parentNode, childNodes) {
                            return that.transformIcon(childNodes.list);
                        }
                    }, typeof isHrtxCgiCrossDomain != 'undefined' && isHrtxCgiCrossDomain ? {
                        dataType: 'jsonp',
                        jsonp: 'jsonpCallback'
                    } : {}),
                    callback: {
                        onExpand: function(event, treeId, treeNode) {
                            that.resetWidth();
                            that.resetRightIcon();
                        },
                        onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
                            var spaceWidth = 15,
                                domTreeNodes = $('#' + treeNodes[0].tId + '_ico_before');

                            domTreeNodes.css('width', spaceWidth * treeNodes[0].level + 'px');

                            that.tree.refresh();

                            that.resetWidth();
                            that.resetRightIcon();
                        },
                        beforeAsync: function(treeId, treeNode) {
                            //如果该组织节点下的一级组织个数和直属成员数都为0,则不再拉取数据
                            if(treeNode.membersTotal + treeNode.orgsTotal <= 0) {
                                return false;
                            }
                        },
                        onAsyncSuccess: function(event, treeId, treeNode) {
                            var tree = that.tree, curNode;

                            ////Hrtx.ajaxDataInit.apply(this, arguments);

                            if(that.isFromSearch) {
                                if(that.parentNodes.length) {
                                    curNode = tree.getNodeByParam('id', that.parentNodes.shift());
                                    if(curNode) {
                                        tree.expandNode(curNode, true);
                                        if(curNode.zAsync) {
                                            arguments.callee();
                                        }
                                    }
                                } else {
                                    //各级展开之后，定位到末级节点上，优先定位末级成员节点，然后是组织节点
                                    //curNode = tree.getNodeByParam('id', that.searchNodeId) || tree.getNodeByParam('id', that.lastNodeId);
                                    curNode = tree.getNodeByParam('id', that.searchNodeId);
                                    //为实例化时配置项onSelect提供回调
                                    if(curNode) {
                                        setTimeout(function() {
                                            tree.selectNode(curNode);
                                            that.events.onSelect.call(that, event, curNode);  
                                        }, 100);
                                    }

                                    that.lastNodeId = that.searchNodeId = '';
                                    ////Hrtx.pageLoading.hide();
                                    that.isFromSearch = false;

                                    setTimeout(function() {
                                        that.expandNodeAncestorsComplete.call(that);
                                    }, 300);
                                }
                            }

                            that.resetWidth();
                            that.resetRightIcon();
                        }
                    }
                },
                //值为1时表示membersTotal值是递归总数
                recursive: 0,
                permission_id: 0x00000040,
                show_dis: 0,
                show_del: 0,
                show_rec: 0,
                showOrgOnly: false,
                isHideParentErr: false,
                data: {
                    "id": 1,
                    "name": "根节点",
                    "isParent": 1
                },
                events: {
                    onCreate: function() {},
                    onSelect: function(event, node) {},
                    onAddNode: function(event, node) {},
                    onDeleteNode: function(event, node) {}
                }
            }, opts),
            that = this;

            this.containerId = opts.containerId;
            this.container = $('#' + opts.containerId);
            //onAsyncSuccess回调时,判断是否从搜索触发，用于区别于手工点击触发的情况
            this.isFromSearch = false;
            //搜索时,某节点对应的全部各级祖先节点id
            this.parentNodes = [];
            //搜索时,组织链最末级别组织节点id
            this.lastNodeId = '';
            //搜索时的成员id
            this.searchNodeId = '';
            this.isHrtxCgiCrossDomain = opts.isHrtxCgiCrossDomain;
            this.cgi = opts.cgi;
            this.setting = opts.setting;
            this.data = opts.data;
            this.recursive = opts.recursive;
            this.permission_id = opts.permission_id;
            this.show_dis = opts.show_dis;
            this.show_del = opts.show_del;
            this.show_rec = opts.show_rec;
            this.showOrgOnly = opts.showOrgOnly;
            this.isHideParentErr = opts.isHideParentErr;
            this.tree = opts.tree;
            //搜索拥有多组织成员时，是否弹框让用户选择进入哪个组织
            this.selectForSearchMemberWithMultiOrgs = opts.selectForSearchMemberWithMultiOrgs || false;
            this.events = opts.events;

            this.create();
            
            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 获取某组织节点下的直属成员和直属组织请求
         * @param {Number} nId 父组织id 
         * @param {Function} fOnSuccess 成功后的回调
         */
        getNodesRequest: function(nId, fOnSuccess) {
            REST.read($.extend({
                url: this.showOrgOnly != 'undefined' && this.showOrgOnly ? this.cgi.getOrgTreeNodes : this.cgi.getOrgAndUserTreeNodes,
                data: $.extend({
                    id: nId || ''
                }, typeof this.permission_id != 'undefined' ? {
                    permission_id: this.permission_id
                } : {}, typeof this.show_dis != 'undefined' ? {
                    show_dis: this.show_dis
                } : {}, typeof this.show_del != 'undefined' ? {
                    show_del: this.show_del
                } : {}, typeof this.show_rec != 'undefined' ? {
                    show_rec: this.show_rec
                } : {}, this.recursive == 1 ? {
                    recursive: 1
                } : {}, typeof hrtxAppId != 'undefined' ? {
                    appId: hrtxAppId
                } : {}, typeof hrtxCompanyId != 'undefined' ? {
                    companyId: hrtxCompanyId
                } : {}),
                success: function(data) {
                    fOnSuccess && fOnSuccess(data);
                },
                error: function(e) {
                    Panel.alert({
                        title: '提示',
                        content: e.message
                    });
                }
            }, typeof this.isHrtxCgiCrossDomain != 'undefined' && this.isHrtxCgiCrossDomain ? {
                dataType: 'jsonp',
                jsonp: 'jsonpCallback'
            } : {}));
        },
        /**
         * 转换图标路径
         * @param {Array} aData 需要转换的节点数据
         */
        transformIcon: function(aData) {
            var treeIcons = Main.treeIcons;
            
            for(var i = 0, l = aData.length; i < l; i++) {
                if(aData[i].isParent) {
                    aData[i].cname = aData[i].name;
                } else {
                    aData[i].icon = Main.treeIcons[aData[i].icon];
                }
            }
            
            return aData;
        },
        /**
         * 生成树
         */
        create: function() {
            var that = this;
            
            that.getNodesRequest('0', function(data) {
                that.data = data.list;
                if(that.data[0] && that.data[0].isRoot == 1 && that.data.length == 1) {
                    $.fn.zTree.init(that.container, that.setting, that.transformIcon(that.data));
                    that.tree = $.fn.zTree.getZTreeObj(that.containerId);
                    that.events.onCreate && that.events.onCreate(that.tree, that.data[0].id, data);
                    that.resetWidth();
                    that.resetRightIcon();
                    that.tree.expandNode(that.tree.getNodes()[0], true);
                } else {
                    that.tree = $.fn.zTree.init(that.container, that.setting, that.transformIcon(that.data));
                    that.events.onCreate && that.events.onCreate(that.tree);
                }
            });
        },

        /**
         * 重新设置树容器的宽度
         */
        resetWidth: function() {
            var _width,
                _container = this.container,
                _containerParent = _container.parent();

            _width = _container[0].scrollWidth;

            //ie7 fix
            if(!document.querySelector) {
                _container.css({
                    width: _width
                });
            }

            if(_containerParent.css('position') == 'static') {
                _containerParent.css({
                    position: 'relative'
                });
            }

            _containerParent.css({
                overflow: 'auto'
            });
        },
        /**
         * 重新设置右侧操作图标位置
         */
        resetRightIcon: function() {
            var widthFix = 0,
                _container = this.container,
                btnRight = _container.find('.tree_btn_right'),
                treeContent = _container.parent();

            for(var i = 0, l = btnRight.length; i < l; i++) {
                $(btnRight[i])
                .css('right', - treeContent[0].scrollLeft)
                .css('top', $(btnRight[i]).parent().offset().top + treeContent[0].scrollTop - treeContent.offset().top);
            }
        },
        /**
         * 逐级展开成员的所有祖先节点
         * @param {Object} oData 搜索的节点数据
         * @param {Function} onNoParent 没有上级组织链条情况下的回调
         */
        expandNodeAncestors: function(oData, onNoParent) {
            var that = this,
                nId = typeof oData.uin != 'undefined' ? oData.uin : oData.id,
                //lists保存的是该成员的所有组织链id
                lists = oData.orgids,
                //names保存的是该成员的所有组织链名称
                names = oData.orgnames,
                needExpandIndex = 0,
                tree = that.tree,
                curNode,
                /**
                 * 根据list来展开组织节点, 此方法只会展开一层，另外展开方法写在tree方法的回调处 见225行 onAsyncSuccess 方法
                 * @param list
                 * @example list = [1, 123123, 123123123]
                 */
                getSelectOrgChain = function(list) {
                    //查找树上是否已经存在最末级节点，或者是属于在非全量树的情况（该情况下父组织链上第一个肯定不是根节点1）。符合条件则开始异步去展开各级别组织
                    if(!tree.getNodeByParam('id', list[list.length - 1]) || (tree.getNodes()[0].isRoot != 1 && tree.getNodeByParam('id', list[list.length - 1]) && !tree.getNodeByParam('id', list[list.length - 1]).zAsync)) {
                        ////Hrtx.pageLoading.show();

                        for(var i = 0, l = list.length; i < l; i++) {
                            if(!tree.getNodeByParam('id', list[i])) {
                                needExpandIndex = i;
                                break;
                            }
                        }

                        list.splice(0, needExpandIndex - 1);

                        that.parentNodes = list;
                        that.lastNodeId = that.parentNodes[that.parentNodes.length - 1];
                        that.searchNodeId = nId;
                        tree.expandNode(tree.getNodeByParam('id', that.parentNodes[0]), true);
                    } else {
                        //树上已经存在最末级节点，则优先展开当前搜索的成员节点，没有找到则取组织链最末级节点
                        curNode = tree.getNodeByParam('id', nId) || tree.getNodeByParam('id', list[list.length - 1]);

                        //如果该节点是组织并且还没展开过
                        if(curNode.isParent && !curNode.zAsync) {
                            for(var i = 0, l = list.length; i < l; i++) {
                                if(list[i] == curNode.id) {
                                    needExpandIndex = i;
                                    break;
                                }
                            }

                            list.splice(0, needExpandIndex - 1);

                            that.parentNodes = list;
                            that.lastNodeId = that.parentNodes[that.parentNodes.length - 1];
                            that.searchNodeId = nId;
                            tree.expandNode(curNode, true);
                            return;
                        }

                        setTimeout(function() {
                            tree.selectNode(curNode);
                        }, 100);

                        that.events.onSelect.call(that, null, curNode);
                        ///Hrtx.pageLoading.hide();
                        that.isFromSearch = false;
                    }
                };

            that.isFromSearch = true;

            if(!lists[0] || !lists[0].length) {
                if(!that.isHideParentErr) {
                    Panel.alert({
                        title: '提示',
                        content: '获取成员父组织失败，请重试！'
                    });
                }

                onNoParent && onNoParent(data);
                return false;
            }

            //在非全量树的情况,即无根节点情况下,需要把前边不存在的节点剔除
            $.each(lists, function(index, item) {
                if(tree.getNodes()[0].isRoot != 1) {
                    while(item.length) {
                        if(!tree.getNodeByParam('id', item[0])) {
                            item.splice(0, 1);
                            //同时对name进行处理, name保存的是id对应的组织名
                            if(names[index]) {
                                names[index].splice(0, 1);
                            }
                        } else {
                            break;
                        }
                    }
                }
            });

            //该成员只有一条组织链，即只属于一个组织, super hard code
            if(lists.length == 1 || that.selectForSearchMemberWithMultiOrgs === false) {
                getSelectOrgChain(lists[0]);
            } else {
                var tpl = [
                    '<div class="dialog-select-multi-orgs">',
                    '   <h3>该成员拥有多组织，请选择需要查看的组织</h3>',
                    '   <select id="selectMultiOrgs" class="select-multi-orgs">',
                    '       $options',
                    '   </select>',
                    '</div>',
                    '<div class="ui_confirm_btn_box">',
                    '   <button id="selectMultiOrgsBtnYes" class="ui_confirm_btn_yes">确定</button>',
                    '   <button id="selectMultiOrgsBtnNo" class="ui_confirm_btn_no">取消</button>',
                    '</div>'
                ].join(''),
                    options = '';

                //生成需要插入select (id=selectMultiOrgs)的字符串
                $.each(names, function(index, item) {
                    options += '<option value="' + index + '" title="' + item.join(' > ') + '">' + item[item.length - 1] + '</option>';
                });

                //有多组织，即弹框显示出多组织，让用户选择进行哪个组织查询该成员
                var multiOrgsSelect = $.UI.Dialog.init({
                    title: '提示',
                    content: tpl.replace('$options', options),
                    width: 420,
                    height: 200
                });

                //绑定“确定”事件
                $('#selectMultiOrgsBtnYes')
                    .unbind('click')
                    .bind('click', function(){
                        var index = parseInt($('#selectMultiOrgs').val(), 10),
                            list = lists[index];
                        getSelectOrgChain(list);
                        multiOrgsSelect.hide();
                });

                $('#selectMultiOrgsBtnNo')
                    .unbind('click')
                    .bind('click', function() {
                        multiOrgsSelect.hide();
                    });
            }
        },
        /**
         * 逐级展开成员的所有祖先节点-完成之后
         * @param {Function} onComplete 完成之后的回调
         */
        expandNodeAncestorsComplete: function(onComplete) {
            onComplete && onComplete();
        }
    });

    /**
     * 类的静态属性
     */
    BigTree.include($.extend(true, {

    }));
});
