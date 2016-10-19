/**
 * Created by amos on 14-1-15.
 */
LBF.define('app.RESTPlugins.errorLog', function(require){
    var logger = require('monitor.logger'),
        extend = require('lang.extend');

    return function(REST){
        REST.on('error', function(err){
            var options = {
                errorID: err.code
            };

            options = extend({}, REST.get('log'), options);

            logger.error('status:' + err.status + ' message:' + err.message, options);
        });
    };
});