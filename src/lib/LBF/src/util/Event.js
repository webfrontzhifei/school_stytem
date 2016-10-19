/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.Event', function(require, exports){
    var toArray = require('lang.toArray'),
        Callbacks = require('util.Callbacks');

    var ATTR = '_EVENTS';

    /**
     * [mixable] Common event handler. Can be extended to any object that wants event handler.
     * @class Event
     * @namespace util
     * @example
     *      // mix in instance example
     *      // assume classInstance is instance of lang.Class or its sub class
     *
     *      // use class's mix method
     *      classInstance.mix(Attribute);
     *
     *      // set your attributes
     *      classInstance.set('a', 1);
     *      classInstance.get('a') // returns 1
     *
     * @example
     *      // extend a sub class example
     *
     *      // use class's extend method
     *      var SubClass = Class.extend(Attribute, {
     *          // some other methods
     *          method1: function(){
     *          },
     *
     *          method2: function(){
     *          }
     *      });
     *
     *      // initialize an instance
     *      classInstance = new SubClass;
     *
     *      // set your attributes
     *      classInstance.set('a', 1);
     *      classInstance.get('a') // returns 1
     */

    /**
     * Bind events
     * @method on
     * @param {String} eventNames Event names that to be subscribed and can be separated by a blank space
     * @param {Function} callback Callback to be invoked when the subscribed events are published
     * @chainable
     */
    exports.on = function(type, handler, one){
        var events = this[ATTR];

        if(!events){
            events = this[ATTR] = {};
        }

        var callbacks = events[type] || (events[type] = Callbacks('stopOnFalse'));

        if(one === 1){
            var origFn = handler,
                self = this;

            handler = function() {
                // Can use an empty set, since event contains the info
                self.off(type, handler);
                return origFn.apply(this, arguments);
            };
        }

        callbacks.add(handler);

        return this;
    }

    /**
     * Unbind events
     * @method off
     * @param {String} eventNames Event names that to be subscribed and can be separated by a blank space
     * @param {Function} [callback] Callback to be invoked when the subscribed events are published. Leave blank will unbind all callbacks on this event
     * @chainable
     */
    exports.off = function(type, handler){
        if(!type){
            this[ATTR] = {};
            return this;
        }

        var events = this[ATTR];
        if(!events || !events[type]){
            return this;
        }

        if(!handler){
            events[type].empty();
            return this;
        }

        events[type].remove(handler);

        return this;
    }

    /**
     * Publish an event
     * @method trigger
     * @param {String} eventName
     * @param arg* Arguments to be passed to callback function. No limit of arguments' length
     * @chainable
     */
    exports.trigger = function(){
        var args = toArray(arguments),
            type = args.shift(),
            events = this[ATTR];

        if(!events || !events[type]){
            return this;
        }

        events[type].fireWith(this, args);

        return this;
    }

    /**
     * Bind event callback to be triggered only once
     * @method one
     * @param {String} eventNames Event names that to be subscribed and can be separated by a blank space
     * @param {Function} callback Callback to be invoked when the subscribed events are published. Leave blank will unbind all callbacks on this event
     * @chainable
     */
    exports.once = function(type, handler){
        return this.on(type, handler, 1);
    }
});