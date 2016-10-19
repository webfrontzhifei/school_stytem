/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-4-2 下午9:19
 */
LBF.define('util.report', function(){
    var logs = {};

    /**
     * Report to a url
     * @class report
     * @namespace util
     * @module util
     * @constructor
     * @param {String} url Report destination. All data should be serialized and add tu search part of url
     * @chainable
     */
    return function(url){
        //send data
        var now = +new Date(),
            name = 'log_' + now,
            img = logs[name] = new Image();

        img.onload = img.onerror = function(){
            logs[name] = null;
        };

        url += (url.indexOf('?') > -1 ? '&' : '?') + now;

        img.src = url;

        return arguments.callee;
    };
});