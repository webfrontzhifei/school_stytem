/**
 * 滚动条分页，当滚动条滑动到底部，进行异步请求加载新数据
 * Created by dericktang on 2016/2/24.
 */
LBF.define('qidian.comp.Paging.ScrollPage', function (require, exports, module) {
    var Scrollbar = require('qidian.comp.Scrollbar'),
        Node = require('ui.Nodes.Node'),
        extend = require('lang.extend');

    var ScrollPage = Node.inherit({

        render : function(opts){
            var view = this;
            var canScroll = this.canScroll=true;
            var page = this.page = 0;
            var scrollbar = jQuery(this.get("scroll"));
            var padding = scrollbar.css("padding");

            var pTop,pBottom;
            //console.log(padding+"==>>>"+padding,"||||"+padding);
            if(padding && padding.split(" ")){
                var arr = padding.split(" ");
                if(undefined == arr[2]){
                    pTop=parseInt(arr[0])*2;
                }else{
                    pTop=parseInt(arr[0])+parseInt(arr[2]);
                }
            }else{
                var paddingTop = scrollbar.css("padding-top");
                var paddingBottom = scrollbar.css("padding-bottom");
                if(paddingTop){
                    pTop=parseInt(paddingTop);
                }
                if(paddingBottom){
                    pBottom=parseInt(paddingTop);
                }
                pTop=pTop+pBottom;
            }

            scrollbar.css({"overflow-y":"auto","overflow-x":"hidden","position":"relative"});

            scrollbar.on("scroll",function(event){
                var a = jQuery(event.currentTarget).height();
                var height= scrollbar.get(0).scrollHeight;
                var top=Math.ceil(event.target.scrollTop);
                var bottom = (height-a)-pTop;
                //console.log(pTop+"==>>>"+bottom,"||||"+top);
                if(Math.abs(bottom-top)<=5 && view.canScroll && view.total>=view.page){
                    //console.log("*****")
                    view.trigger('scrollBar');
                    view.canScroll=false;
                }
            });

        },

        /*
        * 与@dericktang沟通后，决定添加此方法用于在子类中调用，对page属性重新赋值
        * */
        resetPage: function(page){
            this.page = page;
        },

        fetch:function(page){
        },

        /**
         * 将异步数据append到容器
         */
        appendToContainer:function(data){
            var list = this.template(this.get("wrapTemplate"));
            var html = list({data:data})
            jQuery(this.get("scroll")).append(html);
            this.canScroll=true;
            this.page++;
        },

        setTotalPage:function(total){
            this.total=total;
        }

    });

    ScrollPage.include({

        settings: extend(true, {}, Node.settings, {
            wrapTemplate:[
                "<%for(var i = 0;i<data.length;i++){%>",
                "<div class='test'>ID:<%=id%></div>",
                "<%}%>"
            ].join('')
        })

    });

    return ScrollPage;

});