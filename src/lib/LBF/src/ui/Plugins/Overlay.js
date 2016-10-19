/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-5 下午8:51
 */
LBF.define('ui.Plugins.Overlay', function(require){
    var proxy = require('lang.proxy'),
        Inject = require('lang.Inject'),
        Style = require('util.Style'),
        zIndexGenerator = require('util.zIndexGenerator'),
        $ = require('lib.jQuery'),
        Plugin = require('ui.Plugins.Plugin');

    var body = document.getElementsByTagName('body')[0],
        $doc = $(document);

    /**
     * Create overlay that covers the host
     * @class Overlay
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Instance of classes extended from ui.Nodes.Node
     * @param {Object} [opts] Options of node
     * @param {String} [opts.overlayTemplate] Overlay's template
     * @param {String|jQuery|documentElement} [opts.container] Overlay's container
     * @param {String} [opts.backgroundColor] Background color
     * @param {Number} [opts.opacity] Opacity of overlay
     * @param {Number} [opts.zIndex] ZIndex of overlay
     * @example
     *      node.plug(Overlay, {
     *          container: 'whereTheOverlayGoes',
     *          backgroundColor: '#000',
     *          opacity: 0.1,
     *          zIndex: 10
     *      });
     */
    var Overlay = Plugin.inherit(Inject, {
        initialize: function(node, opts){
            this.mergeOptions(opts);
            this.node = node;

            this.render();
            this.initEvents();
            this.injectMethods(['show', 'hide']);

            this.trigger('load', [this]);
        },

        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var $el = this.$el = this.$(this.get('overlayTemplate')).hide(),
                $container = this.$container = this.$(this.get('container') || this.node.$el).append($el);

            this.css({
                backgroundColor: this.get('backgroundColor'),
                opacity: this.get('opacity'),
                zIndex: this.get('zIndex') || zIndexGenerator()
            }).show();
            
            if($container.get(0) !== body){
                // body needs no position:relative, otherwise may cause layout problem
                if( /(?:static|auto)/.test($container.css('position')) ){
                    $container.css('position', 'relative');
                }
            } else {
                // if container is body, listen to window's resize event for auto-expand
                $doc.bind('resize', proxy(this.expand, this));
            }

            return this;
        },

        /**
         * Show overlay
         * @method show
         * @chainable
         */
        show: function(){
            this.expand();

            this.$el.show();

            return this.node;
        },

        /**
         * Expand to full width & height as container
         * @method expand
         * @chainable
         */
        expand: function(){
            var $container = this.$container,
                width = $container.outerWidth(),
                height = $container.outerHeight();

            if($container.get(0) === body){
                width = Math.max(width, $doc.width());
                height = Math.max(height, $doc.height());
            }

            this.$el.css({
                width: width,
                height: height
            });

            return this.node;
        },

        /**
         * Unplug overlay from host
         * @method unplug
         * @chainable
         */
        unplug: function(){
            this.$el.remove();
            this.trigger('unload', [this]);
            return this;
        }
    });

    Overlay.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Overlay',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            overlayTemplate: [
                '<div class="lbf-overlay"></div>'
            ].join(''),

            opacity: 0.3,

            backgroundColor: 'black'
        },

        /**
         * Default styles
         * @property cssText
         * @type String
         * @static
         * @protected
         */
        cssText: [
            '.lbf-overlay { position:absolute; top:0; left:0;}'
        ].join(' ')
    });

    Style.add('lbf-overlay', Overlay.cssText);

    return Overlay;
});