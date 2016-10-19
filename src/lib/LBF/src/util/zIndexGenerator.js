/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-14 上午9:56
 */
LBF.define('util.zIndexGenerator', function(){
    var zIndex;

    /**
     * Generate legal z-index(a css attribute) value. Later generated is bigger than previous ones.
     * @class zIndexGenerator
     * @namespace util
     * @module util
     * @constructor
     * @return {Number} Legal z-index
     */
    return function () {
        if (!zIndex) {
            zIndex = 0;
        }
        var _zIndex = Math.round(new Date().getTime() % 1e8 / 1000);
        zIndex = Math.max(_zIndex, zIndex + 1);
        return zIndex;
    };
});