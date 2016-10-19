/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-28 上午12:32
 */
LBF.define('ui.Plugins.Plugin', function(require){
    var each = require('lang.each'),
        proxy = require('lang.proxy'),
        Node = require('ui.Nodes.Node');

    /**
     * Plugin base
     * @class Plugin
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @main Plugins
     * @extends ui.Nodes.Node
     * @constructor
     * @param {ui.Nodes.Node} node Node instance of classes extended from ui.Nodes.Node
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.events] Plugin events
     * @param {Object} [opts.elements] Frequently used inner elements
     */
    var Plugin = Node.inherit({
        initialize: function(node, opts){
            this.node = node;
            this.superclass.prototype.initialize.call(this, opts);
        },

        /**
         * Bind options.events
         * @method initEvents
         * @chainable
         * @protected
         */
        initEvents: function(){
            var plugin = this;

            plugin.eventsHost = this.$('<div></div>');

            each(this.get('events') || {}, function(eventName){
                plugin.bind(eventName, this);
            });

            return this;
        },

        /**
         * Inject overlay's methods to host
         * @method injectMethods
         * @protected
         * @chainable
         */
        injectMethods: function(methods){
            var plugin = this,
                node = this.node;
            each(methods, function(){
                var methodName = this + '';
                node.before(methodName, proxy(plugin[methodName], plugin));
            });

            return this;
        },

        /**
         * Add methods to host node
         * @method addMethods
         * @param {String[]} methods Add methods to host
         * @chainable
         * @protected
         */
        addMethods: function(methods){
            if(!methods){
                return this;
            }

            var node = this.node,
                cursor = this;
            each(methods, function(i, method){
                node[method] = proxy(cursor[method], cursor);
            });

            return this;
        },

        /**
         * Add events to host node
         * @method bindEvents
         * @param {array[]} events added to the host
         * @chainable
         * @protected
         */
        bindEventsToHost: function(events){
            if(!events){
                return this;
            }

            var node = this.node,
                cursor = this;
            each(events, function(i, event){
                cursor.bind(event, function(){
                    var args = Array.prototype.slice.call(arguments, 1);
                    node.trigger(event, args);
                });
            });

            return this;
        },

        /**
         * Remove methods from host node
         * @param {String[]} methods Remove methods from host
         * @chainable
         * @protected
         */
        removeMethods: function(methods){
            if(!methods){
                return this;
            }

            var node = this.node;
            each(methods, function(i, method){
                node[method] = null;
            });

            return this;
        },

        /**
         * Bind events
         * @method bind
         * @chainable
         */
        bind: function(){
            this.eventsHost.bind.apply(this.eventsHost, arguments);
            return this;
        },

        /**
         * Unbind events
         * @method unbind
         * @chainable
         */
        unbind: function(){
            this.eventsHost.unbind.apply(this.eventsHost, arguments);
            return this;
        },

        /**
         * Trigger event
         * @method trigger
         * @chainable
         */
        trigger: function(){
            this.eventsHost.trigger.apply(this.eventsHost, arguments);
            return this;
        },

        /**
         * Remove plugin, including unplug it from it's host
         * @method remove
         * @chainable
         */
        remove: function(){
            this.removeMethods(this.constructor.methods);
            this.node.unplug(this.constructor.ns);
            return this;
        },

        /**
         * Unplug it from it's host
         * @method remove
         * @chainable
         */
        unplug: function(){
            this.trigger('unload', [this]);
            return this;
        }
    });

    Plugin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Plugin'
    });

    return Plugin;
});