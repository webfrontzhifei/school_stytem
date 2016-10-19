/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-9-26 下午4:23
 */
LBF.define('util.specialCharEscape', function(){

    return function( string ){
        return ( string + '' ).replace(/(['"\\\/])/g, '\\$1');
    };
});