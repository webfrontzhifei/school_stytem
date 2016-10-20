LBF.define('qidian.sites.ListController', function(require, exports, module) {
	var TextInput = require('qidian.comp.TextInput');

	module.exports = exports = Controller.extend( {
		el: 'body',
		initialize: function(options) {
			var self = this;
			//初始化搜索框
            self.searchInput = new TextInput({
                selector: '#searchInput',
                events: {
                    load: function(){
                        var $this = this;
                        $this.$el.find('.icon-search').click(function(){
                            self.doSearch($this.val().trim());
                        });
                    },
                    keypress: function(e){
                        if(e.keyCode === 13) {
                            self.doSearch(this.val().trim());
                        }
                    }/*,
                    blur: function(e,v){
                       self.doSearch(this.val().trim());
                    }*/
                }
            });
		}
	})
})