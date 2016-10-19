/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.inArray', function(require, exports, module){
    /**
     * Search for a specified value within an array and return its index (or -1 if not found).
     * Borrowed from jQuery.inArray
     * @class inArray
     * @namespace lang
     * @constructor
     * @param elem Array like object
     * @returns {Array}
     * @example
     *      var someFn = function(){
     *          var args = toArray(arguments);
     *      };
     */
    module.exports =  [].indexOf ?
        function(elem, arr, i){
            return arr ? [].indexOf.call(arr, elem, i) : -1;
        } :
        function(elem, arr, i) {
            if (arr){
                var len = arr.length;

                // converts negative i to positive
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

                for ( ; i < len; i++ ) {
                    // Skip accessing in sparse arrays
                    if ( i in arr && arr[ i ] === elem ) {
                        return i;
                    }
                }
            }

            return -1;
        };
});