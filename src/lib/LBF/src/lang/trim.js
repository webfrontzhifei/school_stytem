/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.trim', function(require, exports, module){
    var trimReg = /(^[\s\xA0]+)|([\s\xA0]+$)/g;

    /**
     * Trim blanks
     * @class trim
     * @namespace lang
     * @module lang
     * @constructor
     * @param {String} text
     * @return {String}
     */
    module.exports = String.prototype.trim ?
        function( text ) {
            return String.prototype.trim.call( text || '' );
        } :

        // Otherwise use our own trimming functionality
        function( text ) {
            return ( text || '' ).toString().replace( trimReg, '' );
        };
});