/**
 * Created by amos on 14-8-7.
 */

var builtInMods = [
	['globalSettings', exports.data], 
	['lang.forEach', forEach],
	['lang.isType', isType], 
	['lang.isObject', isObject],
	['lang.isString', isString],
	['lang.isArray', isArray],
	['lang.isFunction', isFunction],
	['lang.isNumber', isNumber],
	['lang.isRegExp', isRegExp],
	['util.request', request]
];

// define modules only exist in modern browsers
global.JSON && builtInMods.push(['lang.JSON', global.JSON]);
global.jQuery && (global.jQuery.version || '').indexOf('1.7') === 0 && builtInMods.push(['lib.jQuery', global.jQuery]);

forEach(builtInMods, function(each){
    exports.define(each[0], function(require, exports, module){
        module.exports = each[1];
    });
});

