/**
 * @fileOverview
 * @author rainszhang
 * @version 1
 * Created: 14-3-11 下午5:35
 */
LBF.define('ui.widget.Grid.Grid', function(require){
    var Node = require('ui.Nodes.Node'),
		extend = require('lang.extend'),
        Pagination = require('ui.widget.Pagination'),
        DragDrop = require('ui.Plugins.DragDrop'),
        //这里后续可以改成异步拉取
        Pin = require('ui.Plugins.Pin'),
        isNumber = require('lang.isNumber'),
        isArray = require('lang.isArray');

    require('{theme}/lbfUI/css/Grid.css');

    /**
     * Grid组件可以对table的视觉、交互、可用性增强
     * @class Grid
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String} [opts.template] template of node
     * @param {String|jQuery|documentElement} [opts.selector] jq'selector 使用这个参数container将失效，组件dom降replace这个selector
     * @param {String|jQuery|documentElement} [opts.containner] jq'selector，组件dom降append到这个containner
     * @param {String|Number} [opts.width] 'auto' or number
     * @param {String|Number} [opts.height] 'auto' or number
     * @param {String} [opts.className] 样式定制接口
     * @param {String} [opts.isShowHeader] 是否显示表格标题
     * @param {String} [opts.isShowFooter] 是否显示表格底部，包括默认的分页导航或者其他信息，属于预留结构
     * @param {String} [opts.title] 表格标题
     * @param {Object} [opts.cols] 表格表头的数据信息，数组
     * @param {String} [opts.cols.title] 表格表头的数据信息，列标题
     * @param {String} [opts.cols.width] 表格表头的数据信息，列宽度
     * @param {String} [opts.cols.align] 表格表头的数据信息，列对齐方式
     * @param {String} [opts.cols.sortable] 定制列是否可排序
     * @param {Object} [opts.items] 表格行数组
     * @param {String} [opts.nowrap] 表格内容文字是否支持折行
     * @param {Boolean} [opts.sortable] 是否支持排序
     * @param {String} [opts.sortMode] 表格排序方式，支持本地local、远程remote排序
     * @param {String} [opts.sortStatus] 表格排序方向 up | down
     * @param {Boolean} [opts.oddRowsHighlight] 是否支持高亮
     * @param {String} [opts.hoverMode] hover模式，默认支持行的hover UI
     * @param {String} [opts.selectMode] hover模式，默认支持行的选中 UI
     * @param {Function} [opts.events.click] Callback when attribute changed
     * @example
     *     grid1 = new Grid({
     *        selector: '#demo-grid-html',
     *        isShowHeader: false,
     *        title: 'rainszhang',
     *        width: 'auto',
     *        height: 'auto',
     *        nowrap: false,
     *        sortStatus: 'down'
     *     });
     */
    var Grid = Node.inherit({
        /**
         * 缓存，快捷访问，this.$element
         */
        elements: {
            '$thead': '.lbf-grid-body-header'
        },


        /**
         * Render Grid and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var $ = this.$,
                $el = $(this.get('template')),
                width = this.get('width'),
                height = this.get('height'),
                pinThead = this.get('pinThead'),
                title = this.get('title'),
                container = this.get('container'),
                items = this.get('items'),
                cols = this.get('cols'),
                sortStatus = this.get('sortStatus'),
                sortMode = this.get('sortMode'),
                nowrap = this.get('nowrap'),
                oddRowsHighlight = this.get('oddRowsHighlight'),
                hoverMode = this.get('hoverMode'),
                selectMode = this.get('selectMode'),
                selector = this.get('selector'),
                that = this;

            this.setElement($el);

            if(selector){
                items = this.analyzeHtmlTable(selector).items;
                cols = this.analyzeHtmlTable(selector).cols;
            }

            //缓存数据
            this.items = items;
            this.cols = cols;

            this.pinThead = pinThead;

            this.sortStatus = sortStatus;
            this.sortMode = sortMode;
            this.nowrap = nowrap;
            this.oddRowsHighlight = oddRowsHighlight;
            this.hoverMode = hoverMode;
            this.selectMode = selectMode;

            //cols的宽度
            this.colsWidthArr = [];
            //cols drager的位置
            this.dragHeaderPosXArr = [];

            //渲染结构
            if(selector){
                $(selector).replaceWith($el);
            }else{
                container && $(container).html($el);
            }

            //判断是够显示header、footer
            !this.get('isShowHeader') && this.find('.lbf-grid-header').remove();
            !this.get('isShowfooter') && this.find('.lbf-grid-footer').remove();

            //处理title
            this.get('isShowHeader') && this.find('.lbf-grid-title').text(title);

            //处理宽高
            this.$el.css({
                width: width,
                height: height
            });

            //渲染表格
            this.initTableView();

            //处理是否pin thead
            pinThead && this._pinThead();
        },

        _pinThead: function(){
            var that = this,
                node = new Node({
                    selector: that.$thead
                });

            node.plug(Pin, that.pinThead);
        },

        analyzeHtmlTable: function(selector){
            var that = this;
                $ = that.$,
                data = {},
                selector = selector;

            data.cols = [];
            data.items = [];

            $(selector).find('thead tr th').each(function(){
                var cols = {};

                cols.title = $(this).html();
                cols.width = $(this).outerWidth();
                cols.align = $(this).css('text-align');
                cols.sortable = $(this).data('sortable');

                data.cols.push(cols);
            });


            $(selector).find('tbody tr').each(function(){
                var items = [];

                $(this).find('td').each(function(){
                    items.push($(this).html());
                });

                data.items.push(items);
            });

            return data;
        },

        initTableView: function(){
            //init table's head view
            this.initTableHeadView(this.cols);

            //init table's head dragger events
            this.initTableHeadDragerView();

            //init table's body view
            this.initTableBodyView(this.items);

            //init table's srot view
            this.initSortView();
        },

        initTableHeadView: function(cols){
            var that = this,
                $ = that.$,
                nowrap = that.nowrap,
                arr = [],
                html = '',
                nowrapClass = nowrap ? ' nowrap' : '',
                cols = cols;

            arr.push('<table class="lbf-grid-body-header-table" cellpadding="0" cellspacing="0">');
            arr.push('    <tr>');

            for(var i=0; i<cols.length; i++){
                //如果是百分比
                if(cols[i].width.indexOf && cols[i].width.indexOf('%')){
                    cols[i].width = that.$el.width() * (parseInt(cols[i].width)/100);
                }

                arr.push('        <td style="width:'+ cols[i].width +'px;"></td>');
            }

            arr.push('    </tr>');
            arr.push('    <tr>');

            for(var i=0; i<cols.length; i++){
                arr.push('        <td class="lbf-grid-col'+ nowrapClass +'" index="'+ i +'" data-sortable="'+ cols[i].sortable +'" style="text-align:'+ cols[i].align +'">');
                arr.push('            <div class="lbf-grid-col-div">');
                arr.push('                '+  cols[i].title);
                arr.push('                <span class="lbf-grid-col-sort-icon"></span>');
                arr.push('            </div>');
                arr.push('        </td>');
            }

            arr.push('    </tr>');
            arr.push('</table>');

            for(var i=0; i<cols.length; i++){
                var dragHeaderPosX = cols[0].width;

                for(var j=1; j<i+1; j++){
                    dragHeaderPosX = dragHeaderPosX + cols[j].width;
                }

                if(i !== cols.length-1){
                    arr.push('<div class="lbf-grid-col-drag-handle" style="left:'+ dragHeaderPosX +'px">&nbsp;</div>');
                }

                //缓存几个宽度值和位置值，drag使用
                that.colsWidthArr.push(cols[i].width);
                that.dragHeaderPosXArr.push(dragHeaderPosX);
            }

            html = arr.join('');

            that.$(html).appendTo(this.$el.find('.lbf-grid-body-header'));

            //微调dragger的位置和高度，使之居中
            that.$el.find('.lbf-grid-col-drag-handle').each(function(){
                $(this).css({
                    left: parseInt($(this).css('left')) - $(this).width()/2,
                    height: that.$el.find('.lbf-grid-col').outerHeight()
                });
            });
        },

        initTableBodyView: function(items){
            var that = this,
                $ = that.$,
                items = items,
                cols = that.cols,
                arr = [],
                html = '',
                nowrap = that.nowrap,
                nowrapClass = nowrap ? ' nowrap' : '',
                oddRowsHighlight = that.oddRowsHighlight,
                oddRowsHighlightClass = oddRowsHighlight ? ' lbf-grid-row-odd' : '',
                hoverMode = that.hoverMode,
                selectMode = that.selectMode;

            arr.push('<table class="lbf-grid-body-body-table" cellpadding="0" cellspacing="0">');
            arr.push('    <tr class="lbf-grid-row">');

            for(var i=0; i<that.colsWidthArr.length; i++){
                //如果是百分比
                if(that.colsWidthArr[i].indexOf && that.colsWidthArr[i].indexOf('%')){
                    that.colsWidthArr[i] = that.$el.width() * (parseInt(that.colsWidthArr[i])/100);
                }

                arr.push('        <td style="width:'+ that.colsWidthArr[i] +'px;"></td>');
            }

            arr.push('    </tr>');

            for(var i=0; i<items.length; i++){
                if(i%2 !== 0){
                    arr.push('    <tr class="lbf-grid-row'+ oddRowsHighlightClass +'" index='+ i +'>');
                }else{
                    arr.push('    <tr class="lbf-grid-row" index='+ i +'>');
                }


                for(var j=0; j<that.colsWidthArr.length; j++){
                    arr.push('        <td class="lbf-grid-cell'+ nowrapClass +'">');
                    arr.push('            <div class="lbf-grid-cell-div'+ nowrapClass +'" style="text-align:'+ cols[j].align +';">'+ items[i][j] +'</div>');
                    arr.push('        </td>');
                }

                arr.push('    </tr>');
            }

            arr.push('</table>');

            html = arr.join('');

            that.$el.find('.lbf-grid-body-body').html(html);

            if(hoverMode === 'row'){
                that.$el.find('.lbf-grid-body-body').find('tr').hover(
                    function () {
                        $(this).addClass("lbf-grid-row-hover");
                    },
                    function () {
                        $(this).removeClass("lbf-grid-row-hover");
                    }
                );
            }

            if(selectMode === 'row'){
                that.$el.find('.lbf-grid-body-body').find('tr').click(function(){
                    $(that.$el.find('.lbf-grid-body-body').find('.lbf-grid-row-on')).removeClass('lbf-grid-row-on');
                    $(this).addClass('lbf-grid-row-on');
                });
            }
        },

        initSortView: function(){
            var that = this,
                $ = that.$,
                sortStatus = that.sortStatus;

            that.$el.find('.lbf-grid-col').each(function(){
                if($(this).data('sortable')){
                    $(this).click(function(e){
                        if($(this).is('.lbf-grid-col-on-up') || $(this).is('.lbf-grid-col-on-down')){
                            if($(this).is('.lbf-grid-col-on-up')){
                                $(this).removeClass('lbf-grid-col-on-up').addClass('lbf-grid-col-on-down');
                                that.sort($(this).attr('index'), 'down');
                            }else{
                                $(this).removeClass('lbf-grid-col-on-down').addClass('lbf-grid-col-on-up');
                                that.sort($(this).attr('index'), 'up');
                            }
                        }else{
                            that.$el.find('.lbf-grid-col').removeClass('lbf-grid-col-on-down').removeClass('lbf-grid-col-on-up');
                            $(this).addClass('lbf-grid-col-on-'+sortStatus);
                            that.sort($(this).attr('index'), sortStatus);
                        }
                    });
                }
            });
        },

        /*
         * 绑定拖拽事件
         */
        initTableHeadDragerView: function(){
            var that = this,
                $ = that.$,
                header = that.$el.find('.lbf-grid-body-header-table'),
                dragHandle = that.$el.find('.lbf-grid-col-drag-handle'),
                len = dragHandle.length;

            dragHandle.each(function(i){
                $(this).attr('index', i);

                var node = new Node({
                        selector: $(this)
                    }),
                    dragStartPosX,
                    area = {};

                node.plug(DragDrop, {
                    proxy: false,
                    events: {
                        beforeDrag: function(e, dd, x0, y0, left, top){
                            dragStartPosX = left;

                            //设置dragArea，以后优化代码
                            var offset = header.outerPosition();
                            //按照目前这个思路，如果父容器position为relative或者absolute，left=0; top=0，遗留z-index无法逾越的问题，需要在业务侧管理好z-index，by rains
                            if(header.css('position') === 'relative' || header.css('position') === 'absolute'){
                                offset = {
                                    top: 0,
                                    left:0
                                };
                            }
                            area.top = offset.top;
                            area.bottom = offset.top + header.innerHeight();
                            if(i===0){
                                area.left = offset.left - $(this).width()/2 + 60;
                                area.right = offset.left + that.dragHeaderPosXArr[i+1] + $(this).width()/2 - 60;
                            }else if(i == len-1){
                                area.left = offset.left + that.dragHeaderPosXArr[i-1]  - $(this).width()/2 + 60;
                                area.right = offset.left + header.innerWidth() + $(this).width()/2 - 60;
                            }else{
                                area.left = offset.left + that.dragHeaderPosXArr[i-1]  - $(this).width()/2 + 60;
                                area.right = offset.left + that.dragHeaderPosXArr[i+1] + $(this).width() + $(this).width()/2 - 60;
                            }
                            node.setDragArea(area);
                        },
                        drag: function(e, dd, x0, y0, left, top){
                            //重新计算drag-bar的高度
                            that.$el.find('.lbf-grid-drag-bar').height(that.$el.find('.lbf-grid-body').height()).css({
                                left:0
                            });

                            var tbLeft = left;

                            that.$el.find('.lbf-grid-drag-bar').each(function(){
                                //显示参考线
                                $(this).show();



                                if($(this).attr('index') == 0){
                                    $(this).css({
                                        left: that.dragHeaderPosXArr[i-1]
                                    });
                                }
                                if($(this).attr('index') == 1){
                                    $(this).css({
                                        left: tbLeft + dragHandle.width()/2
                                    });
                                }
                            });
                        },
                        drop: function(e, dd, x0, y0, left, top){
                            var distance;

                            //隐藏参考线
                            that.$el.find('.lbf-grid-drag-bar').hide();

                            //重新计算每cols的宽度
                            distance = left - dragStartPosX;

                            that.colsWidthArr[i] = that.colsWidthArr[i] + distance;
                            that.colsWidthArr[i+1] = that.colsWidthArr[i+1] - distance;

                            that.dragHeaderPosXArr[i] = that.dragHeaderPosXArr[i] + distance;

                            //console.log(that.dragHeaderPosXArr)
                            //console.log(that.colsWidthArr);

                            //出新调成表格cols宽度
                            that.$el.find('.lbf-grid-body-header-table td').each(function(i){
                                $(this).css({
                                    width: that.colsWidthArr[i],
                                    maxWidth: that.colsWidthArr[i]
                                });
                            });
                            that.$el.find('.lbf-grid-body-body-table td').each(function(i){
                                $(this).css({
                                    width: that.colsWidthArr[i],
                                    maxWidth: that.colsWidthArr[i]
                                });
                            });

                        }
                    }
                });

                //设置dragArea，以后优化代码
                var offset = header.outerPosition();
                //按照目前这个思路，如果父容器position为relative或者absolute，left=0; top=0，遗留z-index无法逾越的问题，需要在业务侧管理好z-index，by rains
                if(header.css('position') === 'relative' || header.css('position') === 'absolute'){
                    offset = {
                        top: 0,
                        left:0
                    };
                }
                area.top = offset.top;
                area.bottom = offset.top + header.innerHeight();
                if(i===0){
                    area.left = offset.left - $(this).width()/2 + 60;
                    area.right = offset.left + that.dragHeaderPosXArr[i+1] + $(this).width()/2 - 60;
                }else if(i == len-1){
                    area.left = offset.left + that.dragHeaderPosXArr[i-1]  - $(this).width()/2 + 60;
                    area.right = offset.left + header.innerWidth() + $(this).width()/2 - 60;
                }else{
                    area.left = offset.left + that.dragHeaderPosXArr[i-1]  - $(this).width()/2 + 60;
                    area.right = offset.left + that.dragHeaderPosXArr[i+1] + $(this).width() + $(this).width()/2 - 60;
                }
                node.setDragArea(area);
            });
        },

        sort: function(index, sortStatus){
            var that = this,
                $ = that.$,
                items = that.items,
                sortItems = [],
                sortMode = that.sortMode,
                sortStatus = sortStatus,
                sortCols = [],
                index = parseInt(index, 10),
                arr = [];


            if(sortMode === 'local'){
                that.$el.find('.lbf-grid-body-body-table tr:gt(0) > td:nth-child('+(index+1)+') > div').each(function(i){
                    sortCols[i] = [];
                    sortCols[i]['text'] = $(this).text();
                    sortCols[i]['rowIndex'] = parseInt($(this).parent().parent().attr('index'));
                });

                sortCols.sort(function compare(a, b){
                    //排序前转换
                    if(isNumber(a['text']) && isNumber(b['text'])){
                        a['text'] = parseFloat(a['text']);
                        b['text'] = parseFloat(b['text']);
                    }else{
                        //各个浏览器localeCompare的结果不一致，以后要区分
                        return sortStatus === 'down' ? -a['text'].localeCompare(b['text'])  : a['text'].localeCompare(b['text']);
                    }

                    return a['text'] > b['text'] ? (sortStatus === 'down' ? -1 : 1) : (sortStatus === 'down' ? 1 : -1);
                });

                for(var i=0; i<sortCols.length; i++){
                    sortItems.push(items[sortCols[i]['rowIndex']]);
                }

                //更新数据源
                that.items = sortItems;

                this.initTableBodyView(sortItems);
            }else{
                //远程排序
            }

            return this;
        },

        /**
         * 增加数据行
         * @method addRows
         * @param {Array} 需增加数据行的数据数组
         * @param {Number} 数据添加到索引行
         * @chainable
         * @return Object
         */
        addRows: function(data, index){
            if(arguments.length === 1){
                for(var i=0; i<data.length; i++){
                    this.items.push(data[i]);
                }
            }else{
                for(var i=0; i<data.length; i++){
                    this.items.splice(index+i, 0, data[i]);
                }
            }

            this.initTableBodyView(this.items);

            return this;
        },

        /**
         * 移除索引行，如index为索引值则删除索引行，如index为索引数组则一次移除多行，如果不传参则删除所有行
         * @method removeRows
         * @param {Number} index 移除行的索引值
         * @chainable
         * @return Object
         */
        removeRows: function(index){
            if(arguments.length === 0){
                this.items = [];
            }else{
                if(isNumber(index)){
                    this.items.splice(index, 1);
                }else if(isArray(index)){
                    for(var i=0; i<index.length; i++){
                        this.items.splice(index[i]-i, 1);
                    }
                }else{
                    this.items = [];
                }
            }

            this.initTableBodyView(this.items);

            return this;
        },

        /**
         * 更新数据到索引行，一次只能更新一行
         * @method rowsLupdateRowsength
         * @param {Array} data 更新的数据
         * @param {Number} 需要更新行的索引值
         * @chainable
         * @return Object
         */
        updateRows: function(data, index){
            this.items[index] = data;

            this.initTableBodyView(this.items);

            return this;
        },

        /**
         * 获取数据数组的长度
         * @method rowsLength
         * @chainable
         * @return Number
         */
        rowsLength: function(){
            return this.items.length();
        },

        /**
         * 返回选中行的数据数组
         * @method selectedRows
         * @chainable
         * @return Array
         */
        selectedRows: function(){
            var arr = [],
                that = this;

            this.$el.find('.lbf-grid-body-body').find('tr:gt(0).lbf-grid-row-on').each(function(){
                arr.push(that.items[$(this).attr('index')]);
            });

            return arr;
        },

        /**
         * 返回选中行索引的数组
         * @method selectedRowsIndex
         * @chainable
         * @return Array
         */
        selectedRowsIndex: function(){
            var arr = [],
                that = this;

            this.$el.find('.lbf-grid-body-body').find('tr:gt(0).lbf-grid-row-on').each(function(){
                arr.push($(this).attr('index'));
            });

            return arr;
        },

        /**
         * 返回指定行的数据数组
         * @method rows
         * @param {Number} index 行索引值，不传参返回所有行的数据数组
         * @chainable
         * @return Array
         */
        rows: function(index){
            if(arguments.length === 0){
                return this.items;
            }else{
                return this.items[index];
            }
        },

        /**
         * 选中指定索引值的行
         * @method select
         * @param {Number} index 行索引值，不传参选中所有行
         * @chainable
         * @return Object
         */
        select: function(index){
            if(arguments.length === 0){
                this.$el.find('.lbf-grid-body-body').find('tr').each(function(){
                    $(this).addClass('lbf-grid-row-on');
                });
            }else{
                //第一行不计算
                this.$el.find('.lbf-grid-body-body').find('tr:eq('+ (index+1) +')').addClass('lbf-grid-row-on');
            }

            this.trigger('select', [this, index]);

            return this;
        }
    });

    Grid.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            //Grid结构模板
            template: [
                '<div class="lbf-grid">',
                    '<div class="lbf-grid-header">',
                       ' <div class="lbf-grid-title"></div>',
                    '</div>',
                    '<div class="lbf-grid-body">',
                        '<div class="lbf-grid-body-header"></div>',
                        '<div class="lbf-grid-body-body"></div>',
                        '<div class="lbf-grid-drag-bar" index="0"></div>',
                        '<div class="lbf-grid-drag-bar" index="1"></div>',
                    '</div>',
                    '<div class="lbf-grid-footer">',
                        '<div class="lbf-grid-pagination"></div>',
                    '</div>',
                '</div>'
            ].join(''),

            selector: null,

            //默认容器
            container: null,

            width: 'auto',

            height: 'auto',

            //样式定制接口容器
            className: '',

            //isShowHeader
            isShowHeader: false,

            pinThead: false,

            //表格标题
            title: 'Grid',

            cols: null,

            items: null,

            nowrap: false,
            
            sortMode: 'local', //remote

            sortStatus: 'down', //up

            //是否双行高亮
            oddRowsHighlight: true,

            //hover模式，默认支持行的hover UI
            hoverMode: 'row', // row|none

            //选中模式，默认支持行的选中 UI
            selectMode: 'row', // row|none

            events: {
                load: function(){},
                select: function(){},
                sortSuccess: function(){},
                sortError: function(){},
                unload: function(){}
            }
        }
    });

    return Grid;
});