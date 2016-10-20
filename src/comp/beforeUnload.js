LBF.define('qidian.comp.beforeUnload', function(require, exports, module){
    var jQuery = require('lib.jQuery');

    module.exports = function(cb){
        // prevent IE from triggering page redirect
        jQuery('body').delegate('a[href^="javascript:"]', 'click', function(event){
            event.preventDefault();
        });

        // bind before unload
        jQuery(window).bind('beforeunload', function(){
            return cb.apply(this, arguments);
        });
    };
});