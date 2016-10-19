/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 12-8-4 下午3:58
 */
LBF.define('util.jsonp', function(require, exports, module){
    var request = require('util.request'),
        serialize = require('util.serialize');

    var cid = 0;

    module.exports = function(url, options, cb, charset){
        var cbName = options.cb = options.cb || 'JSONP_CB_' + ++cid,
            script;

        url += url.indexOf('?') === -1 ? '?' : '&';
        url += serialize(options);

        window[cbName] = function(json){
            cb(json);

            setTimeout(function(){
                // set window.cbName when inside JSONP callback will cause error
                window[cbName] = null;

                // clean up script tag
                script.parentNode.removeChild(script);
            }, 1);
        };

        return script = request(url, noop, charset);
    };

    function noop(){}
});