/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.serialize', function(require, exports, module){
    /**
     * Serialize object with delimiter
     * @class serialize
     * @namespace util
     * @constructor
     * @param {Object} obj
     * @param {String} [delimiterInside='=']
     * @param {String} [delimiterBetween='&']
     * @return {String}
     */
    module.exports = function(obj, delimiterInside, delimiterBetween){
        var stack = [];
        delimiterInside = delimiterInside || '=';
        delimiterBetween = delimiterBetween || '&';

        for(var key in obj){
            if(obj.hasOwnProperty){
                stack.push(key + delimiterInside + (obj[key] || ''));
            }
        }

        return stack.join(delimiterBetween);
    };
});