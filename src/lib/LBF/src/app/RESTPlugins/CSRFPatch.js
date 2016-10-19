/**
 * Created by amos on 14-1-16.
 */
LBF.define('app.RESTPlugins.CSRFPatch', function(require){
    var Cookie = require('util.Cookie'),
        JSON = require('lang.JSON');

    return function(REST){
        REST.on('beforeSend', function( ajaxSettings ){
            var config = REST.get('CSRF'),
                token = config ? config.token : null;

            if(token){
                ajaxSettings.data = ajaxSettings.data || {};
                
                if(typeof ajaxSettings.data !== 'string') {
                    ajaxSettings.data[token] = Cookie.get(token);
                } else {
                    ajaxSettings.data = JSON.parse(ajaxSettings.data);
                    ajaxSettings.data[token] = Cookie.get(token);
                    ajaxSettings.data = JSON.stringify(ajaxSettings.data);
                }
            }
        });
    };
});