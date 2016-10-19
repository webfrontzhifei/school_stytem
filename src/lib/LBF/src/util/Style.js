/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-31 上午11:18
 */
LBF.define('util.Style', function(require){
    var $ = require('lib.jQuery');

    /**
     * Add stylesheet(style or link tag) page
     * @class Style
     * @beta
     * @namespace util
     * @module util
     * @requires lib.jQuery
     */
    return {
        /**
         * Add style tag to DOM
         * @method add
         * @static
         * @param {String} name Style name
         * @param {String} cssText Style to be add
         * @return {jQuery} JQuery object of style tag
         */
        add: function(name, cssText){
            return $('<style name="' + name + '">' + cssText + '</style>').appendTo('head');
        },

        /**
         * Load remote CSS file with link tag
         * @method load
         * @static
         * @param {String} name Style name
         * @param {String} url CSS file's url
         * @return {lib.jQuery} JQuery object of link tag
         */
        load: function(name, url){
            return $('<link name="' + name + '" rel="stylesheet" href="' + url + '" />').appendTo('head');
        },

        /**
         * Remove style or link tag by its name
         * @method remove
         * @static
         * @param {String} name Style or link name
         * @chainable
         */
        remove: function(name){
            $('style[name=' + name + '], link[name=' + name + ']').remove();
            return this;
        }
    }
});