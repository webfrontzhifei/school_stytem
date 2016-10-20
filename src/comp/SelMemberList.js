/**
 * User: sqchen
 * Date: 16-02-26
 * Time: 上午10:20
 * 选择成员业务组件-列表模式
 */

LBF.define('qidian.comp.SelMemberList', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Class = require('lang.Class'),
        template = require('util.template'),
        Main = require('qidian.conf.main'),
        Panel = require('qidian.comp.Panel'),
        TextInput = require('ui.Nodes.TextInput'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        LightTip = require('qidian.comp.LightTip'),
        ScrollList = require('qidian.comp.Paging.ScrollList');

    require('{theme}/comp/MembersSelectList/MembersSelectList.css');

    var SelMemberList = module.exports = Class.inherit({
        /**
         * 选择企业QQ号业务组件类
         * @param {Object} opts 配置项
            {
                * @param {Object} container 指定在某容器内显示,如果不设置则默认以弹框方式显示
                * @param {Boolean} isMultiple 是否多选，默认是true
                * @param {Number} max 如果多选, 则传入max可以限制最大可选数量, 缺省时是无限制
                * @param {String} className 弹框的className,缺省是lbf-panel
                * @param {Object} data post的数据
                * @param {String} title 弹出框title
                * @param {Array} list 默认已勾选的项
                * @param {String} listName 允许自定义后台返回的'list'字段，缺省为'list'
                * @param {String} listIdName 允许自定义后台返回的'list'中的'id'字段，缺省为'id'
                * @param {String} currentPageName 允许自定义传给后台上行传参 目标页码的参数别名
                * @param {String} containerTemplate 容器模板
                * @param {String} listTemplate 列表模板
                * @param {Array} prevents 禁止事件点击冒泡DOM选择器列表
                events {Object}: 事件
                {
                    * @param {Function} onSelect 选择某号码后点"确定"按钮
                    {
                        * @param {Object} event 事件event
                        * @param {Object} curNode 当前已选中的树节点
                    }
                     * @param {Function} onFirstLoad 当事组件第一次加载完成后的回调
                     {
                         * @param {Object} container 组件自身容器对象
                         * @param {Object} list 当前已选中的id集合
                     }
                     * @param {Function} onLoad 每一次拉取到列表后回调
                     {
                         * @param {Object} container 组件自身容器对象
                         * @param {Object} list 当前已选中的id集合
                     }
                     *Todo:  @param {Function} onSearchNoResult 当搜索无结果时的回调
                     {
                         * @param {Object} container 组件自身容器对象
                     }
                }
            }
         */
        initialize: function(opts) {
            var opts = $.extend(true, {
                containerId: new Date().getTime(),
                container: null,
                isMultiple: true,
                max: -1,
                className: 'lbf-panel',
                itemsPerPage: 8,
                listName: 'list',
                listIdName: 'id',
                data: {},
                list: [],
                prevents: [],
                containerTemplate: [
                    '<div id="dropdownSelectMemeberList<%= containerId %>">',
                    '<div class="members-select">',
                    '    <div class="members-select-search">',
                    '        <div class="lbf-text-input lbf-search-input lbf-autocomplete-input">',
                    '            <a href="javascript:"><i class="icon-search">搜索</i></a>',
                    '            <input id="membersSelectSearch<%= containerId %>"> <label class="lbf-text-input-placeholder">搜索</label>',
                    '         </div>',
                    '     </div>',
                    '     <div class="members-select-box"<%== listStyle || "" %>></div>',
                    ' </div>',
                    '</div>'
                ].join(''),
                listTemplate: [
                    '<ul>',
                    '<% for(var i = 0, l = data.length; i < l; i++) { %>',
                    '   <li data-id="<%= data[i].id %>"' + (typeof opts.isMultiple != 'undefined' && opts.isMultiple ? '' : ' class="single"') + '>',
                    '       <div class="lbf-icheckbox"></div>',
                    '       <div class="member-info">',
                    '           <div class="member-info-img"><img src="<%= data[i].face || data[i].img %>" /></div>',
                    '           <b><%= data[i].cname || "-" %></b>',
                    '           <span><%= data[i].ename || "-" %></span>',
                    '       </div>',
                    '   </li>',
                    '<% } %>',
                    '</ul>'
                ].join(''),
                title: '选择成员',
                events: {
                }
            }, opts),
            that = this;

            this.containerTemplate = opts.containerTemplate;
            this.listTemplate = opts.listTemplate;
            this.containerId = opts.containerId;
            this.container = opts.container;
            this.isMultiple = opts.isMultiple;
            this.max = opts.max;
            this.className = opts.className;
            this.listName = opts.listName;
            this.listIdName = opts.listIdName;
            this.currentPageName = opts.currentPageName || undefined; //上行传参 所请求目标页码的参数别名, 如果初始化时不传，则用undefined，配合在ScrollList组件中判断使用|| undefined
            this.itemsPerPage = opts.itemsPerPage;
            this.data = opts.data; //上行传参数
            this.resData = {}; //下行返回的数据对象,用于缓存返回数据的全量形式，不仅仅是列表
            this.list = opts.list;      //已选中的号码组成的数组
            this.dataModel = {};        //已加载过的数据都hold在这个hash表里
            this.prevents = opts.prevents; //点击这个参数列表中的选择器DOM，将会被return掉，不向下执行
            this.domContainer = null;
            this.scrollList = null;
            this.title = opts.title;
            this.options = opts;
            this.events = opts.events;
            this.height = opts.height || "375";//这里应jerry的要求把原先的406改成了375,即显示完整的五列,而不是原先的五列半

            this.isFirstLoad = true; //是否第一次完成CGI加载
            this.url = opts.url || '/mng/org/getUserTreeNodes';
            this.searchNoResult= opts.searchNoResult || "暂无记录";
            this.initContainer();
            this.initEvents();

            return this.superclass.prototype.initialize.apply(this, arguments);
        },

        /**
         * 初始化容器
         */
        initContainer: function() {
            var that = this;
            if(!that.container) {
                that.Panel = Panel.panel({
                    title: that.title,
                    className: that.className,
                    content: template(that.containerTemplate)({
                        containerId: that.containerId,
                        listStyle: ' style="height:'+this.height+'px;"'
                    }),
                    buttons: [{
                        className: 'lbf-button-primary',
                        content: '确定<span class="sum">'+(that.isMultiple && that.list.length > 0 ? '('+that.list.length+')' : '')+'</span>',
                        events: {
                            'change:sum': function(e, diff) {
                                var $sum = $(e.currentTarget).find('.sum'),
                                    sum = that.list.length;

                                $sum[sum > 0 ? 'show' : 'hide']().text('(' + sum + ')');
                            },
                            click: function(event) {
                                var onSelectResult;

                                if(that.Panel.buttons[0].hasClass('lbf-button-disabled')) {
                                    return;
                                }

                                onSelectResult = that.events.onSelect.call(that, event, that.list, that.getDetailsList());

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
            } else {
                that.container.html(template(that.containerTemplate)({
                    containerId: that.containerId
                }));

                //如果指定在某容器内显示,则需要在窗口resize时动态设置一下list的高度
                $(window).bind('resize.selMemberList', function() {
                    that.resizeListHeight();
                });
            }

            that.domContainer = $('#dropdownSelectMemeberList' + that.containerId);
            that.setButtonsState();

            that.initSearch();
            that.initList();
        },

        /**
         * 初始化事件绑定
         */
        initEvents: function() {
            var that = this;

            that.domContainer.find('.members-select-box').click(function(event) {
                var target = event.target,
                    $li = target.tagName == 'LI' ? $(target) : $(target).closest('li'),
                    _selectId = $li.attr('data-id'),
                    _list = that.list;

                //禁止用户选择该项
                //点击了有data-prevents属性的标签，也会禁止选择或取消选择
                if($li.hasClass('disabled') || !$li[0] || $(target).attr('data-prevents')){
                    return;
                }

                //如果点击中了被加入prevents的DOM，也会禁止选择或取消选择
                if((function() {
                    var prevent = false;
                    for (var pi = 0, pn = that.prevents.length; pi < pn; pi++) {
                        var selector = that.prevents[pi];
                        if ($li.find(selector) && $(target).is(selector)) {
                            prevent = true;
                            break;
                        }
                    }
                    return prevent;
                })()){
                    return;
                }


                if(!that.isMultiple) {
                    if($li.hasClass('selected')) {
                        that.list = [];
                        $(this).find('li').removeClass('selected');
                    } else {
                        that.list = [_selectId];
                        $(this).find('li').removeClass('selected');
                        $li.addClass('selected');
                    }
                    if(that.events.onClick){
                        that.events.onClick.call(that, event, that.list, that.getDetailsList());
                    }

                } else {
                    if(
                        !$li.hasClass('selected')
                        &&
                        that.max > 0
                        &&
                        $(this).find('li.selected').length >= that.max
                    ) {
                        return;
                    }

                    if($li.hasClass('selected')) {
                        if($.inArray(_selectId, that.list) != -1) {
                            that.list.splice($.inArray(_selectId, that.list), 1);
                        }
                        $li.removeClass('selected');
                    } else {
                        if($.inArray(_selectId, that.list) == -1) {
                            that.list.push(_selectId);
                        }
                        $li.addClass('selected');
                    }
                }

                if(that.container) {
                    that.events.onSelect.call(that, event, that.list, that.getDetailsList());
                } else {
                    if(that.Panel) {
                        that.isMultiple && that.Panel.buttons[0].trigger('change:sum', [$li.hasClass('selected') ? 1 : -1]);
                    }
                    that.setButtonsState();
                }
            });
        },

        /**
         * 初始化搜索
         */
        initSearch: function() {
            var that = this;

            new TextInput({
                selector: '#membersSelectSearch' + that.containerId
            }).on('input', function(obj) {
                that.searchTimerId && clearTimeout(that.searchTimerId);
                that.searchTimerId = setTimeout(function(){
                    that.initList(obj.target.value);
                },200);
            });
        },

        /**
         * 初始化列表
         * @param {String} keywords 搜索关键字
         */
        initList: function(keywords) {
            keywords = $.trim(keywords);
            var that = this,
                listBox = that.domContainer.find('.members-select-box');

            that.scrollList && that.scrollList.remove();
            listBox.html('');

            that.scrollList = new ScrollList({
                scroll: listBox,
                url: that.url,
                listName: that.listName,
                paging: that.currentPageName, //传给后台标识目标页码的字段名
                data: $.extend(true, {
                    keywords: keywords,
                    items_per_page: that.itemsPerPage
                }, that.data),
                wrapTemplate: that.listTemplate
            });
            that.scrollList.on('done', function(event, data) {
                //var dataList = data.list,
                      //_list = that.list;
                var dataList = data[that.listName],
                    idName = that.listIdName,
                    _list = that.list;

                that.resData = data;//缓存全量返回的数据

                for(var i = 0, l = dataList.length; i < l; i++) {
                    //往that.dataModel里缓存已经加载过的数据
                    that.dataModel[dataList[i][idName]] = dataList[i];

                    if($.inArray(dataList[i][idName], _list) != -1) {
                        listBox.find('li[data-id=' + dataList[i][idName] + ']').addClass('selected');
                    }
                }

                if(!listBox.find('li').length) {
                    listBox.html('<div class="list-null">'+that.searchNoResult+'</div>');
                }

                //每一次加载列表完都会执行的回调
                that.events.onLoad && that.events.onLoad.call(that, that.domContainer, that.list, that.getDetailsList());

                //如果是第一次加载完成，则执行相关回调
                if(that.isFirstLoad) {
                    that.domContainer.find('.table-loading').addClass('normal');
                    that.isFirstLoad = false;
                    that.events.onFirstLoad && that.events.onFirstLoad.call(that, that.domContainer, that.list, that.getDetailsList());
                }
            });
            that.scrollList.on('fail', function(event, data) {
                LightTip.error(data);
            });


            if(that.container) {
                that.resizeListHeight();
            }
        },

        /**
         * 设置列表高度
         */
        resizeListHeight: function() {
            var domContainer = this.domContainer;

            domContainer.find('.members-select-box').height(this.container.height() - domContainer.find('.members-select-search').height());
        },

        /**
         * 初始化按钮状态,弹框模式下,如果初始化时候没有任何勾选,则"确认"按钮灰掉
         */
        setButtonsState: function() {
            if(this.Panel) {
                this.Panel.buttons[0][this.list.length ? 'removeClass' : 'addClass']('lbf-button-disabled');
            }
        },

        /**
         * 根据qq号list获取缓存里对应的详情信息
         */
        getDetailsList: function() {
            var result = [],
                _list = this.list,
                _dataModel = this.dataModel;

            for(var i = 0, l = _list.length; i < l; i++) {
                if(_dataModel[_list[i]]) {
                    result.push(_dataModel[_list[i]]);
                } else {
                    result.push({
                        id: _list[i]
                    });
                }
            }

            return result;
        }
    });



    /**
     * 类的静态属性
     */
    SelMemberList.include($.extend(true, {

    }));
});
