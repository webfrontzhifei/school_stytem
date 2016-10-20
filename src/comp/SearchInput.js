/**
 * User: sqchen
 * Date: 14-12-31
 * Time: 下午15:10
 * 页面上可折叠展开的搜索框组件
 */

LBF.define('qidian.comp.SearchInput', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node');

    var SearchInput = module.exports = Node.inherit({
        // 可折叠展开的搜索框组件类;
        initialize: function(opts) {
			this.mergeOptions(opts);
			this.setElement(this.get('selector'));
			this.initInput();
        },
		
        /**
         * 初始化放大镜按钮和input
         */
        initInput: function() {
            var that = this;

            // 右上角的搜索交互
            var eleSearchIcon = this.$el,
                eleSearchIconId = eleSearchIcon.attr('id'),
                eleSearchInput,
                eleLabelSearch;

            eleSearchIcon.after([
                '<div class="lbf-text-input lbf-search-input" style="display: none;">',
                '    <a href="javascript:;">',
                '        <i class="icon-search">搜索</i>',
                '    </a>',
                '    <input id="' + eleSearchIconId + 'searchInput" placeholder="输入关键词搜索" style="width: 0;">',
                '</div>'
            ].join('')).click(function() {
				$(this).hide();
				eleSearchInput.parent().show();
				
                eleSearchInput.animate({
                    width: 200
                }, "normal", function() {
                    eleLabelSearch.show();  
                });                 
                eleSearchInput.get(0).focus();
            });

            that.$input = eleSearchInput = $('#' + eleSearchIconId + 'searchInput');
            eleLabelSearch = $('label[for=' + eleSearchIconId + 'searchInput' + ']');

            eleSearchInput.bind({
                "focus": function() {
                    $(this).parent().addClass("lbf-text-input-focus");
                },
                "blur": function() {
                    $(this).parent().removeClass("lbf-text-input-focus");
                    if ($.trim(this.value) == "") {
                        eleLabelSearch.hide();
                        $(this).animate({
                            width: 0
                        }, "normal", "", function() {
                            eleSearchIcon.show();
                            eleSearchInput.parent().hide(); 
                        });
                    }
                },
                "keypress": function(e) {
                    that.trigger('keyPressed', this.value);
                    if(e.keyCode === 13) {
						var val = $.trim(this.value);
						that.trigger('search', [val]);
					}
                }
            });

            //添加点击展开后的放大镜触发事件
            eleSearchInput.closest('.lbf-search-input').find('.icon-search').bind({
                "click": function() {
                    that.trigger('click.icon', eleSearchInput.val());
                }
            });
        }
        
    });

});
