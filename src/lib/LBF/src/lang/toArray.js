/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.toArray', function(require, exports, module){
    /**
     * Make array like object to array
     * Usually for arguments, jQuery instance
     * @class toArray
     * @namespace lang
     * @constructor
     * @param {Object} arrayLike Array like object
     * @returns {Array}
     * @example
     *      var someFn = function(){
     *          var args = toArray(arguments);
     *      };
     */
    module.exports = function(arrayLike){
        return [].slice.call(arrayLike);
    };
});