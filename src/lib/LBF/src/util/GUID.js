/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-17 下午3:16
 */
LBF.define('util.GUID', function(){
    function S4()
    {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    /**
     * Generate a GUID ( global unique identity )
     * @class GUID
     * @namespace util
     * @module util
     * @constructor
     * @return {String}
     */
    return function(){
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    };
});