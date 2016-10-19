/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-4-8 下午2:19
 */
LBF.define('util.xssFilter', function(){
    /**
     * Filter all xss chars and replace them with legal ones.
     * @class xssFilter
     * @namespace util
     * @module util
     * @constructor
     * @param {String} str
     * @return {String} Secured string
     */
    return {

        /**
         * Filter used to filter the innerHTML and attributes of tag
         * @method htmlEncode
         * @param str
         * @returns {string}
         * @exmaple
         *     $('#needFilter').html(xssFilter.htmlEncode('untrusted data'));
         *     $('body').append($('<div data-attr="' + xssFilter.htmlEncode('untrusted data') + '"></div>');
         */
        htmlEncode: function (str) {
            return (str + '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;')
                .replace(/ /g, '&nbsp;')
                .replace(/=/g, '&#61;')
                .replace(/`/g, '&#96;');
        },

        /**
         * Filter used to filter the url parameters
         * @method uriComponentEncode
         * @param str
         * @returns {String}
         * @example
         *     // in fact we don't have to encode the whole url, but the parameters
         *     $('#needFilter).attr('src', xssFilter.uriComponentEncode('untrusted uri'));
         */
        uriComponentEncode: function(str) {
            str = encodeURIComponent(str + '');
            return str
                .replace(/~/g, '%7E')
                .replace(/!/g, '%21')
                .replace(/\*/g, '%2A')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29')
                .replace(/'/g, '%27')
                .replace(/\?/g, '%3F')
                .replace(/;/g, '%3B');
        },

        /**
         * Filter used to filter the css code, mainly used in php
         * @method cssEncode
         * @param str
         * @returns {string}
         * @example
         *     <style>
         *         #foo[id ~= 'xssFilter.cssEncode("untrusted data")'] { background-color: pink;}
         *     </style>
         */
        cssEncode: function(str) {
            return (str + '')
                .replace(/\b/g, '\\08 ')
                .replace(/\t/g, '\\09 ')
                .replace(/\n/g, '\\0A ')
                .replace(/\f/g, '\\0C ')
                .replace(/\r/g, '\\0D ')
                .replace(/'/g, '\\27 ')
                .replace(/"/g, '\\22 ')
                .replace(/\\/g, '\\5C ')
                .replace(/&/g, '\\26 ')
                .replace(/\//g, '\\2F ')
                .replace(/</g, '\\3C ')
                .replace(/>/g, '\\3E ')
                .replace(/\u2028/g, '\\002028 ')
                .replace(/\u2029/g, '\\002029 ');
        },
        /**
         * Filter used to filter the css color, mainly used by php
         * @method cssColorValidate
         * @param str
         * @returns {boolean}
         * @example
         *     <style>
         *         #foo {
         *             background-color: xssFilter.cssColorValidate('untrusted data');
         *         }
         *     </style>
         */
        cssColorValidate: function(str) {
            var CSS_HEX_COLOR_REGEX = /#[0-9a-fA-f]{3}([0-9a-fA-f]{3})?/,
                CSS_NAMED_COLOR_REGEX = /[a-zA-Z]{1,20}/;

            return CSS_HEX_COLOR_REGEX.test(sStr) && CSS_NAMED_COLOR_REGEX.test(sStr);
        }

    };
});