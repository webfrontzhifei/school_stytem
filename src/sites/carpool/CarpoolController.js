LBF.define('qidian.sites.carpool.CarpoolController', function(require, exports, module) {
	var Controller = require('qidian.comp.PageControllerCosy'),
        $ = require('lib.jQuery'),
        TextInput = require('qidian.comp.TextInput'),
        REST = require('qidian.comp.REST'),
        LightTip = require('qidian.comp.LightTip'),
        Grid = require('qidian.comp.Grid'),
        ICheckbox = require('ui.widget.ICheckbox.ICheckbox'),
        DatePicker = require('ui.widget.DatePicker.DatePicker'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');
        

    // var targetIds = [];
	module.exports = exports = Controller.extend( {
		el: 'body',
		elements: {
            '$picktime': '#picktime'
        },
		initialize: function(options) {
			var self = this;
			
			this.$datePicker = new DatePicker({
				trigger: '#picktime',
				width: 'auto',
				height: 'auto',
				date: new Date(),
				startDate: new Date(),
				endDate: new Date()
			});
		}
	});
});