/**
 * @fileOverview
 * @author sqchen
 * @version 1
 * Created: 13-7-5 上午10:27
 */
LBF.define('util.unique', function() {

    /**
     * Get unique key-value map from an array
     * @class unique
     * @namespace util
     * @constructor
     * @param {Array} arr
     * @return {Object}
     */
    return function(arr) {
        var result = [], hash = {};

        for(var i = 0, item; item = arr[i]; i++) {
            if( !hash[item] ) {
                result.push(item);
                hash[item] = true;
            }
        }
        return result;
    };
});