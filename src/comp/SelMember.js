/**
 * User: sqchen
 * Date: 14-11-25
 * Time: 上午10:20
 * 选择成员业务组件
 */

LBF.define('qidian.comp.SelMember', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        Main = require('qidian.conf.main'),
        Tree = require('qidian.comp.Tree'),
        OrgTreeSearchInput = require('qidian.comp.OrgTreeSearch'),
        Panel = require('qidian.comp.Panel'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    var SelMember = module.exports = Class.inherit({
        /**
         * 选择企业QQ号业务组件类
         * @param {Object} opts 配置项
            {
                * @param {Object} trigger 触发点
                * @param {Boolean} isInPanel 是否在弹出框展示,默认为false
                * @param {String} title 弹出框title
                * @param {Object} ajaxOptions {Object} 定制搜索ajax的post参数
                * @param {Object} tpl {String} 模板
                events {Object}: 事件
                {
                    * @param {Function} onSelect 选择某号码后点"确定"按钮
                    {
                        * @param {Object} event 事件event
                        * @param {Object} curNode 当前已选中的树节点
                    }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                    trigger: $('body'),
                    isInPanel: false,
                    title: '选择成员',
                    ajaxOptions: {},
                    events: {
                        load: function(){}
                    }
                }, opts),
                tplBody = [
                    '<div class="members-select">',
                    '    <div class="members-select-search">',
                    '        <div class="lbf-text-input lbf-search-input">',
                    '            <a href="javascript:"><i class="icon-search">搜索</i></a>',
                    '            <input onblur="jQuery(this).parent().removeClass(\'lbf-text-input-focus\').next().hide();" onfocus="jQuery(this).parent().addClass(\'lbf-text-input-focus\').next().show();" id="members-select-search">',
                    '         </div>',
                    '         <div class="lbf-autocomplete" style="width:310px;">',
                    '         </div>',
                    '     </div>',
                    '     <div class="members-select-box" style="height:280px;">',
                    '        <ul id="<%= triggerId %>SelMemberTreeContent" class="ztree"></ul>',
                    '     </div>',
                    ' </div>'
                ].join(''),
                tpl = [
                    '<div id="<%= triggerId %>DropdownSelectMemeber" class="lbf-dropdown-panel" style="width:350px;">',
                    '   <div class="lbf-dropdown-panel-head">' + opts.title + '</div>',
                    '    <a href="javascript:" class="lbf-dropdown-panel-close"></a>',
                    '   <div class="lbf-dropdown-panel-body">',
                    tplBody,
                    '    </div>',
                    '    <div class="lbf-dropdown-panel-foot">',
                    '       <div class="lbf-button lbf-button-primary lbf-button-default lbf-button-disabled">确定</div><div class="lbf-button lbf-button-default lbf-button-cancel">取消</div>',
                    '    </div>',
                    '</div>'
                ].join(''),
                that = this;

            this.trigger = opts.trigger;
            this.ajaxOptions = opts.ajaxOptions;
            this.tpl = opts.tpl;
            this.isInPanel = opts.isInPanel;
            this.title = opts.title;
            this.className = opts.className || '';

            if(typeof opts.tpl != 'undefined') {
                this.tpl = opts.tpl;
            } else {
                this.tpl = !this.isInPanel ? tpl : [
                    '<div id="<%= triggerId %>DropdownSelectMemeber">',
                    tplBody,
                    '</div>'
                ].join('');
            }

            this.dropdownSelMember = null;
            this.options = opts;
            
            this.events = opts.events;

            this.selMember();

            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 初始化
         */
        selMember: function() {
            var that = this,
                selMembersTree,
                aOrgTreeSearchInput,
                initAll = function(triggerId) {
                    if(!selMembersTree) {
                        selMembersTree = new Tree({
                            containerId: triggerId + 'SelMemberTreeContent',     //树容器id
                            setting: {
                                edit: {
                                    enable: false,              //树可以编辑，包括拖拽、删除等，省略为不可编辑
                                    showRenameBtn: false        //显示节点右侧操作按钮，省略为不显示
                                },
                                callback: {
                                    beforeClick: function(treeId, treeNode, clickFlag) {
                                        if(treeNode.isParent) {
                                            return false;
                                        }
                                        $('#' + that.trigger.attr('id') + 'DropdownSelectMemeber .lbf-button-primary').removeClass('lbf-button-disabled');
                                    }
                                },
                                data: {
                                    key: {
                                        name: 'name'
                                    }
                                }
                            },
                            events: {
                                //树创建完成后的事件回调函数
                                onCreate: function() {
                                },
                                //自动展开并自动选择某节点后的事件回调函数
                                onSelect: function(event, node) {
                                },
                                //点"节点的添加图标"的事件回调函数
                                onAddNode: function(event, node) {
                                },
                                //点"节点的删除图标"的事件回调函数
                                onDeleteNode: function(event, node) {
                                }
                            }
                        });
                    }


                    //初始化搜索
                    if($('#members-select-search')[0]) {
                        if(!aOrgTreeSearchInput) {
                            aOrgTreeSearchInput = new OrgTreeSearchInput({
                                resultContainer: $('#' + triggerId + 'DropdownSelectMemeber'),
                                selector: '#members-select-search',
                                userSearchUrl: '/mng/org/userSearch',
                                ajaxOptions: that.ajaxOptions,
                                grepRegexp: '(.*)',
                                placeholder: '搜索成员'
                            });
                        }

                        aOrgTreeSearchInput.on('selectOption', function(e, option) {
                            selMembersTree.expandNodeAncestors(option);
                        });
                    }
                };

            if(!that.isInPanel) {
                that.dropdownSelMember = new Dropdown({
                    trigger: that.trigger,
                    //container: that.trigger.parent(),
                    content: template(that.tpl)({
                        triggerId: that.trigger.attr('id')
                    }),
                    events: {
                        open: function() {
                            initAll(that.trigger.attr('id'));

                            //让Dropdown遇到边界时贴边显示
                            Main.adjustDropdownPos(this.$el, that.trigger);
                        }
                    }
                });

                Main.dropdownInDialog.push(that.dropdownSelMember);

                $('#' + that.trigger.attr('id') + 'DropdownSelectMemeber .lbf-button-primary').click(function(event) {
                    if(!$(this).hasClass('lbf-button-disabled')) {
                        that.events.onSelect.call(that, event, selMembersTree.tree.getSelectedNodes()[0]);
                        that.dropdownSelMember.close();
                    }
                });

                $('#' + that.trigger.attr('id') + 'DropdownSelectMemeber .lbf-dropdown-panel-close, ' + '#' + that.trigger.attr('id') + 'DropdownSelectMemeber .lbf-button-cancel').click(function(event) {
                    that.dropdownSelMember.close();
                });
            } else {
                Panel.panel({
                    title: that.title,
                    className: that.className,
                    content: template(that.tpl)({
                        triggerId: 'SelMemberPanel',
                        type: that.type
                    }),
                    buttons: [
                        {
                            className: 'lbf-button-primary',
                            content: '确定<span class="sum">'+(that.isMultiple && that.list.length > 0 ? '('+that.list.length+')' : '')+'</span>',
                            events: {
                                click: function(event) {
                                    var onSelectResult = that.events.onSelect.call(that, event, selMembersTree.tree.getSelectedNodes()[0]);

                                    if(!onSelectResult) {
                                        this.remove();
                                    }
                                }
                            }
                        }, {
                            className: 'lbf-button-link',
                            content: '取消',
                            events: {
                                click: function() {
                                    this.remove();
                                }
                            }
                        }
                    ],
                    events: {
                        load: function(event,panel){
                            that.events.load.call(that, event, panel);
                        }
                    }
                });

                initAll('SelMemberPanel');
            }
        },

        /**
         * remove
         */
        remove: function() {
            this.dropdownSelMember.remove();
        }
    });



    /**
     * 类的静态属性
     */
    SelMember.include($.extend(true, {
        
    }));
});
