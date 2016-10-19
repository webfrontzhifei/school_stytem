/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-27 下午4:27
 */

/**
 * UI Components
 * @main ui
 * @module ui
 */

/**
 * Single node components
 * @module ui
 * @submodule ui-Nodes
 */

LBF.define('ui.Nodes.Node', function(require){
    var each = require('lang.each'),
        defaults = require('util.defaults'),
        proxy = require('lang.proxy'),
        Inject = require('lang.Inject'),
        template = require('util.template'),
        Attributes = require('util.Attribute'),
        trim = require('lang.trim'),
        isString = require('lang.isString'),
        jQuery = require('lib.jQuery'),
        Class = require('lang.Class');

    var PLUGINS = '_PLUGINS';

    var methods = {},
        fn = jQuery.fn;

	//this.method = this.$el.method
    for(var methodName in fn){
        if(fn.hasOwnProperty(methodName)){
            (function(methodName){
                methods[methodName] = function(){
                    if(!this.$el){
                        this.setElement('<div></div>');
                    }

                    var result = this.$el[methodName].apply(this.$el, arguments);
                    return this.$el === result ? this : result;
                }
            })(methodName);
        }
    }

    delete methods.constructor;

    /**
     * All ui components' base. All jQuery methods and template engine are mixed in.
     * @class Node
     * @namespace ui.Nodes
     * @extends lang.Class
     * @uses lib.jQuery
     * @uses util.Attributes
     * @uses lang.Inject
     * @constructor
     * @param {String|jQuery|documentElement|ui.Nodes.Node} selector Node selector
     * @example
     *      new Node('#someElement'); // Turn element, which id is 'someElement', into a node
     *
     * @example
     *      // jQuery object or Node object or document element object are all acceptable
     *      new Node($('#someElement'));
     *      new Node(new Node('#someElement'));
     *      new Node(document.getElementById('someElement'));
     */
    return Class.inherit(methods, Attributes, Inject, {
        initialize: function(opts){

			//merge options
            this.mergeOptions(opts);

			//render structure
            this.render();

            /**
             * Fire when node initialized
             * @event load
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('load', [this]);
        },

        /**
         * @method $
         * @uses lib.jQuery
         */
        $: jQuery,

        /**
         * @method jQuery
         * @uses lib.jQuery
         */
        jQuery: jQuery,

        /**
         * @method template
         * @uses util.template
         */
        template: template,

        // todo
        // copy static property settings when inheriting

        /**
         * Merge options with defaults and cache to node.opts
         * @method mergeOptions
         * @param {Object} opts Options to be merged
         * @protected
         * @chainable
         * @example
         *      node.mergeOptions({
         *          //options
         *      });
         */
        mergeOptions: function(opts){
            // use this.defaults before fall back to constructor.settings
            // which enables default settings to be inherited
            var options = defaults( true, opts || (opts = {}), this.defaults || this.constructor.settings || {} );

            // set to attributes, keep silent to avoid firing change event
            this.set(options, { silence: true });
            return this;
        },

        /**
         * Render node
         * Most node needs overwritten this method for own logic
         * @method render
         * @chainable
         */
        render: function(){
            this.setElement(this.get('selector'));
            return this;
        },

        /**
         * Set node's $el. $el is the base of a node ( UI component )
         * Cautious: direct change of node.$el may be dangerous
         * @method setElement
         * @param {String|documentElement|jQuery|Node} el The element to be core $el of the node
         * @chainable
         */
        setElement: function(el){
            var $el = this.jQuery(el.node || el);

            if(this.$el){
                this.$el.replaceWith($el);
            }

            this.$el = $el;
            this.el = $el.get(0);

            // customize className
            if(this.get('className')) {
                this.$el.addClass(this.get('className'));
            }

            // Initialization of common elements for the component
            this.initElements();

            // Component default events
            this.delegateEvents();

            // Instance events
            this.initEvents();

            // Component's default actions, should be placed after initElements
            this.defaultActions();

            return this;
        },

        /**
         * Delegate events to node
         * @method delegateEvents
         * @param {Object} [events=this.events] Events to be delegated
         * @chainable
         * @example
         *      node.delegateEvents({
         *          'click .child': function(){
         *              alert('child clicked');
         *          }
         *      });
         */
        delegateEvents: function(events){
            events = events || this.events;
            if(!events){
                return this;
            }

            // delegate events
            var node = this;
            each(events, function(delegate, handler){
                var args = (delegate + '').split(' '),
                    eventType = args.shift(),
                    selector = args.join(' ');

                if(trim(selector).length > 0){
                    // has selector
                    // use delegate
                    node.delegate(selector, eventType, function(){
                        return node[handler].apply(node, arguments);
                    });

                    return;
                }

                node.bind(eventType, function(){
                    return node[handler].apply(node, arguments);
                });
            });

            return this;
        },

        /**
         * All default actions bound to node's $el
         * @method defaultActions
         * @protected
         */
        defaultActions: function(){

        },

        /**
         * Bind options.events
         * @method initEvents
         * @param {Object} [delegate=this] Object to be apply as this in callback
         * @chainable
         * @protected
         */
        initEvents: function(delegate){
            var node = this,
                events = this.get('events');

            if(!events){
                return this;
            }

            delegate = delegate || node;
            for(var eventName in events){
                if(events.hasOwnProperty(eventName)){
                    node.bind(eventName, proxy(events[eventName], delegate));
                }
            }

            return this;
        },

        /**
         * Find this.elements, wrap them with jQuery and cache to this, like this.$name
         * @method initElements
         * @chainable
         * @protected
         */
        initElements: function(){
            var elements = this.elements;

            if(elements){
                for(var name in elements){
                    if(elements.hasOwnProperty(name)){
                        this[name] = this.find(elements[name]);
                    }
                }
            }

            return this;
        },

        /**
         * Init plugins in initialization options
         * @chainable
         * @protected
         */
        initPlugins: function(){
            var plugins = this.get('plugins'),
                plugin;

            if(plugins){
                for(var i= 0, len= plugins.length; i< len; i++){
                    plugin = plugins[i];
                    this.plug(plugin.plugin, plugin.options);
                }
            }

            return this;
        },

        /**
         * Node element's property getter and setter
         * @method prop
         * @param {String} name Property name
         * @param [value] Property value, if you are using getter mode, leave it blank
         */
        prop: function(name, value){
            return typeof value === 'undefined' ? this.getProp(name) : this.setProp(name, value);
        },

        /**
         * Node element's property setter
         * @param {String} name Property name
         * @param value Property value
         * @chainable
         */
        setProp: function(name, value){
            this.$el.prop(name, value);
            return this;
        },

        /**
         * Node element's property getter
         * @param {String} name Property name
         * @returns {*} Property value
         */
        getProp: function(name){
            return this.$el.prop(name);
        },

        /**
         * Event trigger
         * @method trigger
         * @param {String} type Event type
         * @param {jQuery.Event} [event] Original event
         * @param {Object} [data] Additional data as arguments for event handlers
         * @returns {Boolean} Prevent default actions or not
         */
//        trigger: function( type, data, event ) {
//            var prop, orig;
//
//            data = data || {};
//            event = this.jQuery.Event( event );
//            event.type = type.toLowerCase();
//            // the original event may come from any element
//            // so we need to reset the target on the new event
//            this.$el && (event.target = this.$el[ 0 ]);
//
//            // copy original event properties over to the new event
//            orig = event.originalEvent;
//            if ( orig ) {
//                for ( prop in orig ) {
//                    if ( !( prop in event ) ) {
//                        event[ prop ] = orig[ prop ];
//                    }
//                }
//            }
//
//            this.$el.trigger( event, data );
//            return !event.isDefaultPrevented();
//        },

        /**
         * Plug a plugin to node
         * @method plug
         * @param {Plugin} Plugin Plugin class, not instance of Plugin
         * @param {Object} opts Options for plugin
         * @param {String} opts.ns Namespace of Plugin
         * @chainable
         * @example
         *      node.plug(Drag);
         *
         * @example
         *      node.plug(Drag, {
         *          //plugin options
         *          handler: '.handler',
         *          proxy: true
         *      });
         */
        plug: function(Plugin, opts){
            var plugin = new Plugin(this, opts || {});
            !this[PLUGINS] && (this[PLUGINS] = {});
            this[PLUGINS][Plugin.ns] = plugin;
            return this;
        },

        /**
         * Unplug a plugin
         * @method unplug
         * @param {String|Object} ns Namespace of Plugin or Plugin object
         * @chainable
         * @example
         *      node.unplug('Drag'); || node.unplug(Drag);
         */
        unplug: function(ns){
            if(isString(ns)){
                if(this[PLUGINS][ns]){
                    this[PLUGINS][ns].unplug();
                    this[PLUGINS][ns] = null;
                }
            }else{
                this[PLUGINS][ns.ns] && this[PLUGINS][ns.ns].unplug();
            }
            return this;
        },

        /**
         * Remove node and unplug all plugins. 'onUnload' event will be triggered.
         * @method remove
         * @chainable
         */
        remove: function(){
            // trigger before node is removed
            // otherwise, event bound will be remove before trigger
            /**
             * Fire when node removed
             * @event onUnload
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('unload', [this]);

            this.$el.remove();

            var plugins = this[PLUGINS];
            if(plugins){
                each(plugins, function(){
                    this.unplug();
                });
            }

            return this;
        }
    });
});
