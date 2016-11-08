/**
 * User: sqchen
 * Date: 15-06-10
 * Time: 上午10:20
 * Grid组件
 */

LBF.define('qidian.comp.Grid', function(require, exports, module) {
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        REST = require('qidian.comp.REST'),
        template = require('util.template'),
        Panel = require('qidian.comp.Panel'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        Pagination = require('ui.widget.Pagination'),
        iCheckbox = require('ui.widget.ICheckbox.ICheckbox'),
        LightTip = require('qidian.comp.LightTip'),
        logger = require('qidian.comp.logger');

    var Grid = module.exports = Class.inherit({
        /**
         * 分页器表格组件类
         * @param {Object} opts 配置项
            {
                * @param {String} container 表格父容器选择器
                * @param {String} cgi 拉取表格数据的cgi
                * @param {String} type 拉取表格数据的cgi的请求类型,缺省为post
                * @param {Object} postData 请求的数据
                * @param {Object} initData 本地初始化数据，如果有该参数，则不走cgi请求
                * @param {Number} initDataTotal 可选，如果使用本地初始化数据，但是分页总数则以这个为准，否则以initData.length为准
                * @param {Number} itemsPerPage 缺省每页显示的行数
                * @param {Boolean} hasCheckboxCol 是否有可勾选的第一列
                * @param {Boolean} loadFirstPage 异步拉取数据时,是否拉取第一页,缺省是true
                * @param {String} listName 真分页场景下允许自定义后台返回的'list'字段，缺省为'list'
                * @param {String} totalName 真分页场景下允许自定义后台返回的'total'字段，缺省为'total'
                * @param {String} isBigTable 是否左侧有树的大列表，缺省为true
                * @param {String} isTbodyScroll 是否只在tbody里出现滚动条，缺省为false
                * @param {String} scrollToItem 异步加载时表格自动滚动目标位置参照物
                * @param {Number} scrollOffsetY 表格自动滚动的Y偏移量
                * @param {Object} tpl {Object} 模板
                {
                    * @param {String} table 表格的html模板
                    * @param {String} pagination 分页器的html模板
                }
                events {Object}: 事件
                {
                    * @param {Function} onFillData 填充表格数据
                    {
                        * @param {Array} list 数据列表
                        * @param {Object} table table
                        * @param {Function} callback 对每行做一些额外处理,如每行的iCheckbox渲染等
                    },
                    * @param {Function} onCheck 勾选触发的事件
                    {
                        * @param {Boolean} hadChecked 是否有iCheckbox被勾选
                    }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                container: 'body',
                cgi: '',
                type: 'POST',
                postData: {},
                initData: null,
                initDataTotal: null,
                itemsPerPage: 15,
                hasCheckboxCol: true,
                loadFirstPage: true,
                listName: 'list',
                totalName: 'total',
                isBigTable: true,
                isTbodyScroll: false,
                scrollToItem: null,
                scrollOffsetY: 80,
                tpl: {
                    table: [
                        '<div class="table-content">',
                        '    <div class="table-size">',
                        '        <table class="table table-base">',
                        '            <thead>',
                        '                <tr>',
                        '                    <th class="col-chk"><span></span></th>',
                        '                    <th class="col1"><span></span></th>',
                        '                    <th class="col2"><span></span></th>',
                        '                </tr>',
                        '            </thead>',
                        '            <tbody>',
                        '            </tbody>',
                        '        </table>',
                        '        <div class="table-null"><%== noResult %></div>',
                        '        <div class="table-loading"><s class="loading"></s></div>',
                        '    </div>',
                        '    <div class="table-page">',
                        '        <div class="table-page-data">共<span></span>名成员，每页显示<a href="javascript:" class="table-page-a"><span></span><i class="icon-con-arrow"></i></a></div>',
                        '        <div class="pagination"></div>',
                        '    </div>',
                        '</div>'
                    ].join(''),
                    noResult: '<i class="icon-null-icon"></i><h2 class="article-null-title">无数据</h2>',
                    pagination: ''
                },
                events: {
                }
            }, opts),
            that = this;

            this.container = $(opts.container);
            this.containerId = this.container.attr('id');
            this.cgi = opts.cgi;
            this.type = opts.type;
            this.postData = opts.postData;
            this.initDataTotal = opts.initDataTotal;
            this.localData = opts.initData;   //是否只根据本地数据刷新，不为null的话不发cgi请求
            this.errorField = opts.errorField; //cgi拉取结果中的判断是否出错的字段，如果为null则不验证

            /*if(window.localStorage && localStorage['itemsPerPage_' + this.containerId]) {
                this.itemsPerPage = localStorage['itemsPerPage_' + this.containerId];
            } else {
                this.itemsPerPage = opts.itemsPerPage;
            }*/
            this.itemsPerPage = opts.itemsPerPage;
            
            this.hasCheckboxCol = opts.hasCheckboxCol;
            this.loadFirstPage = opts.loadFirstPage;
            this.listName = opts.listName;
            this.totalName = opts.totalName;
            this.current_page_name = opts.current_page_name || 'current_page';
            this.items_per_page_name = opts.items_per_page_name || 'items_per_page';
            this.isBigTable = opts.isBigTable;
            this.isTbodyScroll = opts.isTbodyScroll;
            this.scrollToItem = opts.scrollToItem ? $(opts.scrollToItem) : null;
            this.scrollOffsetY = opts.scrollOffsetY;
            this.tpl = opts.tpl;
            this.gridTablePagination = null;
            this.gridTableCurrentPage = 0;

            that.pageCountChanged = false;
            this.events = opts.events;
            this.initGrid();

            return this.superclass.prototype.initialize.apply(this, arguments);
        },
        /**
         * 初始化
         */
        initGrid: function() {
            var that = this, loading = that.container.find(".loading");
            
            if(loading.size() == 0 || loading.parent().css("display") == "none") {
                // 如果一开始有loading，初始化状态保留HTML初始控制，JS不额外参与
                if(that.loadFirstPage) {
                    that.container.html(template(that.tpl.table)({
                        noResult: that.tpl.noResult
                    }));
                }
            } else if(that.container.find(".table-null").size() == 0) {
                loading.parent().after($(template(that.tpl.table)({
                    noResult: that.tpl.noResult
                })).find(".table-null"));
            }
            that.ctrlPagination();

            that.gridTablePagination = new Pagination($.extend({
                container: that.container.find('.pagination'),
                page: 1,
                startPage: 1,
                endPage: 1,
                headDisplay: 2,
                tailDisplay: 2,
                maxDisplay: 3,
                prevText: '&lt;上页',
                nextText: '下页&gt;',
                tagName: 'span',
                ellipsis: '...',
                events: {
                    'change:page': function(e, page) {

                        //设置两次请求页码数量偏移量, 可正可负，用于PHP判断向前、向后
                        that.postData['pageOffset'] = page - that.postData['lastRequestPage'] || 0;
                        if(that.pageCountChanged){
                            that.recoverPostData();
                        }

                        //如果传入的本地数据长度与initDataTotal不一样,则会以发送cgi请求的方式去获取
                        if(!that.localData) {
                            setTimeout(function() {
                                that._drawGridTable(page - 1);
                            }, 1);
                        } else {
                            setTimeout(function() {
                                that._drawGridTable(page - 1, that.localData);
                            }, 1);
                        }
                        that.gridTableCurrentPage = page - 1;
                    }
                }
            }, that.tpl.pagination != '' ? {
                pageTemplate: that.tpl.pagination
            } : {},
                that.tpl.paginationOpts || {}
            ));
        },
        
        scrollTo: function(dom){
    		var that = this,
                top = $(dom).offset().top,
    			scrollTop = $(window).scrollTop();
    		
    		//如果当前表头可见，不需要滚动
    		if(top >= scrollTop){
    			return;
    		}
    		
    		$($.browser.safari || $.browser.chrome || document.compatMode == 'BackCompat' ? document.body : document.documentElement).animate({
	            scrollTop: top - that.scrollOffsetY
	        }, 200);
    	},

        /**
         * 绘制列表，私有方法
         * @param {Number} nCurrentPage 页码
         * @param {Object} localData 绘制数据, 如果有这个数据传入，则不走cgi拉取新数据，可选
         */
        _drawGridTable: function(nCurrentPage, localData) {
            var total = 1,
                that = this,
                g_table_loading = that.container.find('.table-loading'),
                no_result;
                
            that.scrollTo(that.scrollToItem || that.container.find("table"));

            if(that.container.find('.table-null')[0]) {
                no_result = that.container.find('.table-null');
            }

            var container = that.container.find('.table-size')[0];

            if(that.loadFirstPage) {
            	that.refreshOuterHeight();
                no_result.hide();
                that.clearGridTable();
                g_table_loading.show();
                if(container) {
                    var heightContainer = container.style.height;
                    if (heightContainer) {
                        g_table_loading.height(parseInt(heightContainer) - 50);
                    } else {
                        // 如果没有style高度值，为初始态，需要高度赋值，以触发loading完毕后transition动画
                        if(!that.isTbodyScroll) {
                            that.funTransitionHeight(container);
                        }
                    }
                }
            } else {
                if(typeof history.pushState == "function" && container) {
                    var height = window.getComputedStyle(container).height;
                    container.style.height = height;
                }
            }

            if(!localData) {
                if(that.loadFirstPage) {
                    g_table_loading.show();
                    
                    var postingData = $.extend({}, that.postData);
                    
                    postingData[that.current_page_name] = nCurrentPage;
                    postingData[that.items_per_page_name] = that.itemsPerPage;

                    REST[that.type.toLowerCase() == 'post' ? 'create' : 'read']({
                        url: that.cgi,
                        data: postingData
                    }).done(function(data) {
                        g_table_loading.hide();

                        var lists = data[that.listName],
                            total = data[that.totalName],
                            ret = data[that.errorField] || 0;

                        //拉取CGI返回出错触发事件
                        if(ret != 0) {
                            that.clearGridTable();
                            no_result.show();
                            that.refreshOuterHeight();
                            that.events.onRetError && that.events.onRetError.call(that, data);
                            return false;
                        }
                        if(!lists || !lists.length) {
                            that.clearGridTable();
                            no_result.show();
                            that.refreshOuterHeight();
                            that.gridTablePagination.set('total', 1);
                            that.gridTablePagination.set('endPage', 1);
                            that.gridTableNoData(data);
                            that.container.find('thead .col1 .lbf-icheckbox, .table-page').hide();
                        } else {
                            var _total = Math.ceil(total / that.itemsPerPage);
                            that.gridTablePagination.set('total', _total > 0 ? _total : 1);
                            that.gridTablePagination.set('endPage', _total > 0 ? _total : 1);
                            that.container.find('.table-page').show();

                            that.gridTableFillData(data);
                        }
                        that.gridTableDataTotal(total);
                        
                        if(!that.isTbodyScroll) {
                            that.funTransitionHeight(container, 200);
                        }
                    }).fail(function(e) {
                        logger.log(e.message);
                        if(that.events.onFail){
                            that.events.onFail.call(that, e);
                        }else {
                            LightTip.error(e.message);
                        }
                    });
                } else {
                    var chks = that.container.find('tbody tr .col-chk input[type=checkbox]'),
                        total = +that.container.find('.table-page-data span:eq(0)').text(),
                        _total,
                        _list = [],
                        _data = {};

                    for(var i = 0, l = chks.length; i < l; i++) {
                        _list.push({
                            'data-grid-id': $(chks[i]).attr('data-id')
                        });
                    }

                    _data[that.listName] = _list;

                    _total = Math.ceil(total / that.itemsPerPage);
                    that.gridTablePagination.set('total', _total > 0 ? _total : 1);
                    that.gridTablePagination.set('endPage', _total > 0 ? _total : 1);

                    that.gridTableFillData(_data);
                    that.gridTableDataTotal(total);
                }
                that.loadFirstPage = true;
            } else {
                var lists = localData,
                    total = !that.initDataTotal ? localData.length : that.initDataTotal,
                    _total = Math.ceil(total / that.itemsPerPage),
                    _fillData = {
                        total: 0,
                        list: []
                    };
                
                _fillData[that.current_page_name] = nCurrentPage;

                g_table_loading.hide();

                if(!lists || !total) { no_result.show(); }

                that.gridTablePagination.set('total', _total > 0 ? _total : 1);
                that.gridTablePagination.set('endPage', _total > 0 ? _total : 1);

                _fillData.total = total;
                _fillData[that.listName] = lists.slice(nCurrentPage * that.itemsPerPage, (nCurrentPage + 1) * that.itemsPerPage);

                that.gridTableFillData(_fillData);
                that.gridTableDataTotal(total);
                
                if(!that.isTbodyScroll) {
                    that.funTransitionHeight(container, 200);
                }
            }
        },

        /**
         * 绘制列表，公共方法
         * @param {Number} nCurrentPage 页码
         * @param {Object} postData 请求数据, 可选
         * @param {Object} localData 绘制数据, 如果有这个数据传入，则不走cgi拉取新数据，可选
         */
        drawGridTable: function(nCurrentPage, postData, localData) {
            var that = this;

            that.postData = postData || that.postData;
            that.localData = localData;

            if(this.gridTablePagination.get('page') != nCurrentPage + 1) {
                this.gridTablePagination.set('page', nCurrentPage + 1);
            } else {    //页码相同,但是从动态cgi模式切换到静态本地数据模式
                if(!localData) {
                    this._drawGridTable.apply(this, [nCurrentPage]);
                } else {
                    this._drawGridTable.apply(this, [nCurrentPage, localData]);
                }
            }
        },

        /**
         * 绘制列表，公共方法, drawGridTable的别名
         * @param {Number} nCurrentPage 页码
         * @param {Object} postData 请求数据, 可选
         * @param {Object} localData 绘制数据, 如果有这个数据传入，则不走cgi拉取新数据，可选
         */
        update: function(nCurrentPage, postData, localData) {
            this.drawGridTable.apply(this, arguments);
        },

        /**
         * 控制分页大小
         */
        ctrlPagination: function() {
            var that = this,
                _trigger = this.container.find('.table-page-data .table-page-a'),
                aDropdown;

            if(_trigger[0]) {
                _trigger.find('span:eq(0)').text(that.itemsPerPage);

                aDropdown = new Dropdown({
                    trigger: _trigger,
                    content: '<ul class="lbf-dropdown-ul" style="width:110px;"><li>10</li><li>15</li><li>30</li><li>50</li></ul>',
                    adjust: {
                        x: _trigger.width() / 2 - 50
                    },
                    events: {
                        open: function(){
                            var dp = this.$el,
                                spaceTolerance = 10,//可以容忍空间高度比dropdown小的最大值(dropdown高度 - 可用空间高度), 这个值越大，容忍度越高;
                                winH = $(window).height(),
                                st = document.documentElement.scrollTop || document.body.scrollTop,
                                dpH = dp.outerHeight(true),
                                triggerH = this.$trigger.height(),
                                topSpace = this.$trigger.offset().top - st,
                                bottomSpace = winH + st - (this.$trigger.offset().top + triggerH);

                            if(winH + st < dp.offset().top + dpH - spaceTolerance && topSpace > bottomSpace){//当底部显示空间不够用,且上部显示空间又大时
                                dp.css({
                                    marginTop: (dpH + triggerH) * -1 //设置marginTop值为负实现在上方展示
                                });
                            }
                        },
                        'close.Dropdown': function(){
                            this.$el.css('marginTop', '');//清空marginTop样式
                        }
                    }
                });

                aDropdown.$el.click(function(event) {
                    var target = $(event.target);

                    that.pageCountChanged = target.html() - that.itemsPerPage != 0;
                    that.pageCountChanged && that.events.onPageCountChange && that.events.onPageCountChange.call(that, target.html());

                    that.itemsPerPage = target.html();
                    /*if(window.localStorage) {
                        localStorage['itemsPerPage_' + that.containerId] = that.itemsPerPage;
                    }*/

                    _trigger.find('span:eq(0)').html(that.itemsPerPage);
                    if(!that.localData) {
                        that.drawGridTable(0);
                    } else {
                        that.drawGridTable(0, null, that.localData);
                    }
                    aDropdown.close();
                });
            }

        },

        //Todo: 自定义数据不应该写在组件中，有待优化
        recoverPostData: function(){
            var that = this;

            ['startStamp','endStamp','pageOffset'].forEach(function(i){
                that.postData[i] = 0 ;
            });

            that.pageCountChanged = false;
        },


        /**
         * 设置内容区高度动态变化
         * @param {Object} element .table-size dom元素
         * @param {Number} time 毫秒
         */
        funTransitionHeight: function(element, time) { // time, 数值，可缺省
        	if(!element) {
        		return;
        	}
        	
            if(typeof history.pushState == "function") {
            	var height = window.getComputedStyle(element).height, 
        		minHeight = window.getComputedStyle(element).minHeight;
        		
                element.classList.add("table-transition");
                element.style.height = "auto";
                element.style.webkitTransition = "none";
                element.style.transition = "none";
                element.style.overflow = "hidden";
                var targetHeight = window.getComputedStyle(element).height;
                element.style.height = height;
                element.removeAttribute("data-transition");
                element.offsetWidth = element.offsetWidth;
                if (time) {
                    if (minHeight == "0px") {
                        element.style.webkitTransition = "height "+ time +"ms";
                        element.style.transition = "height "+ time +"ms";
                    }
                    element.setAttribute("data-transition", "true");
                }

                element.style.height = targetHeight;
                //element.style.overflow = "visible";
            } else {
            	var height = $(element).css('height', 'auto').height();
            	$(element).height(height);
            }
        },

        /**
         * 检查是否全选
         * @param {Array} checkboxArr 勾选框实例数组
         */
        checkIsAllChecked: function(checkboxArr) {
            var isAllChecked = true;
                                
            for(var i = 0, l = checkboxArr.length; i < l; i++) {
                if(!checkboxArr[i].isChecked()) {
                    isAllChecked = false;
                    break;
                }
            }

            return isAllChecked;
        },

        /**
         * 无员工表格数据
         * @param {Object} data cgi返回的空数据
         */
        gridTableNoData: function(data){
            var that = this,
                table = that.container.find('.table');
            that.events.onNoData && that.events.onNoData.call(that, data, table);
        },

        /**
         * 填充员工表格数据
         * @param {Object} data cgi返回的完整数据
         */
        gridTableFillData: function(data) {
            var that = this,
                itemsPerPage = that.itemsPerPage,
                table = that.container.find('.table'),
                theadIcheckbox,
                iCheckboxArr = that.iCheckboxArr = [];

            if(that.hasCheckboxCol) {
                that.container.find('.table thead .col-chk').html('<input type="checkbox" />');
               
                theadIcheckbox = new iCheckbox({
                    selector: '#' + that.container.attr('id') + ' .table thead .col-chk input',
                    events: {
                        check: function() {
                            var hasDisabled = false;
                            for(var i = 0, l = iCheckboxArr.length; i < l; i++) {
                                if(!iCheckboxArr[i].closest('tr').hasClass('disabled')){
                                    iCheckboxArr[i].check();
                                    iCheckboxArr[i].closest('tr').addClass('selected');
                                }else{
                                    hasDisabled = true;
                                }
                            }

                            that.events.onCheck && that.events.onCheck(that.checkHadChecked(iCheckboxArr));
                            if(hasDisabled){
                                theadIcheckbox.uncheck();
                            }
                        },
                        uncheck: function() {
                            for(var i = 0, l = iCheckboxArr.length; i < l; i++) {
                                iCheckboxArr[i].uncheck();
                                iCheckboxArr[i].closest('tr').removeClass('selected');
                            }

                            that.events.onCheck && that.events.onCheck(that.checkHadChecked(iCheckboxArr));
                        }
                    }
                });
            }

            that.events.onFillData && that.events.onFillData.call(that, data, table, function(listItem, index) {
                var dataList = data[that.listName];

                if(that.hasCheckboxCol) {
                    var listItemId = typeof listItem['data-grid-id'] != 'undefined' ? listItem['data-grid-id'] : listItem.id;

                    iCheckboxArr.push(new iCheckbox({
                        selector: '#' + that.container.attr('id') + ' #chk_' + listItemId,
                        events: {
                            check: function() {
                                if(that.checkIsAllChecked(iCheckboxArr)) {
                                    theadIcheckbox.check();
                                }

                                this.closest('tr').addClass('selected');

                                that.events.onCheck && that.events.onCheck(that.checkHadChecked(iCheckboxArr));
                            },
                            uncheck: function() {
                                theadIcheckbox.uncheck();
                                this.closest('tr').removeClass('selected');

                                that.events.onCheck && that.events.onCheck(that.checkHadChecked(iCheckboxArr));
                            }
                        }
                    }));
                }

                if(dataList.length) {
                    if(
                        (typeof dataList[dataList.length - 1].id != 'undefined' && dataList[dataList.length - 1].id == listItem.id)
                        ||
                        (typeof dataList[dataList.length - 1].qq != 'undefined' && dataList[dataList.length - 1].qq == listItem.qq)
                    ) {
                        if(!that.isTbodyScroll) {
                            that.funTransitionHeight(that.container.find('.table-size')[0], 200);
                        }
                    }
                } else {
                    if(!that.isTbodyScroll) {
                        that.funTransitionHeight(that.container.find('.table-size')[0], 200);
                    }
                }
            });
            
            //点击选中整行
            if(that.hasCheckboxCol) {
                that.container.find('.table tbody').unbind('click.trSelect').bind('click.trSelect', function(event) {
                    var trs = that.container.find('.table tbody tr'),
                        trsReal = [],
                        $target = $(event.target),
                        curTr = $target.closest('tr'),
                        curTd = $target.closest('td'),
                        curIndex = 0;

                    //操作图标、前面没有checkbox不触发
                    if($target[0].tagName == 'A' || $target[0].tagName == 'I' || $target.hasClass('lbf-icheckbox') || curTd.hasClass('col-chk') || !curTr.find('.col-chk input[type=checkbox]')[0]) {
                        return;
                    }

                    for(var i = 0, l = trs.length; i < l; i++) {
                        if($(trs[i]).find('.col-chk input[type=checkbox]')[0]) {
                            trsReal.push(trs[i]);
                        }
                    }

                    for(var i = 0, l = trsReal.length; i < l; i++) {
                        if(trsReal[i] == curTr[0]) {
                            curIndex = i;
                            break;
                        }
                    }

                    if(curTr.hasClass('selected')) {
                        iCheckboxArr[curIndex].uncheck();
                        curTr.removeClass('selected');
                    } else {
                        iCheckboxArr[curIndex].check();
                        curTr.addClass('selected');
                    }

                    if(that.checkIsAllChecked(iCheckboxArr)) {
                        theadIcheckbox.check();
                    } else {
                        theadIcheckbox.uncheck();
                    }

                    that.events.onCheck && that.events.onCheck(that.checkHadChecked(iCheckboxArr));
                });
            }
        },

        /**
         * 删除表格里的item
         * param array idArr 要删除的item id array
         * param boolean anim 是否有删除动画效果
         * param function callback 回调方法
         */
        deleteGridItems: function(idArr, anim, callback){
            var that = this,
                count = 0,
                n;
            if(!idArr.length) return;
            n = idArr.length;
            for(var i = 0; i < n; i++){
                var tr = that.container.find('tbody').find('tr[data-id='+idArr[i]+']');
                tr.hide(anim == true ? 200 : 0, function(){
                    count++;
                    $(this).remove();
                    if(count == n ){
                        that.refreshOuterHeight();
                        callback && callback.call(that, that.container.find('.table'));
                    }
                });
                //将对应的iCheckboxArr也更新一下
                that.iCheckboxArr.splice(tr.index(), 1);
            }
        },

        /**
         * 清空员工表格里的数据
         */
        clearGridTable: function() {
            this.container.find('tbody').html('');
            //this.gridTableDataTotal(0);
        },

        /**
         * 更新表格的高度
         */
        refreshOuterHeight: function(){
        	var $tableSize = this.container.find('.table-size').css('height', 'auto');
        	$tableSize.height($tableSize.height());
        },
        
        /**
         * 表格记录统计
         * @param {Number} nTotal 总数
         */
        gridTableDataTotal: function(nTotal) {
            var total = this.container.find('.table-page-data span:eq(0)');
            total.html(nTotal);

            //当小表格记录数不足15条时，不显示分页器
            /*if(!this.isBigTable) {
                this.container.find('.pagination').parent()[nTotal <= 15 ? 'hide' : 'show']();
            }*/
        },
        /**
         * 检查是否有iCheckbox被选中
         * @param {Array} nTotal 总数
         */
        checkHadChecked: function(iCheckboxArr) {
            var hadChecked = false;

            for(var i = 0, l = iCheckboxArr.length; i < l; i++) {
                if(iCheckboxArr[i].isChecked()) {
                    hadChecked = true;
                    break;
                }
            }

            return hadChecked;
        },

        /**
         * 获取成员表格已选中的checkBox的id
         */
        getSelCheckBoxIds: function() {
            var checkboxes = this.container.find('tbody .col-chk input[type=checkbox]:checked'),
                result = [];

            for(var i = 0, l = checkboxes.length; i < l; i++) {
                result.push(checkboxes[i].getAttribute('data-id'));
            }

            return result;
        }
    });



    /**
     * 类的静态属性
     */
    Grid.include($.extend(true, {
        
    }));
});
