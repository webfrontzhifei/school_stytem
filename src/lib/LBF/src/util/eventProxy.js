/**
 * eventProxy
 * @overview
 * @author patrickliu
 * @create 7/11/14
 */
// eventProxy is a subcribe/publish proxy to release the reliability of different modules
LBF.define('util.eventProxy', function(require, exports, module) {

    var extend = require('lang.extend'),
        Event = require('lib.Backbone').Events;

    var eventProxy = {};
    extend(eventProxy, Event);

    /**
     * eventProxy is mainly inherited from Backbone.Events
     * there are two different kinds of eventProxy
     * @example
     * singleton mode
     * // in controller A
     * var eventProxy = require('util.eventProxy').singleton;
     *
     * // in order to not conflict with other events,
     * // Be remember to add namespace (i.e. nameSpace.eventName)
     * eventProxy.on('B.event1', callback1, context);
     *
     * // in controller B
     * var eventProxy = require('util.eventProxy').singleton;
     * eventProxy.trigger('B.event1', [arg1, arg2,...]);
     *
     * @example
     * non-singleton mode
     * var EventProxy = require('util.eventProxy');
     *
     * var eventProxy = new EventProxy();
     * eventProxy.on('B.event1', callback1, context);
     * eventProxy.trigger('B.event1', [arg1, arg2,...]);
     *
     */
    module.exports = exports = function() {};

    extend(exports.prototype, Event);

    exports.singleton = eventProxy;
});
