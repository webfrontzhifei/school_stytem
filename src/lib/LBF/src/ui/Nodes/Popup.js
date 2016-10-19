/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-10-28 上午9:52
 */
LBF.define('ui.Nodes.Popup', function(require){
    var Style = require('util.Style'),
        $ = require('lib.jQuery'),
		browser = require('lang.browser'),
        Node = require('ui.Nodes.Node'),
        zIndexGenerator = require('util.zIndexGenerator');

    require('{theme}/lbfUI/css/Popup.css');

    var body = document.getElementsByTagName('body')[0];

    /**
     * Base popup component
     * @class Popup
     * @namespace ui.Nodes
     * @module ui
     * @submodule ui-Nodes
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {Object} [opts.container] Container of node
     * @param {Object} [opts.selector] Select an existed tag and replace it with this. If opts.container is set, opts.selector will fail
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @example
     *      new Popup({
     *          container: 'someContainerSelector',
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *
     *              mouseover: function(){
     *                  alert('over me');
     *              }
     *          }
     *      });
     *
     * @example
     *      new Popup({
     *          selector: 'someButtonSelector',
     *          centered: true,
     *          events: {
     *              click: function(){
     *                  alert('click');
     *              }
     *          }
     *      });
     */
    var Popup = Node.inherit({
        /**
         * Render the node
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var wrapTemplate = this.template(this.get('wrapTemplate')),
                $el = this.$(wrapTemplate( this.attributes() )),
                container = this.get('container'),
                $container = this.$container = $(container.$el || container);

            this.setElement($el);

            $container.append($el);

            // element should be in the DOM when set to center, otherwise will cause wrong position
            this.get('centered') && this.setToCenter();

            return this;
        },

        /**
         * Set node to be centered to it's container
         * @method setToCenter
         * @chainable
         * @example
         *      node.setToCenter();
         */
        setToCenter: function(){
            var $container = this.$container,
                offset = /(?:static|auto)/.test($container.css('position')) ? $container.outerPosition() : { top: 0, left: 0},
                containerHeight = $container.outerHeight(),
                containerWidth = $container.outerWidth(),
                popup = this,
                top, left;

            // when container is body, take window into consideration to make sure center position
            if($container.get(0) === body){
				//$container.scrollTop()在IE下为0，请使用$(document)
				top = $(document).scrollTop() + $(window).height()/2 - this.height()/2;
				left = $container.scrollLeft() + $(window).width()/2 - this.width()/2;
				
				this.$el.css({
					top: top,
					left: left
				});
				
				$(window).bind('scroll', function(){
					top = $(document).scrollTop() + $(window).height() / 2 - popup.height()/2;

					popup.$el.css({
						top: top
					});
				})
            }else{
				top = offset.top + Math.max(0, (containerHeight - this.outerHeight()) / 2);
                left = offset.left + Math.max(0, (containerWidth - this.outerWidth()) / 2);

				this.css({
					top: top,
					left: left
				});
			}

            return this;
        },

        updateZIndex: function(){
            this.css('zIndex', zIndexGenerator());
        }
    });

    Popup.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            width: 'auto',
            height: 'auto',
            container: 'body',
            wrapTemplate: '<div class="lbf-popup"><%== content %></div>',
            content: '',
            events: {
                load: function(){},
                unload: function(){}
            }
        }
    });

    return Popup;
});