/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-9 上午10:41
 */
LBF.define('util.css3Detect', function(){
    var div = document.createElement('div'),
        vendors = 'Khtml O Moz Webkit'.split(' '),
        len = vendors.length;

    /**
     * Detect if the browser support the specific css3 property
     * @class css3Detect
     * @module util
     * @namespace util
     * @constructor
     * @param {String} prop Property name
     * @return {Boolean} Support state
     */
    return function(prop) {
        // 创建一个div，然后可以获得div.style，这是它所支持的属性的数组列表。
        // 检查text是否包含在数组中，如果是，直接返回true。
        if ( prop in div.style ) return true;

        // 检查各种前缀，比如Webkit加上text，即webkitTransition，如果包含在style中，返回true。
        // 值得注意的是在CSS中属性名为：-webkit-transition，但是在DOM的style中 ，却是对应webkitTransition。

        if ('-ms-' + prop in div.style) return true;

        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });

        while(len--) {
            if ( vendors[len] + prop in div.style ) {
                return true;
            }
        }

        return false;
    };
});