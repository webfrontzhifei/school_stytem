/**
 * User: sqchen
 * Date: 14-11-25
 * Time: 上午10:20
 * 分页器列表组件
 */

LBF.define('qidian.comp.SelQQ', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        Main = require('qidian.conf.main'),
        REST = require('qidian.comp.REST'),
        template = require('util.template'),
        xssFilter = require('util.xssFilter'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        Pagination = require('ui.widget.Pagination'),
        TextInput = require('ui.Nodes.TextInput'),
        ICheckbox = require('ui.widget.ICheckbox.ICheckbox');

    var SelQQ = module.exports = Class.inherit({
        /**
         * 选择企点帐号业务组件类
         * @param {Object} opts 配置项
            {
                * @param {Object} trigger 触发点
                * @param {String} cgi 拉取列表数据的cgi
                * @param {Object} postData 请求的数据
                * @param {Number} itemsPerPage 缺省每页显示的行数
                * @param {Object} tpl {Object} 模板
                {
                    * @param {String} list 列表的html模板
                    * @param {String} pagination 分页器的html模板
                }
                events {Object}: 事件
                {
                    * @param {Function} onSelect 选择某号码后点"确定"按钮
                    {
                        * @param {Object} event 事件event
                        * @param {Number} num 选择的号码
                    }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                trigger: $('body'),
                cgi: '',
                postData: {},
                itemsPerPage: 16,
                tpl: {
                    list: [
                        '<div id="dropdownNumber" class="lbf-dropdown-panel" style="width:440px;">',
                        '    <div class="lbf-dropdown-panel-head">选择企点帐号</div>',
                        '    <a href="javascript:" class="lbf-dropdown-panel-close"></a>',
                        '    <div class="lbf-dropdown-panel-body" style="min-height:50px;padding-bottom:0;">',
                        '        <div class="numbers-select">',
                        //'            <div class="numbers-select-search">',  //需求变更,只显示3个可选的号,所以搜索暂时隐藏掉
                        '            <div class="numbers-select-search" style="display:none;">',
                        '                <div class="lbf-text-input lbf-search-input lbf-autocomplete-input">',
                        '                   <a href="javascript:"><i class="icon-search">搜索</i></a>',
                        '                    <input id="dialogSelQQText"><label class="lbf-text-input-placeholder">输入企点帐号</label>',
                        '                </div>',
                        '            </div>',
                        '            <div class="numbers-select-box">',
                        '            <div class="g_table_loading" style="display:none;"><span>&nbsp;</span>加载中</div>',
                        '            <div class="no_result" style="display:none;">暂无记录</div>',
                        '            </div>',
                        //'            <div class="numbers-select-page">',  //需求变更,只显示3个可选的号,所以分页暂时隐藏掉
                        '            <div class="numbers-select-page" style="display:none;">',
                        '                <div class="pagination"></div>',
                        '            </div>',
                        //'            <div>',  //需求变更,只显示3个可选的号,所以分页暂时隐藏掉
                        '            <div style="display:none;">',  
                        '                <div class="numbers-select-check">',
                        '                    <div class="lbf-icheckbox"><input type="checkbox" id="selQQShowAllow" checked></div>',
                        '                    <label for="selQQShowAllow">仅显示可用号码</label>',
                        '                </div>',
                        '            </div>',
                        '        </div>',
                        '    </div>',
                        /*'    <div class="lbf-dropdown-panel-foot">',
                        '        <div class="lbf-button lbf-button-primary lbf-button-default lbf-button-normal" id="dropdownNumberOK">确定</div>',*/
                        '    </div>',
                        '</div>'
                    ].join(''),
                    pagination: [
                        '<% var ahead = Math.min(Math.round((maxDisplay - 1) / 2), page - 1);%>',
                        '<% var after = Math.min(maxDisplay - 1 - ahead, total - page);%>',
                        '<% ahead = Math.max(ahead, maxDisplay - 1 - after)%>',
                        '<div class="lbf-pagination">',
                            '<ul class="lbf-pagination-item-list">',
                            
                                //is show first button
                                '<% if(isShowFirst) { %>',
                                    '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-first <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==firstText%></a></li>',
                                '<% } %>',
                                
                                //prev button
                                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-prev <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==prevText%></a></li>',
                                
                                //next ellipsis
                                '<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==page%>/<%==endPage%></span></li>',
                                
                                //next button
                                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-next <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==nextText%></a></li>',
                                
                                //is show last button
                                '<% if(isShowLast) { %>',
                                    '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-last <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==lastText%></a></li>',
                                '<% } %>',
                            '</ul>',
                        '</div>'
                    ].join('')
                },
                events: {
                }
            }, opts),
            that = this;

            this.trigger = opts.trigger;
            this.cgi = opts.cgi;
            this.postData = opts.postData;
            this.itemsPerPage = opts.itemsPerPage;
            this.tpl = opts.tpl;
            this.dropdownSelMembersQQ = null;

            this.listPagination = null;
            this.listCurrentPage = 0;
            
            this.events = opts.events;

            this.selQQ();
            this.searchQQ();

            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 初始化
         */
        selQQ: function() {
            var that = this;

            that.dropdownSelMembersQQ = new Dropdown({
                trigger: that.trigger,
                content: that.tpl.list,
                events: {
                    open: function() {
                        //让Dropdown遇到边界时贴边显示
                        Main.adjustDropdownPos(that.dropdownSelMembersQQ.$el, that.trigger);
                    }
                }
                /*adjust: {
                    x: that.trigger.width() / 2 - 175,
                    y: 6
                }*/
            });

            Main.dropdownInDialog.push(that.dropdownSelMembersQQ);

            that.drawList(0);
            new TextInput({selector: '#dialogSelQQText'});
            new ICheckbox({
                selector: '#selQQShowAllow',
                events: {
                    check: function() {
                        that.drawList(0, {
                            show_allow_only: 1
                        });
                    },
                    uncheck: function() {
                        that.drawList(0, {
                            show_allow_only: 0
                        });
                    }
                }
            });

            /*$('#dropdownNumberOK').click(function(event) {
                that.events.onSelect.call(that, event, $('#dropdownNumber .numbers-select-box .selected').html());
                that.dropdownSelMembersQQ.close();
            });*/

            $('#dropdownNumber .numbers-select-box').click(function(event) {
                var target = event.target,
                    _this = this;

                if(target.tagName == 'A' && !$(target).hasClass('disabled')) {
                    that.events.onSelect.call(that, event, $(target).text());
                    that.dropdownSelMembersQQ.close();
                }
            });

            $('#dropdownNumber .lbf-dropdown-panel-close').click(function(event) {
                that.dropdownSelMembersQQ.close();
            });
        },
        /**
         * 搜索qq
         */
        searchQQ: function() {
            var that = this,
                dialogSelQQText = $('#dialogSelQQText');

            dialogSelQQText.keyup(function() {
                if(new Date().getTime() - this.getAttribute('data-time') > 100) {
                    that.drawList(0);
                }
                this.setAttribute('data-time', new Date().getTime());
            });
        },
        /**
         * 绘制列表
         * @param {Number} nCurrentPage 页码
         * @param {Object} postData 请求数据, 可选
         */
        drawList: function(nCurrentPage, postData) {
            var total = 1,
                that = this,
                g_table_loading = $('#dropdownNumber .g_table_loading'),
                no_result,
                postData = postData || that.postData;

            no_result = $('#dropdownNumber .no_result');

            (function(current_page) {
                var fn = arguments.callee;
                
                that.clearGridTable();
                no_result.hide();
                g_table_loading.show();
                
                REST.create({
                    url: that.cgi,
                    data: $.extend({
                        keyword: $('#dialogSelQQText').val(),
                        show_allow_only: $('#selQQShowAllow')[0].checked ? 1 : 0,
                        current_page: current_page,
                        items_per_page: 16
                    }, that.postData ? that.postData : {}),
                    success: function(data) {
                        g_table_loading.hide();

                        var lists = data.list,
                            total = +data.total;

                        //将当前请求的数据与当次返回的数据字段比较，防止过快点击树节点导致表格数据不同步
                        that.listCurrentPage = current_page;
                        if(that.listCurrentPage != data.postPage) {
                            return;
                        }
                        
                        if(!that.listPagination) {
                            that.listPagination = new Pagination($.extend({
                                container: $('#dropdownNumber .pagination'),
                                page: current_page + 1,
                                startPage: 1,
                                endPage: Math.ceil(total / that.itemsPerPage),
                                headDisplay: 2,
                                tailDisplay: 2,
                                maxDisplay: 3,
                                prevText: '&lt;上页',
                                nextText: '下页&gt;',
                                tagName: 'span',
                                ellipsis: '...',
                                events: {
                                    'change:page': function(e, page) {
                                        if(page == 1 && !that.listPagination) {
                                            that.listFillData(lists);
                                            that.listDataTotal(total);
                                        } else {
                                            if(that.listPagination.pageCross != 1) {
                                                fn(page - 1, that.listPagination.postData);
                                            } else {
                                                that.listPagination.pageCross = 0;
                                            }
                                        }
                                    }
                                }
                            }, that.tpl.pagination != '' ? {
                                pageTemplate: that.tpl.pagination
                            } : {}));
                        } else {
                            that.listPagination.set({
                                total: Math.ceil(total / that.itemsPerPage),
                                page: current_page + 1
                            });

                            //如果从其他页码跨越式跳转到第1页
                            if(current_page == 0) {
                                that.listPagination.pageCross = 1;
                            }

                            that.listPagination.set('total', total != 0 ? Math.ceil(total / that.itemsPerPage) : 1);
                            that.listPagination.set('endPage', total != 0 ? Math.ceil(total / that.itemsPerPage) : 1);
                            that.listPagination.set('page', +current_page + 1);

                            $('#dropdownNumber .pagination .lbf-pagination .lbf-pagination-next')[Math.ceil(total / that.itemsPerPage) <= 1 || (+current_page + 1 == Math.ceil(total / that.itemsPerPage) && current_page != 0) ? 'addClass' : 'removeClass']('lbf-pagination-disabled');

                            that.listFillData(lists);
                            that.listDataTotal(total);
                        }

                        that.listPagination.pageCross = 0;
                        that.listPagination.postData = postData;
                        
                        if(!lists || !lists.length) {
                            if(current_page == 0) {
                                no_result.show();
                            } else {     //如果不是第1页，而且数据又为空，则再往前跳转一页
                                fn(current_page - 1, that.listPagination.postData);
                            }
                        }
                    },
                    error: function(e) {
                        Panel.alert({
                            title: '提示',
                            content: e.message
                        });
                        that.listCurrentPage = current_page;
                    }
                });
            })(nCurrentPage);
        },
        /**
         * 填充员工列表数据
         * @param {Array} list 数据列表
         */
        listFillData: function(list) {
            var that = this,
                itemsPerPage = that.itemsPerPage,
                area = $('#dropdownNumber .numbers-select-box'),
                htmlArr = [];

            for(var i = 0, l = list.length; i < l; i++) {
                htmlArr.push('<a class="numbers-select-list' + (list[i][1] != 0 ? ' disabled': list[i][0] == $('#addMembersQQ').text() ? ' selected': '') + '" href="javascript:"' + (list[i][1] != 0 ? ' style="color:#aaa;"' : '') + '>' + xssFilter.htmlEncode(list[i][0]) + '</a>');
            }
            htmlArr.push('<i class="numbers-select-list"></i> <i class="numbers-select-list"></i> <i class="numbers-select-list"></i> <i class="numbers-select-list"></i>');

            area.html(!list.length ? '<strong>搜索不到结果</strong>' : htmlArr.join(' '));
        },
        /**
         * 清空员工列表里的数据
         */
        clearGridTable: function() {
            $('#dropdownNumber .numbers-select-box').html('');

            this.listDataTotal(0);
        },
        /**
         * 列表记录统计
         * @param {Number} nTotal 总数
         */
        listDataTotal: function(nTotal) {
            var total = $('#dropdownNumber .table-page-data span');

            total.html(nTotal);
        },

        /**
         * remove
         */
        remove: function() {
            this.dropdownSelMembersQQ.remove();
        }
    });



    /**
     * 类的静态属性
     */
    SelQQ.include($.extend(true, {
        
    }));
});
