LBF.define('app.RESTSync', function(require, exports, module){
    var _ = require('lib.underscore');

    /**
     * Replace Backbone.sync with REST
     */
    module.exports = function( REST ){
        return function( method, model, options ){
            // Use REST.del as 'delete' is reserved keyword of Javascript
            ( method === 'delete' ) && ( method = 'del' );
            
            // Default JSON-request options.
            var params = {};

            // Ensure that we have a URL.
            if (!options.url) {
              params.url = _.result(model, 'url') || urlError();
            }

            if( params.data == null && model && method !== 'read' ){
                params.contentType = 'application/json';
                params.data = JSON.stringify(options.attrs || model.toJSON(options));
            }
            
            // Make the request, allowing the user to override any Ajax options.
            var xhr = options.xhr = REST[ method ](_.extend(params, options));
            model.trigger('request', model, xhr, options);
            return xhr;
        };
    };
});