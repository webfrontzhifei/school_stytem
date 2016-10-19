/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-28 下午5:58
 */
LBF.define('ui.Plugins.Drag', function(require){
    var Style = require('util.Style'),
        Plugin = require('ui.Plugins.Plugin'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/Drag.css');

    /**
     * Make a node draggable.
     * @class Drag
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Node instance of classes extended from ui.Nodes.Node
     * @param {Object} [opts] Options of node
     * @param {Boolean} [opts.proxy=false] Whether to Use proxy layer instead of node itself. Turn this on when host node is complex will benefits a lot in performance.
     * @param {String} [opts.delegate] The selector of elements to be delegated to node of draggable feature. When delegate is set, use delegate mode automatically.
     * @param {String|jQuery|documentElement} [opts.handler=this.$el] Drag handler
     * @param {Object|jQuery|documentElement} [opts.area] Limited drag area. Exactly positions of top, right, bottom and left or jQuery object/document element are ok.
     * @param {Number} [opts.area.top]
     * @param {Number} [opts.area.right]
     * @param {Number} [opts.area.bottom]
     * @param {Number} [opts.area.left]
     * @example
     *      node.plug(Drag, {
     *          proxy: true, // optimize performance
     *          handler: '.handler' // assign a handler for dragging
     *      });
     *
     * @example
     *      node.plug(Drag, {
     *          area: 'areaSelector' // limit drag area to a certain area
     *      });
     */
    var Drag = Plugin.inherit({
        initialize: function(node, opts){
            this.node = node;
            this.addMethods(this.constructor.methods);

            this.mergeOptions(opts);

            this.initEvents();
            this.render();
            this.bindUI();

            this.bindEventsToHost(this.constructor.bindEventsToHost);

            this.trigger('load', [this]);
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            this.$el = this.node.$el;
            this.get('area') && this.setDragArea(this.get('area'));

            this.get('proxy') && this.createProxy();
            this.bind('change:proxy', function(){
                if(this.get('proxy')){
                    // enable proxy
                    this.removeProxy();
                    this.createProxy();
                    return;
                }

                // disable proxy
                this.removeProxy();
            });

            return this;
        },

        /**
         * Bind UI events like startDrag, watchDrag and endDrag
         * @method bindUI
         * @protected
         * @chainable
         */
        bindUI: function(){
            var dd = this,
                delegate = dd.get('delegate'),
                $body = dd.$(document),
                stickOnTrack = dd.get('stickOnTrack').toLowerCase(),
                $el = dd.$el,
                area = dd.get('area'),
				needWatch = false,
                $drag, $handler, $proxy, x0, y0, left, top;

            /**
             * @method startDrag
             * @private
             * @param {Event} e
             * @returns {Boolean}
             */
            var startDrag = function(e){
                    if(dd.disabled){
                        return;
                    }
					
					var containerOffset = $drag.offsetParent().offset(),
                        dragWidth = $drag.outerWidth(),
                        dragHeight = $drag.outerHeight(),
                        proxyWidth = dd.get('width') || dragWidth,
                        proxyHeight = dd.get('height') || dragHeight;

                    y0 = e.pageY;
                    x0 = e.pageX;
					needWatch = true;

                    if(dd.get('proxy')){
                        $proxy
                            .css({
                                width: proxyWidth,
                                height: proxyHeight
                            })
                            .show();

                        left = x0 - containerOffset.left - (dragWidth - $proxy.outerWidth())/2;
                        top = y0 - containerOffset.top - (dragHeight - $proxy.outerHeight())/2;
                    } else {
                        left = parseInt($proxy.css('left'), 10);
                        top = parseInt($proxy.css('top'), 10);
                    }

                    $proxy.css({
                        top: top,
                        left: left,
                        position: 'absolute',
                        //z-index始终为当前最大值
                        zIndex: zIndexGenerator()
                    });

                    /**
                     * Fired befor drag starts
                     * @event beforeDrag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's y direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('beforeDrag', [dd, x0, y0, left, top]);
                },

                /**
                 * @method watchDrag
                 * @private
                 * @param {Event} e
                 * @returns {Boolean}
                 */
                watchDrag = function(e){
					if(!needWatch) {
						return true;
					}
					
                    top = top + e.pageY - y0;
                    left = left + e.pageX - x0;

                    if(area){
                        top = Math.min(Math.max(top, area.top), area.bottom - $drag.outerHeight());
                        left = Math.min(Math.max(left, area.left), area.right - $drag.outerWidth());
                    }

                    var position = {
                        top: top,
                        left: left
                    };

                    if(stickOnTrack === 'x'){
                        delete position.top
                    }

                    if(stickOnTrack === 'y'){
                        delete position.left
                    }

                    $proxy.css(position);

                    y0 = e.pageY;
                    x0 = e.pageX;

                    /**
                     * Fired when dragging
                     * @event drag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('drag', [dd, x0, y0, left, top]);
                },

                /**
                 * @method endDrag
                 * @private
                 * @param {Event} e
                 * @returns {Boolean}
                 */
                endDrag = function(e){
                    needWatch = false;

                    x0 = e.pageX;
                    y0 = e.pageY;

                    /**
                     * Fired when drag ends
                     * @event drag
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('afterDrag', [dd, x0, y0, left, top]);

                    /**
                     * Fired before drop
                     * @event beforeDrop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('beforeDrop', [dd, x0, y0, left, top]);

                    // final adjust
                    watchDrag(e);

                    // if not using proxy mode
                    if($drag !== $proxy){
                        // hide proxy
                        $proxy.hide();

                        // final set $drag position
                        $drag.css({
                            top: top,
                            left: left,

                            //使用proxy时，drop也需要更新z-index
                            zIndex: zIndexGenerator()
                        });
                    }

                    /**
                     * Fired when drop
                     * @event drop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('drop', [dd, x0, y0, left, top]);

                    /**
                     * Fired after drop
                     * @event afterDrop
                     * @param {ui.Plugins.Drag} dd Instance of drag plugin instance
                     * @param {Number} pageX Event's x direction location(pageX)
                     * @param {Number} pageY Event's x direction location(pageY)
                     * @param {Number} left Position left
                     * @param {Number} top Position top
                     */
                    dd.trigger('afterDrop', [dd, x0, y0, left, top]);
                };

            // update area
            dd.bind('change:area', function(){
                area = dd.get('area');
            });

            if(delegate){
                // when proxy changed
                // move proxy to $drag's parent node
                dd.bind('change:proxy', function(){
                    dd.get('proxy') && dd.$proxy.appendTo(($drag || $el).parent());
                });

                // use delegate mode
                $el.delegate(delegate, 'mousedown', function(e){
                    // don't bind event on input
                    // otherwise input can't be operated
                    var tagName = e.target.tagName.toLowerCase();
                    if(tagName === 'input' || tagName === 'textarea'){
                        return;
                    }

                    // prepare variables when delegating
                    if(!$drag || $drag.get(0) !== e.currentTarget){
                        // when no drag element assigned yet
                        // or drag element has been changed

                        // change to new drag element
                        $drag = dd.$drag = dd.$(e.currentTarget);

                        // make sure $drag is draggable
                        /^static|relative$/.test($drag.css('position')) && $drag.css('position', 'absolute');

                        // move proxy
                        $proxy = dd.get('proxy') ? dd.$proxy.appendTo($drag.parent()) : $drag;

                        $handler = dd.$handler = dd.get('handler') ? $drag.find(dd.get('handler')) : $drag;
                    }

                    startDrag(e);
                });
            } else {
                // use normal mode

                // prepare variables
                $drag = dd.$drag = $el;
                $handler = this.$handler = dd.get('handler') ? $el.find(dd.get('handler')) : $el;
                $proxy = dd.get('proxy') ? this.$proxy : $drag;

                // make sure $drag is draggable
                /^static|relative$/.test($drag.css('position')) && $drag.css('position', 'absolute');

                // when proxy changed
                // reset $drag
                dd.bind('change:proxy', function(){
                    dd.get('proxy') && ($drag = dd.$proxy);
                });

                // bind event
                $handler.mousedown(function(e){
                    // don't bind event on input
                    // otherwise input can't be operated
                    var tagName = e.target.tagName.toLowerCase();
                    if(tagName === 'input' || tagName === 'textarea'){
                        return;
                    }
					
                    startDrag(e);
                });
            }

            // bind mouse move & up events
            $body
                .bind('mousemove.drag', watchDrag)
                .bind('mouseup.drag', endDrag);


            return this;
        },

        /**
         * Disable drag
         * @method disableDrag
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.disableDrag();
         */
        disableDrag: function(){
            this.disabled = true;
            return this;
        },

        /**
         * Enable drag
         * @method enableDrag
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.enableDrag();
         */
        enableDrag: function(){
            this.disabled = false;
            return this;
        },

        /**
         * Create proxy element
         * @method createProxy
         * @protect
         * @returns {jQuery} Proxy element
         */
        createProxy: function(){
            var proxy = this.get('proxy'),
                delegate = this.get('delegate'),
                proxyTemplate = proxy === true ? this.get('proxyTemplate') : proxy;

            return this.$proxy = this.$(proxyTemplate).appendTo(delegate ? this.$el : this.$el.offsetParent());
        },

        /**
         * Remove proxy element
         * @method removeProxy
         * @protect
         * @chainable
         */
         removeProxy: function(){
            this.$proxy && this.$proxy.remove();
            return this;
         },

        /**
         * Use proxy element instead of real element when dragging. This will improve performance effectively when real element is complex. Shortcut to set('proxy', proxy).
         * @method enableProxy
         * @param {Boolean|String|jQuery|documentElement} [proxy=true] Assign proxy element
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.enableProxy();
         */
        enableProxy: function(proxy){
            return this.set('proxy', proxy || true);
        },

        /**
         * Disable using proxy element. Shortcut to set('proxy', false).
         * @method disableProxy
         * @chainable
         * @example
         *      node.plug(Drag, {
         *          proxy: true
         *      });
         *      // do something
         *      // ...
         *      node.disableProxy();
         */
        disableProxy: function(){
            return this.set('proxy', false);
        },

        /**
         * Set draggable area
         * @method setDragArea
         * @param {Object|jQuery|documentElement} [area] Limited draggable area. Exactly positions of top, right, bottom and left or jQuery object/document element are ok.
         * @param {Number} [area.top]
         * @param {Number} [area.right]
         * @param {Number} [area.bottom]
         * @param {Number} [area.left]
         * @chainable
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      node.setDragArea('restrictAreaSelector');
         *
         * @example
         *      node.plug(Drag);
         *      // do something
         *      // ...
         *      // restrict to a square area width and height of which are both 100px
         *      node.setDragArea({
         *          top: 0,
         *          bottom: 100,
         *          left: 0,
         *          right: 100
         *      });
         */
        setDragArea: function(area){
            if(area && !area.top && area.top !== 0){
                area = this.$(area);

                var offset = this.$(area).outerPosition();

                //按照目前这个思路，如果父容器position为relative或者absolute，left=0; top=0，遗留z-index无法逾越的问题，需要在业务侧管理好z-index，by rains
                if(area.css('position') === 'relative' || area.css('position') === 'absolute'){
                    offset = {
                        top: 0,
                        left:0
                    };
                }

                area = {
                    top: offset.top,
                    left: offset.left,
                    bottom: offset.top + area.innerHeight(),
                    right: offset.left + area.innerWidth()
                };
            }

            this.set('area', area);

            return this;
        },

        /**
         * Remove drag, including clear proxy element
         * @method remove
         */
        remove: function(){
            this.removeProxy();
            return Plugin.prototype.remove.apply(this, arguments);
        }
    });

    Drag.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Drag',

        /**
         * Methods to be mix in host node
         * @property methods
         * @type Array
         * @static
         */
        methods: ['enableDrag', 'disableDrag', 'enableProxy', 'disableProxy', 'setDragArea'],

        /**
         * Events to be mix in host node
         * @property events
         * @type Array
         * @static
         */
        bindEventsToHost: ['load', 'unload', 'beforeDrag', 'afterDrag', 'drag', 'beforeDrop', 'afterDrop', 'drop'],

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            proxyTemplate: '<div class="lbf-drag-proxy"></div>',

            stickOnTrack: 'xy'
        }
    });

    return Drag;
});
