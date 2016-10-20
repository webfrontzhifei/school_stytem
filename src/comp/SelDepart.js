/**
 * User: sqchen
 * Date: 14-11-26
 * Time: 上午10:20
 * 选择"修改部门"业务组件
 */

LBF.define('qidian.comp.SelDepart', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        Main = require('qidian.conf.main'),
        Tree = require('qidian.comp.Tree'),
        Panel = require('qidian.comp.Panel'),
        checkForms = require('qidian.sites.mng.org.checkForms'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    var SelDepart = module.exports = Class.inherit({
        /**
         * 选择修改部门业务组件类
         * @param {Object} opts 配置项
            {
                * @param {Object} trigger 触发点
                * @param {String} title 标题
                * @param {String} selectedText 已选择的成员名字或选择多个人之后的统计信息
                * @param {String} type 类型,'edit'是编辑,'add'是添加,缺省是添加
                * @param {Boolean} isInPanel 是否在弹框内显示,缺省是false
                * @param {Boolean} showJob 是否显示职位,缺省是true
                * @param {String} tpl 模板
                events {Object}: 事件
                {
                    * @param {Function} onSelect 选择后点"确定"按钮
                    {
                        * @param {Object} event 事件event
                        * @param {Object} selectedData 当前已选中的部门及职位数据
                    }
                    * @param {Function} onClose 关闭后的事件
                    {
                        * @param {Object} event 事件event
                    }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                trigger: $('body'),
                title: '',
                selectedText: '',
                type: 'add',
                isInPanel: false,
                showJob: true,
                dropdownTpl: [
                    '<div id="dropdownDepartment<%= type + triggerId %>" class="lbf-dropdown-panel" style="width:350px;">',
                    '    <div class="lbf-dropdown-panel-head"><%= title %></div>',
                    '    <a href="javascript:" class="lbf-dropdown-panel-close"></a>',
                    '    <div class="lbf-dropdown-panel-body" style="padding-bottom:0;">',
                    '       <%== dropdownContent %>',
                    '    </div>',
                    '    <div class="lbf-dropdown-panel-foot">',
                    '        <div class="lbf-button lbf-button-primary lbf-button-default lbf-button-normal">确定</div><div class="lbf-button lbf-button-default lbf-button-normal lbf-button-cancel">取消</div>',
                    '    </div>',
                    '</div>'
                ].join(''),
                tpl: [
                    '        <div class="depart-select" id="dropdownDepartmentIn<%= type + triggerId %>">',

                    '            <div class="depart-select-title"  style="display:<%== isInPanel ? \'block\' : \'none\' %>;">',
                    '                <h5><%== selectedText %></h5>',
                    '            </div>',
                    '            <div class="depart-select-title" style="display:none;">',
                    '                <h6>已选择部门</h6>',
                    '                <span class="highlight" data-id="<%= triggerId %>" data-name="<%= selectedName %>" data-idAncestors="<%= idAncestors %>"><%= selectedName %></span>',
                    '            </div>',
                    '            <div class="depart-select-box" style="<%== isInPanel ? \'width:450px;height:350px;margin-bottom:0;\' : \'\' %>">',
                    '               <ul id="dropdownDepartmentTreeContent<% if(type == "add") { %>Add<% } %><%= triggerId %>" class="ztree"></ul>',
                    '            </div>',
                    '            <div class="depart-select-search" style="margin-bottom:20px;<%== isInPanel ? \'display:none;\' : (!showJob ? \'display:none;\' : \'\') %>">',
                    '                <form novalidate>',
                    '                <div class="lbf-text-input">',
                    '                    <input id="dropdownInputJob_<%= triggerId %>" value="<%= job %>" maxlength="30"><label class="lbf-text-input-placeholder">职位</label>',
                    '                </div>',
                    '                </form>',
                    '            </div>',
                    '        </div>'
                ].join(''),
                events: {
                }
            }, opts),
            that = this;

            this.trigger = opts.trigger;
            this.title = opts.title;
            this.selectedText = opts.selectedText;
            this.type = opts.type;
            this.isInPanel = opts.isInPanel;
            this.panel = null;
            this.showJob = opts.showJob;
            this.defaultJob = '公司职员';
            this.dropdownTpl = opts.dropdownTpl;
            this.tpl = opts.tpl;
            this.tree = null;
            this.dropdownSelDepart = null;
            
            this.events = opts.events;

            this.selDepart();

            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 初始化
         */
        selDepart: function() {
            var that = this,
                triggerPrev = that.type == 'add' ? that.trigger.parent() : that.trigger.prev().prev();

            if(that.isInPanel) {
                that.panel = Panel.panel({
                    title: that.title,
                    content: template(that.tpl)({
                        triggerId: that.trigger.attr('id'),
                        type: that.type,
                        idAncestors: '',
                        selectedName: '',
                        selectedText: that.selectedText,
                        job: that.defaultJob,
                        isInPanel: 1,
                        showJob: that.showJob
                    }),
                    buttons: [{
                        className: 'lbf-button-primary',
                        content: '确定',
                        events: {
                            click: function(event) {
                                var onSelectResult = that.events.onSelect.call(that, event, that.getSelectedData());
                                
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
                    }]
                });

                that.createTree();

                that.panel.buttons[0].addClass('lbf-button-disabled');
            } else {
                var _job = triggerPrev.attr('data-job');

                that.dropdownSelDepart = new Dropdown({
                    trigger: that.trigger,
                    content: template(that.dropdownTpl)({
                        dropdownContent: template(that.tpl)($.extend({
                            triggerId: triggerPrev.attr('data-id'),
                            type: that.type,
                            idAncestors: triggerPrev.attr('data-idAncestors'),
                            showJob: that.showJob
                        }, that.type == 'add' ? {
                            selectedName: '',
                            job: that.defaultJob
                        } : {
                            selectedName: triggerPrev.attr('data-name'),
                            job: _job && _job.length ? _job : that.defaultJob
                        })),
                        triggerId: triggerPrev.attr('data-id'),
                        type: that.type,
                        title: that.title ? that.title : (that.type == 'add' ? '添加部门/职位' : '修改部门/职位')
                    }),
                    events: {
                        open: function() {
                            that.createTree();
                            
                            //让Dropdown遇到边界时贴边显示
                            Main.adjustDropdownPos(this.$el, that.trigger);
                        }
                    }
                });

                Main.dropdownInDialog.push(that.dropdownSelDepart);

                var inputs = checkForms([
                    {
                        id: 'dropdownInputJob_' + triggerPrev.attr('data-id'),
                        fn: 'jobName'
                    }
                ]);

                $('#dropdownDepartment' + that.type + that.trigger.parent().attr('data-id') + ' .lbf-button-primary').unbind('click').click(function(event) {
                    var onSelectResult;

                    for(var i = 0, l = inputs.length; i < l; i++) {
                        if(inputs[i].validate() != '') {
                            inputs[i].focus();
                            return; 
                        }
                    }

                    onSelectResult = that.events.onSelect.call(that, event, that.getSelectedData());

                    if(!onSelectResult) {
                        that.dropdownSelDepart.close();
                    }
                });

                $('#dropdownDepartment' + that.type + that.trigger.parent().attr('data-id') + ' .lbf-dropdown-panel-close, ' + '#dropdownDepartment' + that.type + that.trigger.parent().attr('data-id') + ' .lbf-button-cancel').unbind('click').click(function(event) {
                    that.dropdownSelDepart.close();
                });

                $('#dropdownDepartment' + that.type + that.trigger.parent().attr('data-id') + ' .range-select-selected').unbind('click').click(function(event) {
                    var target = $(event.target);

                    if(target.hasClass('icon-shut-s')) {
                        target.parent().remove();
                    }
                });
            }
        },

        /**
         * 创建树
         */
        createTree: function() {
            var that = this;

            if(!that.tree) {
                that.tree = new Tree({
                    containerId: that.isInPanel ? ('dropdownDepartmentTreeContent' + that.trigger.attr('id')) : ('dropdownDepartmentTreeContent' + (that.type == 'add' ? 'Add' : '') + that.trigger.parent().attr('data-id')),     //树容器id
                    showOrgOnly: true,
                    setting: {
                        edit: {
                            enable: false,              //树可以编辑，包括拖拽、删除等，省略为不可编辑
                            showRenameBtn: false,        //显示节点右侧操作按钮，省略为不显示
                            showDeleteBtn: false        //显示节点右侧删除按钮，关联于showRenameBtn
                        },
                        callback: {
                            onClick: function(event, treeId, treeNodes, clickFlag) {
                                var _dom = $('#' + (that.isInPanel ? 'dropdownDepartmentIn' : 'dropdownDepartment') + that.type + (that.isInPanel ? that.trigger.attr('id') : that.trigger.parent().attr('data-id')) + ' .highlight');

                                _dom
                                .text(treeNodes.name)
                                .attr({
                                    'data-id': treeNodes.id,
                                    'data-name': treeNodes.name,
                                });

                                if(that.isInPanel) {
                                    that.panel.buttons[0].removeClass('lbf-button-disabled');
                                }
                            }
                        }
                    },
                    events: {
                        //树创建完成后的事件回调函数
                        onCreate: function() {
                            if(!that.events.onCreate) {
                                if(!that.isInPanel) {
                                    var elHighlight = $('#dropdownDepartment' + that.type + that.trigger.parent().attr('data-id') + ' .highlight'),
                                        _orgids = elHighlight.attr('data-idAncestors'),
                                        _orgidsArr = _orgids ? _orgids.split(',') : [];

                                    if(_orgidsArr.length > 1) {
                                        that.tree.expandNodeAncestors({
                                            orgids: [_orgidsArr.slice(0, _orgidsArr.length - 1)]
                                        });
                                        that.tree.expandNodeAncestorsComplete = function() {
                                            that.tree.tree.selectNode(that.tree.tree.getNodeByParam('id', _orgidsArr[_orgidsArr.length - 1]));
                                        };
                                    } else if(_orgidsArr.length == 1) {
                                        that.tree.tree.selectNode(that.tree.tree.getNodeByParam('id', _orgidsArr[0]));
                                    } else {
                                        var triggerId = that.trigger.prev().prev().attr('data-id');
                                        if(triggerId) {
                                            setTimeout(function() {
                                                that.tree.tree.selectNode(that.tree.tree.getNodeByParam('id', triggerId));
                                            }, 400);     
                                        }
                                    }
                                }
                            } else {
                                that.events.onCreate.apply(that, arguments);
                            }
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
        },

        /**
         * 获取已选择的节点数据
         */
        getSelectedData: function() {
            var selectedEl = $('#' + (this.isInPanel ? 'dropdownDepartmentIn' : 'dropdownDepartment') + this.type + (this.isInPanel ? this.trigger.attr('id') : this.trigger.parent().attr('data-id')) + ' .highlight'),
                selectedData = {
                    id: selectedEl.attr('data-id'),
                    name: selectedEl.attr('data-name'),
                    job: $('#' + (this.isInPanel ? 'dropdownDepartmentIn' : 'dropdownDepartment') + this.type + (this.isInPanel ? this.trigger.attr('id') : this.trigger.parent().attr('data-id'))).find('.lbf-text-input input').val()
                };

            return selectedData;
        },

        /**
         * remove
         */
        remove: function() {
            this.dropdownSelDepart.remove();
        }
    });



    /**
     * 类的静态属性
     */
    SelDepart.include($.extend(true, {
        
    }));
});
