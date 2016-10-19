/**
 * @fileOverview
 * @author sqchen
 * @version 1
 * Created: 15-6-3 上午11:26
 */

LBF.define('ui.widget.TimePicker.TimePicker', function(require){
    var $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        TimePickerTemplate = require('ui.widget.TimePicker.TimePickerTemplate');

    require('{theme}/lbfUI/css/TimePicker.css');

    /**
     * Base time picker component
     * @class TimePicker
     * @namespace ui.widget.TimePicker
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Dropdown
     * @constructor
     * @param {Object} opts Options of node
     * @param {String|jQuery|documentElement} opts.trigger The trigger of showing date picker panel
     * @param {String|jQuery|documentElement} [opts.display=opts.trigger] The place to display selected date
     * @param {Date} [opts.viewStartDate=new Date().setDay(1)] The start date of view area
     * @param {String} [opts.timePickerTemplate] The date picker's view port (the main date table) template
     * @param {String} [opts.selectedHour] The selected hour. Format ['5'|'05']
     * @param {String} [opts.selectedMinute] The selected minute. Format ['8'|'08']
     * @example
     *      // Most common one
     *      new TimePicker({
     *          trigger: '#timePickerTrigger',
     *          display: '#timePickerTrigger'
     *      });
     */
    var TimePicker = Dropdown.inherit({
        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-time-picker-btn-prev': 'prevHour',
            'click .lbf-time-picker-btn-next': 'nextHour',
            'click .tbody-hour-mode .lbf-date-picker-time': 'selectHour',
            'click .tbody-minute-mode .lbf-date-picker-time': 'selectTime',
            'click .lbf-date-picker-caption-link': 'toSelHour'
        },

        /**
         * Default render method of component, only to append elem into DOM
         * @method render
         * @param {String|Object} [container=this.get('container')||this.$trigger.parent()] Container of time picker
         * @param {String|jQuery|documentElement} [opts.display=opts.trigger] The place to display selected date
         * @chainable
         * @protected
         */
        render: function (container) {
            Dropdown.prototype.render.apply(this, arguments);

            if(this.get('selectedHour') !== '' && this.get('selectedMinute') !== '') {
                this.display(this.get('selectedHour') + ':' + (this.get('selectedMinute') < 10 ? '0' + (+this.get('selectedMinute')) : this.get('selectedMinute')));
            }
            this.set('defaultHour', this.get('selectedHour'));
            this.addClass('lbf-date-picker lbf-reset');

            this.set('isInit', true);

            this.renderViewPort();

            return this;
        },

        /**
         * Render viewport， the major time table
         * @method renderViewport
         * @chainable
         */
        renderViewPort: function() {
            var that = this;

            if(!this.get('isInit')) {
                return this;
            }

            this.html(this.template(this.get('timePickerTemplate'))(extend({}, this.attributes(), {
                selectMode: that.get('selectMode'),
                selectedHour: that.get('selectedHour'),
                selectedMinute: that.get('selectedMinute'),
                defaultHour: that.get('defaultHour')
            })));
        },

        /**
         * select a hour of the hour-mode
         * @method selectHour
         * @param {Event} event of the currentTarget contains date-hour to be selected
         * @chainable
         * @example
         *      datePicker.selectHour(new Date()); // select this hour
         */
        selectHour: function(e) {
            var target = $(e.target);

            $('.lbf-time-picker-btn-prev, .lbf-time-picker-btn-next').hide();
            target.addClass('lbf-date-picker-time-selected');

            this.set('selectMode', 'minute-mode');
            this.set('selectedHour', target.attr('data-hour'));
            this.renderViewPort();

            return this;
        },

        /**
         * Display selected time in display element
         * @method display
         * @param {String} timeString time value
         * @chainable
         */
        display: function(timeString) {
            var $display = this.$(this.get('display'));
            if(!$display) {
                return this;
            }

            if($display.is('input')) {
                $display.val(timeString);
            } else {
                $display.text(timeString);
            }

            return this;
        },

        /**
         * select a minute of the minute-mode
         * @method selectHour
         * @param {Event} event of the currentTarget contains date-minute to be selected
         * @chainable
         * @example
         *      datePicker.selectHour(new Date()); // select this minute
         */
        selectTime: function(e) {
            var target = $(e.target);

            this.set('selectMode', 'hour-mode');
            this.set('selectedMinute', target.attr('data-minute'));
            this.set('defaultHour', this.get('selectedHour'));
            this.display(target.text());
            this.trigger('selectTime', [target.text()]);

            return this;
        },

        /**
         * set time picker to last year
         * @method prevHour
         * @chainable
         */
        prevHour: function() {
            var selectedHour = this.get('selectedHour');

            selectedHour = selectedHour > 0 ? selectedHour - 1 : 23;
            this.set('selectedHour', selectedHour);
            this.trigger('change:hour', [selectedHour]);
            this.renderViewPort();

            return this;
        },

        /**
         * set time picker to next year
         * @method nextHour
         * @chainable
         */
        nextHour: function() {
            var selectedHour = this.get('selectedHour');

            selectedHour = selectedHour < 23 ? +selectedHour + 1 : 0;
            this.set('selectedHour', selectedHour);
            this.trigger('change:hour', [selectedHour]);
            this.renderViewPort();

            return this;
        },

        /**
         * to select hour
         * @method toSelHour
         * @chainable
         */
        toSelHour: function(e) {
            this.set('selectMode', 'hour-mode');
            this.renderViewPort();

            return this;
        },

        /**
         * Disable time picker
         * @method disable
         * @chainable
         */
        disable : function(){
            this.set('disabled', true);
            this.$(this.get('trigger')).prop('disabled', 'disabled');
            this.hide();

            return this;
        },

        /**
         * Enable time picker
         * @method enable
         * @chainable
         */
        enable : function(){
            this.set('disabled', false);
            this.$(this.get('trigger')).prop('disabled', '');

            return this;
        },

        /**
         * Show time picker panel and update position
         * @method show
         * @chainable
         */
        show: function() {
            this.set('selectMode', 'hour-mode');
            this.renderViewPort();

            return Dropdown.prototype.show.apply(this, arguments);
        },

        hide: function() {
            if(this.get('selectedHour') != this.get('defaultHour')) {
                this.set('selectedHour', this.get('defaultHour'));
            }

            return Dropdown.prototype.hide.apply(this, arguments);
        },

        remove: function(){
            Dropdown.prototype.remove.apply(this, arguments);
        },

        /**
         * Toggle time picker panel and update position
         * @method toggle
         * @chainable
         */
        toggle: function(){
            if(this.get('disabled')){
                return this;
            }

            return Dropdown.prototype.toggle.apply(this, arguments);
        }
    })

    TimePicker.include(extend(true, {}, Dropdown, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            // for dropdown changes, we add width: auto, and height: auto
            width: 'auto',

            height: 'auto',

            //String|Object, Input obj, can be DOM or JQ obj
            display: '',

            isInit: false,

            //default is "hour-mode", ["hour-mode", "minute-mode"]
            selectMode: 'hour-mode',

            //String|Object, Can be a jquery object or DOM object
            trigger: '',

            //The initial disabled state
            disabled: false,

            //set the POSITION of the datePicker
            direction: 'bottom',

            //String, date picker template
            timePickerTemplate: TimePickerTemplate,

            events: {
                //callback of select a minute
                selectTime: function(event, val) {
                    this.toggle();
                },

                //callback of select a hour
                selectHour: function() {},

                //callback of hour changed
                'change:hour': function() {},

                //callback of minute changed
                'change:minute': function() {}
            }
        }
    }));

    return TimePicker;
});