/**
 * @overview
 * @author webbwang
 * @create 16-3-6
 */

LBF.define('qidian.comp.StaffListAndSelector', function(require, exports, module){
    var Class = require('lang.Class'),
        $ = require('lib.jQuery'),
        SelMemberList = require('qidian.comp.SelMemberList'),
        Template = require('util.template');

    require('{theme}/comp/StaffListAndSelector/StaffListAndSelector.css');
    require('{theme}/srv/common/icons.css');
    var staffListSelector = module.exports = Class.inherit({
        /**
         * 头像、名字、id组成的员工列表，可以调用工号选择器进行增加和移除
         * @example http://local.qiye.qq.com/mockup/blue/srv/StaffListAndSelector.html
         * @param {Object} selMemberListOpts 工号选择器配置项，不要覆盖onSelect事件
         * @param {Boolean} isGenerateHTML 是否有默认数据通过框架机生成HTML
         * @param {Array} initList 默认数据
         * @param {Object} container 列表父节点
         * @param {String} listTemplate 列表模板
         * @param {String} itemTemplate 列表内单项模板
         * @param {Object} events 事件列表
            {
                * @param {Function} onSelect 调用工号选择器之后
                {
                    * @param {Array} items 当前列表数据
                }
            }
            {
                * @param {Function} onRemove 返回删除项
                {
                    * @param {Array} ids 删除项ID集合
                }
            }
         */
        initialize: function(opts){
            var opts = $.extend(true, {
                selMemberListOpts: {
                    isMultiple: true
                },
                isGenerateHTML: false,
                allowRemove: true,
                initList: [],
                container: $('body'),
                listTemplate: ['<div class="staff-list">',
                    '<ul>',
                    '</ul>',
                    '<a href="javascript:;" class="btn-modify"><span class="line-horizontal"></span><span class="line-vertical"></span></a>',
                    '</div>'].join(''),
                itemTemplate: ['<% for(var i=0, l=items.length;i<l;i++) { %>',
                    '<li data-id="<%=items[i].id%>">',
                        '<div class="item">',
                            '<p class="avatar" title="点击删除">',
                                '<img src="<%=items[i].face || items[i].img%>" width="50" height="50"/>',
                                '<span class="overlay"></span><span class="selected"></span>',
                                '<a href="javascript:;" class="btn-item-remove"><i class="icon-srv-remove"></i></a>',
                            '</p>',
                            '<dl class="info">',
                                '<dt><%=items[i].cname%></dt>',
                                '<dd><%=items[i].ename%></dd>',
                            '</dl>',
                        '</div>',
                    '</li><%}%>'].join(''), 
                events: {}
            }, opts);
            this.selMemberListOpts = opts.selMemberListOpts;
            this.isGenerateHTML = opts.isGenerateHTML; 
            this.allowRemove = opts.allowRemove;
            this.initList = opts.initList;
            this.container = opts.container;
            this.listTemplate = opts.listTemplate;
            this.itemTemplate = opts.itemTemplate;
            this.selected = opts.selected || false;
            this.events = opts.events;
            !this.isGenerateHTML && this.initListDom();
            this.initEvents();


            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 列表DOM初始化
         */
        initListDom: function() {
            var $list = $(Template(this.listTemplate)({}));
            this.initList.length > 0 ? $list.find('ul').html(Template(this.itemTemplate)({items: this.initList})) : '';
            this.container.append($list);
            if(this.selected){
                var $selected = $($list).find('ul li .selected')[0];
                $($selected).show();
            }


        },

        /**
         * 绑定移除事件和呼出员工选择器事件
         */
        initEvents: function() {
            var self = this;
            this.allowRemove && this.container.delegate('.avatar', 'click', function(e) {
                self.onClickBtnRemove(e);
            });
            this.container.delegate('.btn-modify', 'click', function(e) {
                self.invokeSelMemSelector();
            });
        },

        /**
         * 调用员工选择器
         */
        invokeSelMemSelector: function() {
            var self = this,
                oldSelectedIds = self.getSelectedIds(), //已选择项ID
                selMemberListOpts = $.extend(true, {
                    //员工选择器默认配置，注意onSelect事件不要覆盖
                    title: '选择工号',
                    events: {
                        onSelect: function(event, selectedIds, selectedItems) {
                            self.changeListShow(oldSelectedIds, selectedIds, selectedItems);
                        }
                    }
                }, this.selMemberListOpts, {
                    list: oldSelectedIds,
					data: {
						owner: oldSelectedIds[0]
					}
                }),
                selMemberList = new SelMemberList(selMemberListOpts);
        },

        /**
         * 获取已选择项的ID集合
         * @return {Array} 已选择项的ID集合
         */
        getSelectedIds: function() {
            var tmpAray = [];
            if(this.initList.length > 0) {
                for(var i = 0, l = this.initList.length;i<l;i++) {
                    tmpAray.push(this.initList[i].id);
                }
            }
            return tmpAray;
        },

        /**
         * 员工筛选结束后更改列表状态
         * @param  {Array} 筛选前的ID集合
         * @param  {Array} 筛选后的ID集合
         * @param  {Array} 筛选结果集合（包含id, name, icon）
         */
        changeListShow: function(oldIds, newIds, selectedItems) {
            var addIds = this.getAddIds(oldIds, newIds),
                removeIds = this.getRemoveIds(oldIds, newIds);
            //兼容单选数据没有变化的情况
            if(!this.selMemberListOpts.isMultiple && oldIds[0] == newIds[0]) {
                return;
            }
            addIds.length > 0 ? this.addIdsToList(addIds, selectedItems) : '';
            removeIds.length > 0 ? this.removeIdsFromList(removeIds) : '';
            this.events.onSelect && this.events.onSelect.call(this, this.initList);
        },

        /**
         * 获取新增加项ID
         * @param  {Array} 选择前ID集合
         * @param  {Array} 选择后ID结合
         * @return {Array} 新增加项ID集合
         */
        getAddIds: function(oldIds, newIds){
            var addIds = [];
            for(var i = 0, l = newIds.length;i<l;i++) {
                if($.inArray(newIds[i], oldIds) == -1) {
                    addIds.push(newIds[i]);
                }
            }
            return addIds;
        },

        /**
         * 获取被移除项ID
         * @param  {Array} 选择前ID集合
         * @param  {Array} 选择后ID结合
         * @return {Array} 被移除项ID集合
         */
        getRemoveIds: function(oldIds, newIds) {
            var removeIds = [];
            if(this.selMemberListOpts.isMultiple) {
                for(var i = 0, l = oldIds.length;i<l;i++) {
                    if($.inArray(oldIds[i], newIds) == -1) {
                        removeIds.push(oldIds[i]);
                    }
                }
            } else {
                removeIds = oldIds
            }
            return removeIds;
        },

        /**
         * 加入新增加项至列表
         * @param {Array} 新增加项ID集合
         * @param {Array} 员工选中项集合
         */
        addIdsToList: function(addIds, selectedItems) {
            var $list = this.container.find('ul'),
                newItems = [];
            if(!this.selMemberListOpts.isMultiple) {
                this.initList = [];
            }
            for(var i = 0, l = selectedItems.length;i<l;i++) {
                if($.inArray(selectedItems[i].id, addIds) != -1) {
                    newItems.push(selectedItems[i]);
                    this.initList.push(selectedItems[i]);
                }
            }
            $list.prepend(Template(this.itemTemplate)({items: newItems}));
        },

        /**
         * 触发按ID移除列表项
         * @param  {Array} removeIds 被移除项ID集合
         */
        removeIdsFromList: function(removeIds) {
            var self = this,
                $list = this.container.find('li'),
                id;
            $list.each(function() {
                id = $(this).data('id').toString();
                if($.inArray(id, removeIds) != -1) {
                    $(this).remove();
                    self.removeIdsFromData(id);
                }
            });
            //返回被移除项
            this.events.onRemove && this.events.onRemove.call(this, removeIds);
        },

        /**
         * 点击移除触发事件
         * @param  {Object} e 点击事件
         */
        onClickBtnRemove: function(e) {
            var $currentTarget = $(e.currentTarget),
                $item = $currentTarget.parents('li'),
                id = $item.data('id'),
                self = this;
            $item.fadeOut('fast', function() {
                $(this).remove();
                self.removeIdsFromData(id);
                self.events.onSelect && self.events.onSelect.call(self, self.initList);
            });
            //返回被移除项
            this.events.onRemove && this.events.onRemove.call(this, [id]);
        },

        /**
         * 按ID从数据列表中移除
         * @param  {Object} event
         * @param  {String} 某一项的ID
         */
        removeIdsFromData: function(id) {
            for(var i=0,l=this.initList.length;i<l;i++) {
                if(this.initList[i].id == id) {
                    this.initList.splice(i, 1);
                    break;
                }
            }
        }
    });
});