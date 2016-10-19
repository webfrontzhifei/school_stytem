/**
 * Created by amos on 14-8-19.
 */
LBF.define('lang.each', function(require, exports, module){
    /**
     * Foreach
     * @class each
     * @namespace lang
     * @module lang
     * @constructor
     * @param {Object|Array} object Object to be traversed
     * @param {Function} callback Handler for each item
     * @param args Arguments attached for handler
     * @return {Object|Array} Object to be traversed
     */
    module.exports = function( object, callback, args ) {
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || Object.prototype.toString( object ) === '[object Function]';

        if ( args ) {
            if ( isObj ) {
                for ( name in object ) {
                    if ( callback.apply( object[ name ], args ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.apply( object[ i++ ], args ) === false ) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
            if ( isObj ) {
                for ( name in object ) {
                    if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                        break;
                    }
                }
            } else {
                for ( ; i < length; ) {
                    if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
                        break;
                    }
                }
            }
        }

        return object;
    };
});