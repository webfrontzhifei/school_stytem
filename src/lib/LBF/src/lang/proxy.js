/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.proxy', function(require, exports, module){
    /**
     * Proxy function with assigned context.
     * By proxy function's context, inner function will get the assigned context instead of the invoking one
     * @class proxy
     * @namespace lang
     * @constructor
     * @param {Function} fn
     * @param {Object} context
     * @returns {Function}
     * @example
     *      var a = {
     *          x: 1,
     *          fn: function(){
     *              alert(this.x);
     *          }
     *      };
     *
     *      // this point to a
     *      a.fn(); // alert 1
     *
     *      var b = { x: 2};
     *      a.fn = proxy(a.fn, b);
     *
     *      // this point to b
     *      a.fn(); // alert 2
     */
    module.exports = function(fn, context){
        return function(){
            return fn.apply(context, arguments);
        };
    };
});