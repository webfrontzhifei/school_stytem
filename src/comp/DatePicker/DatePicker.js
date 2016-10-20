/**
 * Created by byronbinli.
 * Date: 16/6/13.
 * Time: 13:11.
 * Content:
 * Related to DatePickerRange.
 *
 */
/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-13 下午4:36
 */

LBF.define('qidian.comp.DatePicker.DatePicker', function (require) {
    var proxy = require('lang.proxy'),
        forEach = require('lang.forEach'),
        isNumber = require('lang.isNumber'),
        dateTool = require('lang.dateTool'),
        extend = require('lang.extend'),
        contains = require('util.contains'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        DatePickerTemplate = require('qidian.comp.DatePicker.DatePickerTemplate');

    require('{theme}/lbfUI/css/DatePicker.css');

    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    //the optional position of the datepicker
    var DIRECTION_UP = 'top',
        DIRECTION_RIGHT = 'right',
        DIRECTION_DOWN = 'bottom',
        DIRECTION_LEFT = 'left';

    var DATE_MODE = 'date-mode',
        MONTH_MODE = 'month-mode',
        YEAR_MODE = 'year-mode';

    var SELECT_MODE = [DATE_MODE, MONTH_MODE, YEAR_MODE];


    /**
     * Base date picker component
     * @class DatePicker
     * @namespace ui.widget.DatePicker
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Dropdown
     * @constructor
     * @param {Object} opts Options of node
     * @param {Date} [opts.date=new Date()] Selected date
     * @param {Date} [opts.startDate] Start date of limited date range
     * @param {Date} [opts.endDate=new Date('2999/12/31'] End date of limited date range
     * @param {String|jQuery|documentElement} opts.trigger The trigger of showing date picker panel
     * @param {String|jQuery|documentElement} [opts.display=opts.trigger] The place to display selected date
     * @param {Number} [opts.monthStep=1] The num of months showed in one time
     * @param {String} [opts.format='Y-m-d'] The format of displaying selected date. Format styles @see lang.dateTool.format
     * @param {Date} [opts.viewStartDate=new Date().setDay(1)] The start date of view area
     * @param {String} [opts.wrapTemplate] The date picker's wrapTemplate
     * @param {String} [opts.datePickerTemplate] The date picker's view port (the main date table) template
     * @param {Date[]} [opts.highlightDates] The highlighted dates
     * @example
     *      // Most common one
     *      new DatePicker({
     *          date: new Date(),
     *          startDate: +new Date() - 7*24*3600*1000, // 7 days ago
     *          endDate: +new Date() + 7*24*3600*1000 // 7 days later
     *      });
     *
     * @example
     *      // DatePicker with assigned trigger
     *      new DatePicker({
     *          trigger: 'triggerElementSelector',
     *          format: 'y-m-d', // see lang.dateTool.format
     *      });
     *
     * @example
     *      // DatePicker with multiple month views
     *      new DatePicker({
     *          monthStep: 3
     *      });
     *
     * @example
     *      // DatePicker with highlight days
     *      new DatePicker({
     *          highlightDates: [new Date(), +new Date() + 24*3600*1000]
     *      });
     */
    var DatePicker = Dropdown.inherit({
        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            // in selecting day mode, last month and next month
            'click .lbf-date-picker-btn-prev.date-mode': 'lastMonth',
            'click .lbf-date-picker-btn-next.date-mode': 'nextMonth',

            // in selecting month mode, last year and next year
            'click .lbf-date-picker-btn-prev.month-mode': 'lastYear',
            'click .lbf-date-picker-btn-next.month-mode': 'nextYear',

            // in selecting year mode, last decade and next decade
            'click .lbf-date-picker-btn-prev.year-mode': 'lastDecade',
            'click .lbf-date-picker-btn-next.year-mode': 'nextDecade',

            // in selecting decade mode, last century and next century
            'click .lbf-date-picker-btn-prev.decade-mode': 'lastCentury',
            'click .lbf-date-picker-btn-next.decade-mode': 'nextCentury',

            // in day mode ,select a date
            'click .lbf-date-picker-date-enabled': 'selectDate',

            // in month mode, select a month
            'click .lbf-date-picker-month-enabled': 'selectMonth',

            // in year mode, select a year
            'click .lbf-date-picker-year-enabled': 'selectYear',

            //click on table caption
            'click .lbf-date-picker-caption-link': 'showUpLevel'
        },

        /**
         * Overwritten mergeOptions method
         * @method mergeOptions
         * @chainable
         */
        mergeOptions: function (opts) {

            // notice that we should add the 'silence: true' param
            this.set(extend(true, {}, this.constructor.settings, opts), {silence: true});

            //make them all date object
            this.set('date', new Date(+this.get('date')));
            this.set('startDate', new Date(+this.get('startDate')));
            this.set('endDate', new Date(+this.get('endDate')));

            if (!this.get('viewStartDate')) {
                this.set('viewStartDate', new Date(+this.get('date')));
            }

            // //set ipunt to "readOnly" or not.
            if (this.get('readOnly')) {
                if(this.$(this.get('trigger')).find('input').length){
                    this.$(this.get('trigger')).find('input').prop('readOnly', 'readOnly');
                    this.$(this.get('trigger')).find('input').attr('unselectable', 'on');//for IE8 no arrow
                }else{
                    this.$(this.get('trigger')).prop('readOnly', 'readOnly');
                    this.$(this.get('trigger')).attr('unselectable', 'on');//for IE8 no arrow
                }
            }


            return this;
        },

        /**
         * Overwritten setElement method to bind default validator and event action before setting up attributes
         */
        setElement: function () {
            this.superclass.prototype.setElement.apply(this, arguments);

            this
                .defaultValidate();

            return this;
        },

        /**
         * Default render method of component, only to append elem into DOM
         * @method render
         * @param {String|Object} [container=this.get('container')||this.$trigger.parent()] Container of date picker
         * @chainable
         * @protected
         */
        render: function (container) {
            if (container) {
                this.set('container', this.$(container));
            }

            Dropdown.prototype.render.apply(this, arguments);

            this.addClass('lbf-date-picker lbf-reset');

            this.set('isInit', true);
            this.renderViewPort();

            return this;
        },

        /**
         * Render viewport， the major date table
         * @method renderViewport
         * @chainable
         */
        renderViewPort: function () {
            var node = this;

            if (!this.get('isInit')) {
                return this;
            }


            this.html(this.template(this.get('datePickerTemplate'))(extend({}, this.attributes(), {
                // template helper

                dateFormat: dateTool.format,

                isLeapYear: dateTool.isLeapYear,

                DAYS_IN_MONTH: DAYS_IN_MONTH,

                nextDay: dateTool.nextDay,

                dateInstance: new Date,

                viewStartDateInstance: new Date(this.get('viewStartDate')),

                isHighlighted: function (currentDate) {
                    var flag = false;
                    forEach(node.get('highlightDates'), function () {
                        var curDate = new Date(currentDate),
                            thisDate = new Date(this);
                        if (curDate.getFullYear() === thisDate.getFullYear() && curDate.getMonth() === thisDate.getMonth() && curDate.getDate() === thisDate.getDate()) {
                            flag = true;
                            return false;
                        }
                    });

                    return flag;
                },

                isDayEnabled: proxy(this.isEnabledDate, this),

                isMonthEnabled: proxy(this.isEnabledYearMonth, this),

                isYearEnabled: proxy(this.isEnabledYear, this),

                isDaySelected: function (currentDate) {
                    var currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
                        tmpDate = node.get('date');
                    tmpDate = new Date(tmpDate.getFullYear(), tmpDate.getMonth(), tmpDate.getDate());
                    return dateTool.isSameDay(currentDate, tmpDate);
                },

                isMonthSelected: function (currentDate) {
                    var date = node.get('date');
                    return date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth();
                },

                isYearSelected: function (currentDate) {
                    var date = node.get('date');
                    return date.getFullYear() === currentDate.getFullYear();
                },

                getDecadeRange: function (currentDate) {
                    var year = +currentDate.getFullYear(),
                        range = {};

                    //the text showed in the caption of the year-mode
                    range.rangeText = (year - year % 10) + '-' + (year - year % 10 + 9);

                    //the start year of the year-mode, startYear needs to minus 1 and endYear need to plus 10 for we want to get 12 years (4X3)
                    range.startYear = year - year % 10 - 1;
                    range.endYear = year - year % 10 + 10;
                    return range;
                }

            })));

            // if (this.get('startDate')!=new Date(0)||this.get('endDate') != new Date('2999/12/31')) {
            //     var preArrow = this.find('.lbf-date-picker-btn-prev'),
            //         nextArrow = this.find('.lbf-date-picker-btn-next'),
            //         tempDataArr;
            //     if (this.find('.lbf-date-picker-btn-prev').hasClass('date-mode')) {
            //         tempDataArr = this.find('.lbf-date-picker-date-num');
            //         if (this.$(tempDataArr[0]).hasClass('lbf-date-picker-date-disabled')) {
            //             preArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //         if (this.$(tempDataArr[tempDataArr.length - 1]).hasClass('lbf-date-picker-date-disabled')) {
            //             nextArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //
            //     } else if (this.find('.lbf-date-picker-btn-prev').hasClass('month-mode')) {
            //         tempDataArr = this.find('.lbf-date-picker-month');
            //         if (this.$(tempDataArr[0]).hasClass('lbf-date-picker-month-disabled')) {
            //             preArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //         if (this.$(tempDataArr[tempDataArr.length - 1]).hasClass('lbf-date-picker-month-disabled')) {
            //             nextArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //
            //     } else if (this.find('.lbf-date-picker-btn-prev').hasClass('year-mode')) {
            //         tempDataArr = this.find('.lbf-date-picker-year-disabled');
            //         if (this.$(tempDataArr[0]).hasClass('lbf-date-picker-year-first')) {
            //             preArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //         if (this.$(tempDataArr[tempDataArr.length - 1]).hasClass('lbf-date-picker-year-last')) {
            //             nextArrow.addClass('lbf-date-picker-btn-disabled');
            //         }
            //
            //     }
            //
            // }
            //To judge whether we need to disable the left&right arrow.

            if (this.get('startDate') != new Date(0) || this.get('endDate') != new Date('2999/12/31')) {
                var preArrow = this.find('.lbf-date-picker-btn-prev'),
                    nextArrow = this.find('.lbf-date-picker-btn-next'),
                    tempDataArr, firstDay, lastDay, tmplastDay, daysThisMonth;
                if (this.find('.lbf-date-picker-btn-prev').hasClass('date-mode')) {
                    firstDay = new Date(this.get('viewStartDate'));
                    if (firstDay < this.get('startDate') || dateTool.isSameDay(firstDay, this.get('startDate'))) {
                        preArrow.addClass('lbf-date-picker-btn-disabled');
                    }
                   lastDay = firstDay;
                    tmplastDay = lastDay.getFullYear() + '/' + (firstDay.getMonth()+1);
                    daysThisMonth = dateTool.isLeapYear(lastDay) && lastDay.getMonth() === 1 ? 29 : DAYS_IN_MONTH[lastDay.getMonth()];
                    lastDay = new Date(tmplastDay + '/' + daysThisMonth);
                    if (lastDay > this.get('endDate') || dateTool.isSameDay(lastDay, this.get('endDate'))) {
                        nextArrow.addClass('lbf-date-picker-btn-disabled');
                    }
                } else if (this.find('.lbf-date-picker-btn-prev').hasClass('month-mode')) {

                    firstDay = new Date(this.get('viewStartDate'));
                    // var firstMonth =firstDay.getFullYear()+'/01/01';
                    // console.log(new Date(firstMonth));
                    if(new Date(firstDay.getFullYear()+'/01/01')<this.get('startDate')){
                        preArrow.addClass('lbf-date-picker-btn-disabled');
                    }
                    if(new Date(firstDay.getFullYear()+'/12/31')>this.get('endDate')){
                        nextArrow.addClass('lbf-date-picker-btn-disabled');
                    }


                } else if (this.find('.lbf-date-picker-btn-prev').hasClass('year-mode')) {
                    tempDataArr = this.find('.lbf-date-picker-year-disabled');
                    if (this.$(tempDataArr[0]).hasClass('lbf-date-picker-year-first')) {
                        preArrow.addClass('lbf-date-picker-btn-disabled');
                    }
                    if (this.$(tempDataArr[tempDataArr.length - 1]).hasClass('lbf-date-picker-year-last')) {
                        nextArrow.addClass('lbf-date-picker-btn-disabled');
                    }

                }

            }


            return this;
        },

        /**
         *  Default validate for attribute
         *  @protected
         *  @chainable
         */
        defaultValidate: function () {
            this.addValidate(function (attrs) {
                var date = attrs.date,
                    monthStep = attrs.monthStep;

                if (dateTool.daysBetween(date, attrs.startDate) > 0 || dateTool.daysBetween(date, attrs.endDate) < 0) {
                    this.trigger && this.trigger('error', [new Error('DatePicker: date option should be between startDate and endDate!')]);
                    return false;
                }

                if (!isNumber(monthStep) || monthStep < 1) {
                    this.trigger && this.trigger('error', [new Error('DatePicker: invalid monthStep. MonthStep should be numeric and bigger than 1.')]);
                    return false;
                }
            });

            return this;
        },

        /**
         * Default option change actions
         * @protected
         * @chainable
         */
        defaultActions: function () {
            var node = this;

            this
                .bind('change:format', function () {
                    node.display();
                })
                .bind('change:date', function () {
                    var viewStartDate = new Date(node.get('date'));
                    node.set('viewStartDate', viewStartDate);
                    node.display();
                    node.renderViewPort();
                })
                .bind('change:startDate', function (event, value) {

                    if (node.get('date') < value) {
                        node.set('date', value);
                        node.set('viewStartDate', node.get('viewStartDate'));
                        return;
                    }

                    node.renderViewPort();
                })
                .bind('change:endDate', function (event, value) {

                    if (node.get('date') > value) {
                        node.set('date', value);
                        node.set('viewStartDate', node.get('viewStartDate'));
                        return;
                    }

                    node.renderViewPort();
                })
                .bind('change:trigger', function () {
                    var $trigger = node.$trigger = node.$(node.get('trigger'));

                    $trigger.focus(function () {
                        $trigger.blur();
                        node.toggle();
                    });
                })
                .bind('change:display', function () {

                    node.$display = node.$(node.get('display'));
                    node.display();
                })
                .bind('change:datePickerTemplate', function () {
                    node.datePickerTemplate = node.template(node.get('datePickerTemplate'));
                })
                .bind('change:viewStartDate', function () {
                    // make a copy
                    var viewStartDate = Math.min(Math.max(+node.get('viewStartDate'), +node.get('startDate')), +node.get('endDate'));
                    viewStartDate = new Date(viewStartDate);

                    // set to first day of the month
                    viewStartDate.setDate(1);

                    node.set('viewStartDate', viewStartDate, {silence: true});

                    node.renderViewPort();
                })
                .bind('change:wrapTemplate', function () {
                    node.render();
                })
                .bind('change:selectMode', function () {
                    //trigger currentMode event
                    var crtMode = node.get('selectMode');
                    node.trigger(crtMode, [crtMode]);

                    node.renderViewPort();
                })
                .bind('change:highlightDates', function () {
                    node.renderViewPort();
                })
                .bind('change:discreteDates', function () {
                    node.renderViewPort();
                });

            // because dropDown will close the panel automatically.
            // we stop the click events from propagation
            this.click(function (e) {
                e.stopPropagation();
            });

            return this;
        },

        /**
         * Display selected date in display element
         * @method display
         * @chainable
         */
        display: function () {
            var $display = this.$(this.get('display'));
            if (!$display) {
                return this;
            }

            var dateString = dateTool.format(this.get('format'), this.get('date'));
            if ($display.is('input')) {
                $display.val(dateString);
            } else {
                $display.text(dateString);
            }

            return this;
        },

        /**
         * select a date of the date-mode
         * @method selectDate
         * @param {Date|Event} date Date or event of which currentTarget contains data-date to be selected
         * @chainable
         * @example
         *      datePicker.selectDate(new Date()); // select today
         */
        selectDate: function (date) {
            if (date.currentTarget) {
                date = new Date(parseInt(this.$(date.currentTarget).data('date'), 10));
            }

            // select
            var lastDate = this.get('date');
            this.set('date', date);
            this.trigger('selectDate', [lastDate]);

            return this;
        },

        /**
         * select a month of the month-mode
         * @method selectMonth
         * @param {Date|Event} date Date or event of the currentTarget contains date-month to be selected
         * @chainable
         * @example
         *      datePicker.selectMonth(new Date()); // select this month
         */
        selectMonth: function (date) {
            if (date.currentTarget) {
                date = new Date(parseInt(this.$(date.currentTarget).data('month'), 10));
            }

            //select
            this.set('selectMode', DATE_MODE, {silent: true});

            var lastDate = this.get('viewStartDate');
            this.set('viewStartDate', date);
            this.trigger('selectMonth', [lastDate]);
            if (dateTool.isSameDay(lastDate, date)) {
                this.trigger('change:month', [lastDate]);
            }
            return this;
        },

        /**
         * select a year of the decade
         * @method selectYear
         * @param {Date|Event} date date or event of the currentTarget contains date-year to be selected
         * @chainable
         * @example
         *      datePicker.selectYear(new Date()); // select this year
         */
        selectYear: function (date) {
            if (date.currentTarget) {
                date = new Date(parseInt(this.$(date.currentTarget).data('year'), 10));
            }

            //select
            this.set('selectMode', MONTH_MODE, {silent: true});

            var lastDate = this.get('viewStartDate');
            this.set('viewStartDate', date);
            this.trigger('selectYear', [lastDate]);
            return this;
        },

        /**
         *  by click the caption to show up the up level of the date picker,
         *  if current level is date-mode, the up level is month-mode date picker
         *  @method showUpLevel
         *
         */
        showUpLevel: function () {
            var modeIndex = 0,
                node = this;
            forEach(SELECT_MODE, function (mode, index) {
                if (mode === node.get('selectMode')) {
                    modeIndex = index;
                    return false;
                }
            });

            if (modeIndex === SELECT_MODE.length - 1) {
                return;
            }

            this.set('selectMode', SELECT_MODE[modeIndex + 1]);
        },

        /**
         * Set date picker to previous month
         * @method lastMonth
         * @chainable
         */
        lastMonth: function (e) {
            // if()
            // console.log(e.target||e.srcElement);
            var tar=e.target||e.srcElement;
            if(this.$(tar).hasClass('lbf-date-picker-btn-disabled')){
                return;
            }
            var viewStartDate = this.get('viewStartDate');
            this.set('viewStartDate', dateTool.lastMonth(viewStartDate));
            this.trigger('change:month', [viewStartDate]);
            return this;
        },

        /**
         * Set date picker to next month
         * @method nextMonth
         * @chainable
         */
        nextMonth: function (e) {
            var tar=e.target||e.srcElement;
            if(this.$(tar).hasClass('lbf-date-picker-btn-disabled')){
                return;
            }
            var viewStartDate = this.get('viewStartDate');
            this.set('viewStartDate', dateTool.nextMonth(viewStartDate));
            this.trigger('change:month', [viewStartDate]);
            return this;
        },

        /**
         * set date picker to last year
         * @method lastYear
         * @chainable
         */
        lastYear: function (e) {
            var tar=e.target||e.srcElement;
            if(this.$(tar).hasClass('lbf-date-picker-btn-disabled')){
                return;
            }
            var viewStartDate = this.get('viewStartDate');
            this.set('viewStartDate', dateTool.lastYear(viewStartDate));
            this.trigger('change:year', [viewStartDate]);
            return this;
        },

        /**
         * set date picker to next year
         * @method nextYear
         * @chainable
         */
        nextYear: function (e) {
            var tar=e.target||e.srcElement;
            if(this.$(tar).hasClass('lbf-date-picker-btn-disabled')){
                return;
            }
            var viewStartDate = this.get('viewStartDate');
            this.set('viewStartDate', dateTool.nextYear(viewStartDate));
            this.trigger('change:year', [viewStartDate]);
            return this;
        },

        /**
         * set date picker to last decade
         * @method lastDecade
         * @chainable
         */
        lastDecade: function () {
            var viewStartDate = this.get('viewStartDate'),
                lastDecade = function (date) {
                    var clonedDate = new Date(+date);
                    clonedDate.setYear(date.getFullYear() - 10);

                    return clonedDate;
                };
            this.set('viewStartDate', lastDecade(viewStartDate));
            this.trigger('change:decade', [viewStartDate]);
            return this;
        },

        /**
         * set date picker to next decade
         * @method nextDecade
         * @chainable
         */
        nextDecade: function () {
            var viewStartDate = this.get('viewStartDate'),
                nextDecade = function (date) {
                    var clonedDate = new Date(+date);
                    clonedDate.setYear(date.getFullYear() + 10);

                    return clonedDate;
                };

            this.set('viewStartDate', nextDecade(viewStartDate));
            this.trigger('change:decade', [viewStartDate]);
            return this;
        },

        /**
         * Disable date picker
         * @method disable
         * @chainable
         */
        disable: function () {
            this.set('disabled', true);
            this.$(this.get('trigger')).prop('disabled', 'disabled');
            this.hide();

            return this;
        },

        /**
         * Enable date picker
         * @method enable
         * @chainable
         */
        enable: function () {
            this.set('disabled', false);
            this.$(this.get('trigger')).prop('disabled', '');

            return this;
        },

        /**
         * If the array "discreteDates" is set, we judge the date is enabled or not by whether it's in the array.
         * else if the array is empty, we judge the date is enable or not by whether it's between start date and end date
         * @method isEnabledDate
         * @param {Date} date
         * @param {Boolean} ignoreDiscreteDates . this parameter is internally used by isEnabledYearMonth
         * @return {Boolean}
         * @example
         *      datePicker.isEnabledDate(new Date()); // check if the date is available ( between start date and end date )
         */
        isEnabledDate: function (date, ignoreDiscreteDates) {
            var startDate = this.get('startDate'),
                endDate = this.get('endDate'),
                discreteDatesIsSet = this.get('discreteDates') != null;

            ignoreDiscreteDates = typeof ignoreDiscreteDates === 'undefined' ? false : ignoreDiscreteDates;
            date = +date;

            if (discreteDatesIsSet && !ignoreDiscreteDates) {
                //judge by the discreteDates
                var isSameDay = false,
                    discreteDates = this.get('discreteDates');

                forEach(discreteDates, function (day) {
                    if (dateTool.isSameDay(day, date)) {
                        isSameDay = true;
                        return false;
                    }
                });
                return isSameDay;
            } else {
                //judge by the startDate and endDate
                // startDate and date maybe in the same day.but the startDate's timestamp is larger than date's timestamp in sometimes.
                // the same for endDate
                return (!startDate || !endDate) || (+startDate <= date && +endDate >= date) || (dateTool.isSameDay(startDate, date) || dateTool.isSameDay(endDate, date));
            }
        },

        /**
         * is any day of this month between the start date and end date
         * note that this method is to check if 'year-month' (exg: 2013-11) is bwtween the start date and end date.
         * @method isEnabledYearMonth
         * @param {Date} date
         * @return {Boolean}
         * @example
         *      datePicker.isEnabledYearMonth(new Date()); //check if this month of this year is available (between start date and end date)
         */
        isEnabledYearMonth: function (date) {
            var cloneDate = new Date(date),
                startDate = this.get('startDate'),
                endDate = this.get('endDate'),
                firstDayOfMonth,
                lastDayOfMonth,
            // when we judge the whether the year-month (2013-10) is enabled, we ignore the array ignoreDiscreteDates
                ignoreDiscreteDates = true;

            date.setDate(1);
            firstDayOfMonth = date;

            cloneDate.setDate(1);
            cloneDate.setMonth(cloneDate.getMonth() + 1);
            lastDayOfMonth = cloneDate.setDate(0);

            return this.isEnabledDate(firstDayOfMonth, ignoreDiscreteDates) || this.isEnabledDate(lastDayOfMonth, ignoreDiscreteDates) ||
                (startDate.getFullYear() === date.getFullYear && startDate.getMonth() === date.getMonth()) ||
                (endDate.getFullYear() === date.getFullYear() && endDate.getMonth() === date.getMonth());
        },

        /**
         * is any day of this year between the start date and end date
         * @method isEnabledYear
         * @param {Date} date
         * @return {Boolean}
         * @example
         *      datePicker.isEnabledYear(new Date()); // check if this year is available (between start date and end date)
         */
        isEnabledYear: function (date) {
            var cloneDate = new Date(date),
                startDate = this.get('startDate'),
                endDate = this.get('endDate'),
                firstMonthOfYear,
                lastMonthOfYear;

            date.setDate(1);
            date.setMonth(0);
            firstMonthOfYear = date;

            cloneDate.setDate(1);
            cloneDate.setMonth(11);
            lastMonthOfYear = cloneDate;

            return this.isEnabledYearMonth(firstMonthOfYear) || this.isEnabledYearMonth(lastMonthOfYear) ||
                (startDate.getFullYear() === date.getFullYear()) || (endDate.getFullYear() === date.getFullYear())

        },

        /**
         * Show date picker panel and update position
         * @method show
         * @chainable
         */
        show: function () {
            if (this.get('disabled')) {
                return this;
            }

            return Dropdown.prototype.show.apply(this, arguments);
        },

        /**
         * Toggle date picker panel and update position
         * @method toggle
         * @chainable
         */
        toggle: function () {
            if (this.get('disabled')) {
                return this;
            }

            return Dropdown.prototype.toggle.apply(this, arguments);
        }
    });

    DatePicker.include(extend(true, {}, Dropdown, {
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

            format: 'Y-m-d',

            monthFormat: 'Y-m',

            yearFormat: 'Y',

            isInit: false,

            //set the readOnly property default true.
            readOnly: true,


            //default is "date-mode", ["date-mode", "month-mode", "year-mode"]
            selectMode: DATE_MODE,

            //String|Object, Container which the date picker render to
//                container : '',

            //String|Object, Can be a jquery object or DOM object
            trigger: '',

            //integer, Number of months to step back/forward
            monthStep: 1,

            //The initial disabled state
            disabled: false,

            //set the POSITION of the datePicker
            direction: DIRECTION_DOWN,

            //Date, Selected date
            date: new Date(),

            //Date, The earliest selectable date
            startDate: new Date(0),

            //Date, The latest selectable date
            endDate: new Date('2999/12/31'),

            //Array, highlightDates: [ new Date(), +new Date() + 7*24*3600*1000]
            highlightDates: [],


            //Array, discreteDates: [ new Date(), +new Date() + 7*24*3600*1000]
            //this value is set to null by default if users don't pass in a highlightDates value.
            //if users want to use this value and want to set all dates to be disabled, an empty array (i.e. []) must be passed in
            discreteDates: null,

            //String, date picker template
            datePickerTemplate: DatePickerTemplate,

            events: {
                //callback of select a date, toggle the datepicker
                selectDate: function () {
                    this.toggle();
                },

                //callback of select a month
                selectMonth: function () {
                },

                //callback of select a year
                selectYear: function () {
                },

                //callback of month changed
                'change:month': function () {
                },

                //callback of year changed
                'change:year': function () {
                },

                //callback of decade changed
                'change:decade': function () {
                }
            }
        }
    }));

    return DatePicker;
});
