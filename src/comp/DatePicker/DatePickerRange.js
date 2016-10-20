/**
 * Created by byronbinli.
 * Date: 16/6/13.
 * Time: 11:32.
 * Content:
 *
 * http://tapd.oa.com/TencentNewBiz/prong/stories/view/1010109441057829755?from=tapdjumper
 * 1. add readOnly configuration
 * 2. disabled arrow cannot be clicked any more, as well as no hover status(or a different status)
 * 3. change  disabled font color to #1e2330 opacity 0.38
 * 4. change black font to #1e2330
 */
/**
 * DatePickerRange
 * @overview
 * @author patrickliu
 * @create 6/23/14
 */
LBF.define('qidian.comp.DatePicker.DatePickerRange', function (require, exports, module) {
    var DatePicker = require('qidian.comp.DatePicker.DatePicker'),
        extend = require('lang.extend'),
        proxy = require('lang.proxy'),
        Popup = require('ui.Nodes.Popup'),
        dateTool = require('lang.dateTool'),
        datePickerTemplate = require('qidian.comp.DatePicker.DatePickerRangeTemplate');


    var RANGE_CLASS_HASH = {
        'today': 'lbf-date-picker-date-selected',
        'first': 'lbf-date-picker-date-first',
        'between': 'lbf-date-picker-date-between',
        'last': 'lbf-date-picker-date-last'
    };

    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // mm in one day
    var ONE_DAY_MM = 1000 * 60 * 60 * 24;

    /**
     * a range datepicker for date range select in datepicker
     * the monthstep is at least 2
     * @class DatePickerRange
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.DatePicker
     * @constructor
     * @example
     *      // simplest example
     *      new DatePickerRange({
     *          trigger: 'someTrigger',
     *          display: 'someInput or text container'
     *      });
     *
     *      // customize variables and events
     *      new DatePickerRange({
     *          trigger: 'someTrigger',
     *          display: 'someInput or text container',
     *
     *          // customize in the below
     *          // suggest to be at least 2 in datePickerRange for convenient selection
     *          monthStep: 2,
     *
     *          // we can customize the shown text in the display by set the rangeStartDateFormat
     *          // rangeDateFormatConcat and rangeEndDateFormat, they can concated as
     *          // "rangeStartDateFormat" + "rangeDateFormatConcat" + "rangeEndDateFormat".
     *          rangeStartDateFormat: 'Y-m-d',
     *          rangeDateFormatConcat: ' to ',
     *          rangeEndDateFormat: 'Y-m-d',
     *
     *          // we can also customize the datePickerTemplate, but it's not suggested.
     *          datePickerTemplate: "txt in artTemplate format',
     *
     *          // we can initial the datePickerRange with the rangeStartDate and rangeEndDate
     *          // if the rangeStartDate is bigger than the rangeEndDate, we will automatically switch the value
     *          rangeStartDate : new Date() || '1403749868311',
     *          rangeEndDate: new Date() || '1403749868311'
     *
     *          // events that can be listened to
     *          events: {
     *
     *              // after click the confirm button, we will trigger the 'confirmHide' event
     *              // let the user to deal with the action to hide or do something else
     *              // we have set the confirmHide to hide by default.
     *              // if you accept the action, just DONOT add this event
     *              'confirmHide': function() {
     *                  // do your things here
     *              },
     *
     *              // after click the cancel button, we will trigger the 'cancelHide' event
     *              // let the user to deal with the action to hide or do something else
     *              // we have set the cancelHide to hide by default.
     *              // if you accept the action, just DONOT add this event
     *              'cancelHide': function() {
     *                  // do your things here
     *              },
     *
     *              // when the rangeEndDate is selected and click the confirm button, we will trigger the 'rangeEndSelected' event
     *              // and pass the lastRangeStartDate and lastRangeEndDate value.
     *              // If the lastRangeStartDate or lastRangeEndDate is null, that means this value doesn't
     *              // change after 'rangeEndSelected' triggered.
     *              // If you want to get the current value of rangeStartDate and rangeEndDate,
     *              // just use this.get('rangeStartDate') and this.get('rangeEndDate')
     *              'rangeEndSelected': function(e, lastRangeStartDate, lastRangeEndDate) {
     *                  // do your things here
     *              }
     *
     *              // when the rangeStartDate is selected, we will trigger the 'rangeStartSelected' event
     *              // and pass the lastRangeStartDate and lastRangeEndDate value.
     *              'rangeStartSelected': function(e, lastRangeStartDate, lastRangeEndDate) {
     *                  // do your things here
     *              }
     *          }
     *
     *      });
     *
     */
    module.exports = exports = DatePicker.inherit({

        // clickedTimes, if it's even, toggle the datepicker
        __clickedTimes: 0,

        events: extend({}, DatePicker.prototype.events, {
            'click .lbf-date-picker-buttons .lbf-button.confirm': 'confirm',
            'click .lbf-date-picker-buttons .lbf-button.cancel': 'cancel'
        }),

        /**
         * override the mergeOptions in DatePicker
         * @method mergeOptions
         * @param opts user passed options
         * @chainable
         * @returns {DatePickerRange}
         */
        mergeOptions: function (opts) {

            DatePicker.prototype.mergeOptions.apply(this, arguments);

            // fault tolerant for the rangeStartDate and rangeEndDate
            // set them to date object
            var rangeStartDate = new Date(+this.get('rangeStartDate')),
                rangeEndDate = new Date(+this.get('rangeEndDate'));

            this.set('rangeStartDate', +rangeStartDate < +rangeEndDate ? rangeStartDate : rangeEndDate, {silence: true});
            this.set('rangeEndDate', +rangeEndDate > +rangeStartDate ? rangeEndDate : rangeStartDate, {silence: true});

            this.set({
                oldRangeStartDate: this.get('rangeStartDate'),
                oldRangeEndDate: this.get('rangeEndDate')
            }, {
                silence: true
            });

            return this;

        },

        /**
         * override the default actions in DatePicker
         * @method defaultActions
         * @chainable
         * @returns {DatePickerRange}
         */
        defaultActions: function () {
            var that = this;

            // run the superclass's defaultActions
            DatePicker.prototype.defaultActions.apply(this, arguments);

            // bind the __dateSelected events
            that
                .unbind('__dateSelected')
                .bind('__dateSelected', function (e, date) {

                    if (++that.__clickedTimes % 2 === 0) {

                        // if the clickedTimes is even, set the rangeEndDate value
                        // compare the rangeStartDate and rangeEndDate
                        var tmpStartDate = that.get('rangeStartDate'),
                            lastStartDate = null,
                            lastEndDate = null;

                        // if rangeStartDate is bigger than date, we set the smaller one to rangeStartDate
                        // and the bigger one to rangeEndDate
                        if (+tmpStartDate > +date) {

                            // store the last value of startDate
                            lastStartDate = tmpStartDate;

                            that.set({
                                rangeStartDate: date
                            }, {
                                silence: true
                            });
                            date = tmpStartDate;
                        }

                        lastEndDate = that.get('rangeEndDate');

                        that.set({
                            rangeEndDate: date
                        });
                        // if the maxRangeDays is set
                        // reset the startDate and endDate
                        if (typeof that.get('maxRangeDays') !== 'undefined' && that.get('maxRangeDays') !== null) {
                            var maxRangeDays = that.get('maxRangeDays');

                            if (maxRangeDays >= 0) {
                                that.set({
                                    startDate: that.get('prevStartDate'),
                                    endDate: that.get('prevEndDate')
                                }, {
                                    silence: true
                                });
                            }

                            that.renderViewPort();
                        }

                        that.set({
                            lastRangeStartDate: lastStartDate,
                            lastRangeEndDate: lastEndDate
                        }, {
                            silence: true
                        });

                        // reset clickedTimes = 0
                        that.__clickedTimes = 0;

                    } else {

                        // set the rangeEndDate to null, when we render the UI, we need to confirm that the rangeEndDate is
                        // not input
                        var tmpEndDate = that.get('rangeEndDate'),
                            tmpStartDate = that.get('rangeStartDate');

                        that.set({
                            rangeEndDate: null
                        }, {
                            silence: true
                        });

                        // then we set the rangeStartDate value
                        that.set({
                            rangeStartDate: date
                        });


                        // if maxRangeDays is set
                        if (typeof that.get('maxRangeDays') !== 'undefined' && that.get('maxRangeDays') !== null) {
                            var maxRangeDays = that.get('maxRangeDays');

                            if (maxRangeDays >= 0) {

                                // save the prevStartDate and prevEndDate
                                that.set({
                                    prevStartDate: new Date(that.get('startDate')),
                                    prevEndDate: new Date(that.get('endDate'))
                                }, {
                                    silence: true
                                });


                                that.set({
                                    // startDate 选择 date - maxRangeDays*ONE_DAY_MM和startDate大的那一个
                                    startDate: +new Date(+date - maxRangeDays * ONE_DAY_MM) > +new Date(that.get('startDate')) ? new Date(+date - maxRangeDays * ONE_DAY_MM) : new Date(that.get('startDate')),

                                    // endDate 选择 date + maxRangeDays*ONE_DAY_MM和endDate小的那一个
                                    endDate: +new Date(+date + maxRangeDays * ONE_DAY_MM) < +new Date(that.get('endDate')) ? new Date(+date + maxRangeDays * ONE_DAY_MM) : new Date(that.get('endDate'))
                                }, {
                                    silence: true
                                });

                                that.renderViewPort();
                            }
                        }

                        /**
                         * Fire when the rangeStartDate is selected
                         * Trigger the rangeStartSelected event, with the previous tmpStartDate and tmpEndDate
                         *
                         * @event rangeStartSelected
                         */
                        that.trigger('rangeStartSelected', [tmpStartDate, tmpEndDate]);
                    }
                })
                // rangeStartDate changed, we need to render the new datepicker UI
                .unbind('change:rangeStartDate')
                .bind('change:rangeStartDate', function () {
                    that.set('oldRangeStartDate', that.get('rangeStartDate'));
                    that.renderViewPort();
                })
                // rangeEndDate changed, we need to render the new datepicker UI
                .unbind('change:rangeEndDate')
                .bind('change:rangeEndDate', function () {
                    that.set('oldRangeEndDate', that.get('rangeEndDate'));
                    that.renderViewPort();
                });

            return this;
        },

        /**
         * select a date of the date-mode
         * @method selectDate
         * @param {Date|Event} date Date or event of which currentTarget contains data-date to be selected
         * @chainable
         * @example
         *      datePickerRange.selectDate(new Date()); // select today
         */
        selectDate: function (date) {
            if (date.currentTarget) {
                date = new Date(parseInt(this.$(date.currentTarget).data('date'), 10));
            }

            // select
            var lastDate = this.get('date');
            this.set('date', date, {
                silence: true
            });

            /**
             * Fire when rangeStartDate or rangeEndDate is selected
             *
             * @event selectDate
             */
            this.trigger('selectDate', [lastDate]);

            // internal event, don't listen to it
            this.trigger('__dateSelected', [date]);

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

            var rangeStartDate = this.get('rangeStartDate'),
                rangeEndDate = this.get('rangeEndDate');

            if (rangeStartDate && rangeEndDate) {

                var dateString = dateTool.format(this.get('rangeStartDateFormat'), rangeStartDate) + this.get('rangeDateFormatConcat') + dateTool.format(this.get('rangeEndDateFormat'), rangeEndDate);
                if ($display.is('input')) {
                    $display.val(dateString);
                } else {
                    $display.text(dateString);
                }
            }

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

                classByDate: function (currentDate) {
                    var rangeStartDate = node.get('rangeStartDate'),
                        rangeEndDate = node.get('rangeEndDate'),
                        crtDate = null,
                        startDate = null,
                        endDate = null;

                    // if rangeEndDate is null, we should give the rangeStartDate the 'today' class in RANGE_CLASS_HASH
                    if (!rangeEndDate) {
                        if (rangeStartDate) {
                            crtDate = new Date(currentDate);
                            startDate = new Date(rangeStartDate);

                            if (dateTool.isSameDay(crtDate, startDate)) {
                                return RANGE_CLASS_HASH['today'];
                            }

                        }
                    } else {
                        if (rangeStartDate && rangeEndDate) {
                            crtDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                            startDate = new Date(rangeStartDate.getFullYear(), rangeStartDate.getMonth(), rangeStartDate.getDate());
                            endDate = new Date(rangeEndDate.getFullYear(), rangeEndDate.getMonth(), rangeEndDate.getDate());

                            if (dateTool.isSameDay(crtDate, startDate) && dateTool.isSameDay(crtDate, endDate)) {
                                return RANGE_CLASS_HASH['today'];
                            }

                            if (dateTool.isSameDay(crtDate, startDate)) {
                                return RANGE_CLASS_HASH['first'];
                            }

                            if (dateTool.isSameDay(crtDate, endDate)) {
                                return RANGE_CLASS_HASH['last'];
                            }

                            if (+crtDate < +endDate && +crtDate > +startDate) {
                                return RANGE_CLASS_HASH['between'];
                            }

                        }
                    }

                    // finally if none match, return empty ''
                    return '';

                },

                isDayEnabled: proxy(this.isEnabledDate, this),

                isMonthEnabled: proxy(this.isEnabledYearMonth, this),

                isYearEnabled: proxy(this.isEnabledYear, this),

                // @deprecated see classByDate
                isDaySelected: function () {
                },

                isMonthSelected: function (currentDate) {
                    var rangeStartDate = node.get('rangeStartDate'),
                        rangeEndDate = node.get('rangeEndDate') || rangeStartDate, // in case the rangeEndDate is null
                        rangeStartDateFullYear = rangeStartDate.getFullYear(),
                        rangeStartDateMonth = rangeStartDate.getMonth(),
                        rangeEndDateFullYear = rangeEndDate.getFullYear(),
                        rangeEndDateMonth = rangeEndDate.getMonth(),
                        crtDateFullYear = currentDate.getFullYear(),
                        crtDateMonth = currentDate.getMonth();

                    if (crtDateFullYear < rangeEndDateFullYear && crtDateFullYear > rangeStartDateFullYear) {
                        return true;
                    }

                    if (crtDateFullYear === rangeEndDateFullYear && crtDateFullYear !== rangeStartDateFullYear) {
                        return crtDateMonth <= rangeEndDateMonth;
                    }

                    if (crtDateFullYear === rangeStartDateFullYear && crtDateFullYear !== rangeEndDateFullYear) {
                        return crtDateMonth >= rangeStartDateMonth;
                    }

                    if (crtDateFullYear === rangeStartDateFullYear && crtDateFullYear === rangeEndDateFullYear) {
                        return crtDateMonth <= rangeEndDateMonth && crtDateMonth >= rangeStartDateMonth;
                    }

                    return false;
                },

                isYearSelected: function (currentDate) {
                    var rangeStartDateFullYear = node.get('rangeStartDate').getFullYear(),
                        rangeEndDateFullYear = (node.get('rangeEndDate') || node.get('rangeStartDate')).getFullYear(),
                        crtDateFullYear = currentDate.getFullYear();

                    return crtDateFullYear <= rangeEndDateFullYear && crtDateFullYear >= rangeStartDateFullYear;
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
                },

                // pass the range date
                rangeStartDate: node.get('rangeStartDate'),
                rangeEndDate: node.get('rangeEndDate')

            })));

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
                    lastDay = dateTool.nextMonth(firstDay);//as we display two tables at one time,so two months
                    tmplastDay = lastDay.getFullYear() + '/' + (lastDay.getMonth() + 1);
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
         * Overwritten setElement method to bind default validator and event action before setting up attributes
         * @method setElement
         * @returns {DatePickerRange}
         */
        setElement: function () {
            Popup.prototype.setElement.apply(this, arguments);

            this
                .defaultValidate()
                .defaultActions();

            return this;
        },
        /**
         * When click confirm button
         * @method confirm
         */
        confirm: function () {
            var that = this;

            if (that.__clickedTimes % 2 === 1) {
                that.set({
                    rangeEndDate: that.get('rangeStartDate')
                });
                // reset clickedTimes = 0
                that.__clickedTimes = 0;
            }

            that.set({
                oldRangeStartDate: that.get('rangeStartDate'),
                oldRangeEndDate: that.get('rangeEndDate')
            }, {
                silence: true
            });

            // set the display value
            that.display();

            /**
             * Fire when the rangeEndDate is selected
             * trigger rangeSelected event, and pass the lastRangeStartDate and lastRangeEndDate value
             * if lastStartDate || lastEndDate is null, that means this value doesn't change in this process
             *
             * @event rangeEndSelected
             */
            that.trigger('rangeEndSelected', [that.get('lastRangeStartDate'), that.get('lastRangeEndDate')]);

            /**
             * Fire when click the confirm button
             * we have set the confirmHide to hide the DatePickerRange by default.
             *
             * @event confirmHide
             */
            that.trigger('confirmHide');
        },

        /**
         * When click cancel button
         * @method cancel
         */
        cancel: function () {
            this.reset();
            /**
             * Fire when click the cancel button
             * we have set the cancelHide to hide the DatePickerRange by default.
             *
             * @event cancelHide
             */
            this.trigger('cancelHide');
        },

        /**
         * Reset rangeStartDate and rangeEndDate
         * @method reset
         */
        reset: function () {
            var that = this,
                oldStartDate, oldEndDate;

            // reset rangeStartDate and rangeEndDate
            oldStartDate = that.get('oldRangeStartDate');
            oldEndDate = that.get('oldRangeEndDate');

            if (oldStartDate && oldEndDate) {
                that.set('rangeStartDate', oldStartDate);
                that.set('rangeEndDate', oldEndDate);
            }
        },

        /**
         * Override close method
         * When close DateRangePicker Panel, call reset method
         * @method close
         */
        close: function () {
            this.reset();

            DatePicker.prototype.close.apply(this, arguments);
        }
    });

    exports.include(extend(true, {}, DatePicker, {

        settings: {
            // DatePickerRange need at least 2 months step
            monthStep: 2,

            //input wording format
            rangeStartDateFormat: 'Y-m-d',
            rangeDateFormatConcat: ' 至 ',
            rangeEndDateFormat: 'Y-m-d',

            // override the datePickerTemplate
            datePickerTemplate: datePickerTemplate,

            // max-range
            // if maxRangeDays is null, maxRangeDays will be unlimited
            // else if maxRangeDays is set, use the value
            maxRangeDays: null,

            //set the input to readOnly, default true
            readOnly: true,

            disabled: false,

            //Date, The earliest selectable date
            startDate: new Date(0),

            //Date, The latest selectable date
            endDate: new Date('2999/12/31'),

            // the range start date
            rangeStartDate: new Date(),

            // the range end date
            rangeEndDate: new Date(),

            events: {
                // override the default select date in datepicker which will close the datepicker automatically.
                // So in our DatePickerRange we override it.
                'selectDate': function () {
                },

                'confirmHide': function () {
                    this.close();
                },

                'cancelHide': function () {
                    this.close();
                }
            }
        }
    }));
});
