/**
 * Created by amos on 14-4-9.
 */
LBF.define('qidian.comp.Pagination', function(require){
    var Pagination = require('ui.widget.Pagination');
    
    var pagination = function(settings){

        if(settings.isSimple == true) {
            /*
             * 分页样式A:  多用于弹层中小分页
             * < 5 / 10 >
             */
            var total = Math.ceil(settings.total / settings.count) || 1;
            settings.endPage = settings.endPage || total;

            settings.pageTemplate = [
                '<% var ahead = Math.min(Math.round((maxDisplay - 1) / 2), page - 1);%>',
                '<% var after = Math.min(maxDisplay - 1 - ahead, total - page);%>',
                '<% ahead = Math.max(ahead, maxDisplay - 1 - after)%>',
                '<div class="lbf-pagination lbf-pagination-simple">',
                //isShowJump
                '<% if(isShowJump) { %>',
                '<div class="lbf-pagination-jump"><input type="text" class="lbf-pagination-input" value="" /><a href="javascript:;" class="lbf-pagination-go">跳转</a></div>',
                '<% } %>',
                '<ul class="lbf-pagination-item-list">',
                '<li class="lbf-pagination-item"><span href="javascript:;" class="lbf-pagination-prev <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==prevText%></span></li>',
                '<li class="lbf-pagination-item"><%=page%> / <%=total%></li>',
                '<li class="lbf-pagination-item"><span href="javascript:;" class="lbf-pagination-next <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==nextText%></span></li>',
                '</ul>',
                '</div>'
            ].join('');

            return new Pagination(settings).mixin(
                {
                    disable: function () {
                        var overlay = this.$el.find('.overlay');
                        this.set('disabled', true);
                        overlay.show();
                    },

                    enable: function () {
                        var overlay = this.$el.find('.overlay');
                        this.set('disabled', false);
                        overlay.hide();
                    }
                });
        }
        else {
            /*
             * 分页样式B:  多用于页面中列表
             * < 1 2 3 4 ... 9 10 > [ ] 跳转
             */

            settings.pageTemplate = [
                '<% var ahead = Math.min(Math.round((maxDisplay - 1) / 2), page - 1);%>',
                '<% var after = Math.min(maxDisplay - 1 - ahead, total - page);%>',
                '<% ahead = Math.max(ahead, maxDisplay - 1 - after)%>',
                '<div class="lbf-pagination">',
                //isShowJump
                '<% if(isShowJump) { %>',
                '<div class="lbf-pagination-jump"><input type="text" class="lbf-pagination-input" value="" /><a href="javascript:;" class="lbf-pagination-go">跳转</a></div>',
                '<% } %>',
                //page item list
                '<ul class="lbf-pagination-item-list">',
                //is show first button
                '<% if(isShowFirst) { %>',
                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-first <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==firstText%></a></li>',
                '<% } %>',
                //prev button
                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-prev <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==prevText%></a></li>',
                //headDisplay
                '<% for(var i=1; i<=headDisplay && i<=total; i++){ %>',
                '<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
                '<% } %>',
                //prev ellipsis
                '<% if(page - ahead > i && maxDisplay > 0) { %>',
                '<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
                '<% } %>',
                //all pages
                '<% for(i = Math.max(page - ahead, i); i < page + after + 1 && i <= total && maxDisplay > 0; i++){ %>',
                '<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
                '<% } %>',
                //next ellipsis
                '<% if(page + after < total - tailDisplay && maxDisplay > 0) { %>',
                '<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
                '<% } %>',
                //tailDisplay
                '<% for(i = Math.max(total - tailDisplay + 1, i); i<=total; i++){ %>',
                '<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a>',
                '<% } %>',
                //next button
                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-next <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==nextText%></a></li>',
                //is show last button
                '<% if(isShowLast) { %>',
                '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-last <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==lastText%></a></li>',
                '<% } %>',
                '</ul>',
                '</div>'
            ].join('');

            return new Pagination(settings);

        }

    };
    
    return pagination;
});