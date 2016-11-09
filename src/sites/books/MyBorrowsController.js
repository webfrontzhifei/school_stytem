LBF.define('qidian.sites.books.MyBorrowsController', function(require, exports, module) {
	var Controller = require('qidian.comp.PageControllerCosy'),
        $ = require('lib.jQuery'),
        TextInput = require('qidian.comp.TextInput'),
        REST = require('qidian.comp.REST'),
        LightTip = require('qidian.comp.LightTip'),
        Grid = require('qidian.comp.Grid'),
        ICheckbox = require('ui.widget.ICheckbox.ICheckbox'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');
        

    // var targetIds = [];
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
	            	onCheck: function(target) {
	            		// targetIds.push(target.id);
	            	}
	            },

			});
		}
	});
});