/**
 * @fileOverview
 * @author amoschen@tencent.com
 * @version 1.0
 * @update 2013-11-08
 * @description Defines frontend log utilities
 */

/**
 * Monitor services
 * @main monitor
 * @module monitor
 */

/**
 * Frontend log utilities with uls service
 * @class logger
 * @namespace monitor
 * @example
 *  logger.config({
 *      writeConsole: true,
 *      proj: 'lbf demo',
 *      reportLevel: logger.WARN
 *  });
 *
 *  var logOptions = {
 *      module: 'demo.logger',
 *      fn: 'LBF.use',
 *      line: 102,
 *      errorID: 1
 *  };
 *
 *  logger.error('error test', logOptions);
 *
 *  logOptions.line = 109;
 *  logger.warn('warn test', logOptions);
 *
 *  logOptions.line = 112;
 *  logger.notice('notice test', logOptions);
 *
 *  logOptions.line = 114;
 *  logger.info('info test', logOptions);
 *
 *  logOptions.line = 118;
 *  logger.debug('debug test', logOptions);
 */
LBF.define('monitor.logger', function(require, exports){
    var isObject = require('lang.isObject'),
        isString = require('lang.isString'),
        toArray = require('lang.toArray'),
        JSON = require('lang.JSON'),
        extend = require('lang.extend'),
        browser = require('lang.browser'),
        postReport = require('util.postReport');

    var UNKNOWN = 'unknown';

    var win = window,
        con = win.console || {};

    // default report url
    var reportUrl = '//fem.b.qq.com/log';

    // collect env info
    var os = navigator.platform,
        browser = browser.browser + '/' + browser.version,
        globalScreen = win.screen,
        screenSize = globalScreen ?
            globalScreen.width + '*' + globalScreen.height :
            UNKNOWN;

    // private variants
    var config = {
            writeConsole: false,
            reportLevel: 'error',
            reportGap: 1000,
            proj: UNKNOWN
        },

        // level list
        levels = ['error', 'warn', 'notice', 'info', 'debug'],

        // level name to logger method map
        consoleMap = {
            error: 'error',

            warn: 'warn',

            // console has no notice level
            // use info instead
            notice: 'info',

            info: 'info',

            // console.debug is deprecated
            debug: 'log'
        },

        // level name to level value map
        loggerLevel = {
            error: 1,
            warn: 2,
            notice: 3,
            info: 4,
            debug: 5
        },

        // stack for log storage
        stack = [],

        // variants for exploring levels
        i = 0,
        len = levels.length,
        levelName;

    // define methods and init properties for all levels
    for(; i<len; i++){
        levelName = levels[i];

        // define logger methods
        exports[levelName] = (function(levelName, stack){
            /**
             * Write an error log
             * @method error
             * @param {String} [msg=''] The log message
             * @param {Object} [opts={}] The options for log
             * @param {String} [opts.module=UNKNOWN] The module that writes the log
             * @param {String} [opts.fn=UNKNOWN] The function that writes the log
             * @param {Number} [opts.lien=0] The line num that writes the log
             * @param {Number} [opts.errorID] The error ID
             */

            /**
             * Write an warn log
             * @method warn
             * @param {String} [msg=''] The log message
             * @param {Object} [opts={}] The options for log
             * @param {String} [opts.module=UNKNOWN] The module that writes the log
             * @param {String} [opts.fn=UNKNOWN] The function that writes the log
             * @param {Number} [opts.lien=0] The line num that writes the log
             * @param {Number} [opts.errorID] The error ID
             */

            /**
             * Write an notice log
             * @method notice
             * @param {String} [msg=''] The log message
             * @param {Object} [opts={}] The options for log
             * @param {String} [opts.module=UNKNOWN] The module that writes the log
             * @param {String} [opts.fn=UNKNOWN] The function that writes the log
             * @param {Number} [opts.lien=0] The line num that writes the log
             * @param {Number} [opts.errorID] The error ID
             */

            /**
             * Write an info log
             * @method info
             * @param {String} [msg=''] The log message
             * @param {Object} [opts={}] The options for log
             * @param {String} [opts.module=UNKNOWN] The module that writes the log
             * @param {String} [opts.fn=UNKNOWN] The function that writes the log
             * @param {Number} [opts.lien=0] The line num that writes the log
             * @param {Number} [opts.errorID] The error ID
             */

            /**
             * Write an debug log
             * @method debug
             * @param {String} [msg=''] The log message
             * @param {Object} [opts={}] The options for log
             * @param {String} [opts.module=UNKNOWN] The module that writes the log
             * @param {String} [opts.fn=UNKNOWN] The function that writes the log
             * @param {Number} [opts.lien=0] The line num that writes the log
             * @param {Number} [opts.errorID] The error ID
             */
            return function(msg, opts){
                opts = opts || {};

                var
                    // transform level value to level name
                    level = loggerLevel[levelName],

                    // log body
                    logObj = {
                        level: level,
                        msg: msg || '',
                        module: opts.module || UNKNOWN,
                        fn: opts.fn || UNKNOWN,
                        line: opts.line || 0,
                        time: +new Date(),
                        errorID: opts.errorID || 0
                    };

                // cache in stack
                // it will be consumed by log task
                stack.push(logObj);

                // write to browser console
                if(config.writeConsole){
                    con && con[consoleMap[levelName]] && con[consoleMap[levelName]](msg);
                }
            };
        })(levelName, stack);

        // define level constant for report level setting
        exports[levelName.toUpperCase()] = levelName;
    }

    /**
     * Write an debug log
     * @method log
     * @param {String} [msg=''] The log message
     * @param {Object} [opts={}] The options for log
     * @param {String} [opts.module=UNKNOWN] The module that writes the log
     * @param {String} [opts.fn=UNKNOWN] The function that writes the log
     * @param {Number} [opts.lien=0] The line num that writes the log
     * @param {Number} [opts.errorID] The error ID
     */
    exports.log = exports.debug;

    /**
     * Set config
     * Options available are:
     *  writeConsole {Boolean} Write to browser console or not
     *  reportLevel {String} Report level of log, beyond which will be logged into uls
     *  proj {String} Project name, which will be logged with log object
     * @method config
     * @param {String|Object} key The name of config option to be set, or the key-value pairs of config options to be set when it's an object
     * @param value Value of config option
     */
    exports.config = function(key, value){
        // pass in key-value pair
        if(isString(key)){
            config[key] = value;
            return;
        }

        // pass in object config
        isObject(key) && extend(config, key);
    };

    /**
     * Report logs to uls
     * @method report
     * @param {Object} [opts={}] The additional options for log object
     * @param {String} [opts.reportUrl=config.reportUrl] The report url of remote server
     */
    var report = exports.report = function(opts){
        if(stack.length === 0){
            return;
        }

        opts = opts || {};

        // grep logs to be reported according to report level
        var reportStack = [],
            i = 0,
            len = stack.length,
            reportLevel = loggerLevel[config.reportLevel];

        // copy matched logs
        for(; i<len; i++){
            if(reportLevel >= stack[i].level){
                reportStack.push(stack[i]);
            }
        }

        // clear stack in case of memory leak
        stack.splice(0, stack.length);

        // no log to be reported
        if(reportStack.length === 0){
            return;
        }

        // gather report options
        var dataMap = {
                os: os,
                browser: browser,
                screen: screenSize,
                proj: config.proj,
                log: JSON.stringify(reportStack)
            };

        // setup opts
        opts.reportUrl = opts.reportUrl || reportUrl;
        opts.dataMap = dataMap;

        // post data
        postReport(opts);

    };

    // report task
    require.async(['util.Tasks'], function(Tasks){
        Tasks.add(report, config.reportGap).run();
    });

    // bind report key point

//    window.addEventListener ?
//        window.addEventListener('unload', autoReport) :
//
//        window.attachEvent('onunload', autoReport);



    // chrome doesn't support window.onerror

//    win.addEventListener ?
//        win.addEventListener('error', autoReport) :
//        win.attachEvent('onerror', autoReport);
//
//    function autoReport(){
//        report();
//    }
});