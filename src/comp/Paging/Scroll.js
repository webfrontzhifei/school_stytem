/**
 * Created by dericktang on 2016/2/25.
 */
LBF.define('qidian.comp.Paging.Scroll', function (require, exports, module) {
    var Node = require('ui.Nodes.Node'),
        ScrollPage = require('qidian.comp.Paging.ScrollPage'),
        extend = require('lang.extend');

    var Scroll = Node.inherit({


        initialize : function(opts){
            this.mergeOptions(opts);
            if(typeof opts.data != 'undefined') {
                this.data = opts.data;
            } else {
                this.data={};
            }
            //获取异步数据
            var list = this.template(this.get("wrapTemplate"));
            var html = list({data:this.data})
            var scrollbar = jQuery(this.get("scroll"));
            scrollbar.append(html);
            scrollbar.css({"overflow-y":"auto","position":"relative"});
            this.trigger('done',this.data);
            return this;
        }

    });

    Scroll.include({

        settings: extend(true, {}, Node.settings, {
            //List模版
            wrapTemplate:[
//                "<%for(var i = 0;i<data.length;i++){%>",
//                "<div><%=data[i].id%></div>",
//                "<div><%=data[i].name%></div></br>",
//                "<%}%>"
            ].join('')
        })

    });

    return Scroll;

});