/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-8-27 下午7:39
 */
LBF.define('util.localStorage', function(require){
    var Cookie = require('util.Cookie'),
        trim = require('lang.trim');

    var COOKIE_PREFIX = 'IELS';

    // set expires to 100 years to fake permanent storage
    var EXPIRES = 3153600000000;

    var doc = document,

        commonPattern = new RegExp( '(?:^|[ ;])' + COOKIE_PREFIX + '[^=]+=([^;$])' ),

        keyPattern = function( key ){
            return COOKIE_PREFIX + key;
        },

        explore = function( callback ){
            var attributes = doc.cookie.split(';'),
                i = 0,
                length = attributes.length,
                items = [],
                match;

            if( callback ){
                for(; i<length; i++){
                    if( match = commonPattern.exec( attributes[i] ) ){
                        items.push( match[1] );
                        callback( match[1] );
                    }
                }
            } else {
                for(; i<length; i++){
                    ( match = commonPattern.exec( attributes[i] ) ) && items.push( match[1] );
                }
            }

            return items;
        };

    /**
     * LocalStorage with compatible solution for IE
     * use cookie as IE solution
     * user data in IE, because of secure concern, is limited to same dir which is not suitable for common uses
     * Cautions:
     *  Storage events haven't been add to compatible solution
     *  Non-IE browser counts on window.localStorage only, it means this tool is useless to those old non-IE browsers
     * @class localStorage
     * @namespace util.localStorage
     * @module util
     */
    return window.localStorage || {
        /**
         * The number of key/value pairs currently present in the list associated with the localStorage.
         * @property length
         * @static
         */
        length: explore().length,

        /**
         * Get the value of the nth key in the localStorage list
         * @method key
         * @static
         * @param {Number} index Index of key
         * @return {String | Null}
         */
        key: function(index){
            return explore()[index] || null;
        },

        /**
         * Get the current value associated with the given key.
         * @method getItem
         * @static
         * @param {String} key
         * @return {String | Null}
         */
        getItem: function(key){
            return Cookie.get( keyPattern( key ) );
        },

        /**
         * Set ( add/update ) value of the given key
         * If it couldn't set the new value, the method must throw a QuotaExceededError exception.
         * Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.
         * @method setItem
         * @static
         * @param {String} key
         * @param {String} value
         */
        setItem: function(key, value){
            Cookie.set( keyPattern( key ), value, null, '/', EXPIRES );
            this.length = explore().length;
        },

        /**
         * Remove the key/value pair with the given key
         * @method removeItem
         * @static
         * @param {String} key
         */
        removeItem: function(key){
            Cookie.del( key );
            this.length = explore().length;
        },

        /**
         * Empty all key/value pairs
         * @method clear
         * @static
         */
        clear: function(){
            this.length = explore(function( item ){
                Cookie.del( trim( item.split('=')[0] ) );
            }).length;
        }
    };
});