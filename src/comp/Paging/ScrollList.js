/**
 * Created by dericktang on 2016/2/25.
 */
LBF.define('qidian.comp.Paging.ScrollList', function (require, exports, module) {
    var Node = require('ui.Nodes.Node'),
        ScrollPage = require('qidian.comp.Paging.ScrollPage'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        extend = require('lang.extend');

    var ScrollList = ScrollPage.inherit({

        initialize : function(opts){
            this.mergeOptions(opts);
            ScrollPage.prototype.initialize.apply(this, arguments);

            if(typeof opts.url != 'undefined') {
                this.url = opts.url;
            } else {
                this.url = "";
            }

            if(typeof opts.data != 'undefined') {
                this.data = opts.data;
            } else {
                this.data={};
            }

            if(typeof opts.paging != 'undefined') {
                this.paging = opts.paging;
            } else {
                this.paging="current_page";
            }

            if(typeof opts.type != 'undefined') {
                this.type = opts.type;
            } else {
                this.type="post";
            }

            if(typeof opts.listName != 'undefined') {
                this.listName = opts.listName;
            } else {
                this.listName="list";
            }

            var view = this;
            //获取异步数据

            //默认的起始页码值
            this.startPage = this.data[view.paging] || 0;

            //将父类的page属性重新赋值
            //PS: 和Dericktang沟通后，将resetpage方法定义在了ScrollPage.js中
            typeof this.resetPage == 'function' && this.resetPage(this.startPage);

            //初始化完成，默认请求一次
            view.fetch(this.startPage);

            view.on("scrollBar",function(event){
                //console.log("scrollBar===>>>");
                view.fetch(view.page);
            });

            return this;
        },

        /**
         * 获取分页数据
         * @param page
         */
        fetch:function(page){
            var view = this,url = view.url,data = this.data;
            data[view.paging] = page;
            this._loading();
            //那关键字请求的是应该帮到dom上

            jQuery(view.get("scroll")).attr("data-keywords",data.keywords || "");

            //logger.debug(page+" keywords:"+data.keywords);
            REST.create({
                url: url,
                data: data,
                type:this.type
            }).done(function(result) {
                //logger.debug(this.data);
                var dataList = result[view.listName];
                var total = Math.ceil(result.total/data.items_per_page)-1;
                //logger.debug(page+" keywords:"+data.keywords+"  data-keywords:"+jQuery(view.get("scroll")).attr("data-keywords"));
                if(data.keywords ){
                    if(page==view.startPage){
                        jQuery(view.get("scroll")).empty();
                    }

                }else{
                    if(page==view.startPage){
                        jQuery(view.get("scroll")).empty();
                    }
                }
                //渲染数据
                var key = data.keywords || "";
                //logger.debug(page+" || " +result.current_page+"      "+total+"   "+key+" key"+jQuery(view.get("scroll")).attr("data-keywords"))

                view.appendToContainer(dataList);
                view.setTotalPage(total);
                view.trigger('done',result);
                view._unloading();


            }).fail(function(err) {
                view.trigger('fail',err);
                view._unloading();
            });
        },

        _loading:function(){
            var scrollbar = jQuery(this.get("scroll"));
            jQuery(scrollbar).append('<div class="table-loading" style="height: 30px;padding: 0px;line-height: 30px;"><s class="loading"></s></div>');
        },

        _unloading:function(){
            var scrollbar = jQuery(this.get("scroll"));
            jQuery(scrollbar).find(".table-loading").remove();
        }




    });

    ScrollList.include({

        settings: extend(true, {}, ScrollPage.settings, {
            //List模版
            wrapTemplate:[
//                "<%for(var i = 0;i<data.length;i++){%>",
//                "<div><%=data[i].id%></div>",
//                "<div><%=data[i].name%></div></br>",
//                "<%}%>"
            ].join('')
        })

    });

    return ScrollList;

});