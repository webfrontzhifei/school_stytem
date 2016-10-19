/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-4-8 下午8:04
 */
LBF.define('util.PubSub', function(require){
    var extend = require('lang.extend'),
        Event = require('util.Event');

    /**
     * Global publish and subscribe
     * @class PubSub
     * @namespace util
     * @module util
     * @deprecated
     */
    var host = extend({}, Event);

    /**
     * Subscribe(bind) an event
     * @method sub
     * @static
     * @see util.Event.on
     */
    host.sub = host.on;

    /**
     * Publish(trigger) an event
     * @method pub
     * @static
     * @see util.Event.trigger
     */
    host.pub = host.trigger;

    return host;
});