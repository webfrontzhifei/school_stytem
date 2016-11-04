LBF.define('qidian.sites.express.MyExpressController', function(require, exports, module) {
	var Controller = require('qidian.comp.PageControllerCosy'),
        $ = require('lib.jQuery'),
        TextInput = require('qidian.comp.TextInput'),
        REST = require('qidian.comp.REST'),
        LightTip = require('qidian.comp.LightTip'),
        Grid = require('qidian.comp.Grid'),
        ICheckbox = require('ui.widget.ICheckbox.ICheckbox'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');
        
    var initData = {};
    var dropDownTpl = [
    		 '<ul>',
                    '<li><div class="btn-batch"><i class="icon-srv"></i>薛安荣</div></li>',
                    '<li><div class="btn-batch"><i class="icon-srv"></i>刘星星</div></li>',
              '</ul>'
    	].join('');
	module.exports = exports = Controller.extend( {
		el: 'body',
		elements: {
            '$setBtn': '#btnSetDelegateUser'
        },
		initialize: function(options) {
			var self = this;
			
			this.grid = new Grid({
 				container: '#list',
	            itemsPerPage: 10,
	            hasCheckboxCol: true,
	            loadFirstPage: false,
	            initData:options,
	            current_page_name: 'index',
	            items_per_page_name: 'count',
	            events:{
	            	onFillData: function(data, table,callback) {
	            		var list = data.list,
	            			listItem;
	            		for(var i = 0,len = list.length;i<len; i++ ) {
	            			listItem = list[i];
	            			if(typeof( listItem['data-grid-id'] == 'undefind')) {
	            				listItem['data-grid-id'] = listItem.id;
	            			}
	            			callback && callback(listItem);
	            		}
	            	},
	            	onCheck: function() {
	            		
	            	}
	            },

			});
			
			this.suggestListDropdown = new Dropdown({
				trigger: '#txtDelegateUser',
				className: 'suggest-dropdown',
				container: 'body',
				content: self.template(dropDownTpl)(),
                    events: {
                        load: function(){
                            this.$el.css('minWidth',this.$trigger.outerWidth(true)-10);
                        }
                    },
                    adjust: {
                        y: 0
                    },
                    show: {
                        delay: 0,
                        mode: 'click',
                        effect: function(){
                           // if(!this.$trigger.hasClass('highlight')) return;
                           // this.$el.find('.btn-batch').addClass('highlight').removeClass('disabled');
                           
                           this.show();
                        }
                    },
                    hide: {
                        delay: 10
                    }
			})
		}

		
	});
});