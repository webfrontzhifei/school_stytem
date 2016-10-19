/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-27 下午7:30
 */
LBF.define('ui.widget.ImageViewer', function(require){
    var proxy = require('lang.proxy'),
        browser = require('lang.browser'),
        Tip = require('ui.Nodes.Tip');

    var count = 0,
        imgs;

    /**
     * Simple image viewer. When mouse over a element like a text or small image, show a tip that contains detail image.
     * @class ImageViewer
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Tip
     * @beta
     * @constructor
     * @param {Object} opts Options for initialization
     * @param {Object} [opts.srcElement] Source element of tip, where tip to be pointed to
     * @param {Object} [opts.container=$srcElement.parent()] Container of node
     * @param {String} [opts.content='<img src=""/>'] Viewer content html
     * @param {String} [opts.src] Viewer's image src
     * @param {Object} [opts.width] Viewer content width
     * @param {Object} [opts.height] Viewer content height
     * @param {Number} [opts.maxWidth=500] Max-width of image
     * @param {Number} [opts.maxHeight=500] Max-height of image
     * @param {Object} [opts.events] Node's events
     * @param {String} [opts.wrapTemplate] Template for wrap of node. P.S. The node is wrapped with some other nodes.
     * @param {String} [opts.direction='right'] The direction tip to be pointed to. Options are 'up', 'right', 'down', 'left'.
     * @param {String} [opts.forceDirection=false] The direction that tip is forced to point, will overwritten opts.direction
     * @param {Number} [opts.margin=10] The margin between srcElement and tip, measured in pixel
     * @example
     *      new ImageViewer({
     *          container: 'someContainerSelector',
     *          srcElement: 'sourceElementToBePointedTo',
     *          content: '<div class="wrapper"><img src="" /></div>'
     *          src: someImageURL,
     *          direction: 'up',
     *          margin: 20,
     *          events: {
     *              click: function(){
     *                  alert('click');
     *              },
     *
     *              srcChanged: function(){
     *                  alert('srcChanged');
     *              },
     *
     *              justified: function(){
     *                  alert('justified');
     *              }
     *          }
     *      });
     */
    var ImageViewer = Tip.inherit({
        elements: {
            '$img': 'img'
        },

        render: function(){
            this.superclass.prototype.render.apply(this, arguments);

            this.bind('loaded', proxy(this.justify, this));

            this.bind('change:src', proxy(this.changeSrc, this));
        },

        /**
         * Set image src. Automatically justify image size by calling justify when image loaded
         * @method changeSrc
         * @protected
         * @param {String} src Image src
         * @chainable
         */
        changeSrc: function(src){
            if(!src){
                return this;
            }

            var $img = this.$img,
                id = ++count,
                img = imgs[id] = new Image(),
                viewer = this,
                ready = function(){
                    imgs[id] = img.onreadystatechange = img.onload = null;

                    /**
                     * Fire when image is loaded
                     * @event loaded
                     */
                    viewer.trigger('loaded');
                };

            if(browser.msie){
                img.onreadystatechange = function(){
                    if (/^(?:loaded|complete|undefined)$/.test(this.readyState)){
                        ready();
                    }
                }
            } else {
                img.onload = ready;
            }

            $img.hide();
            $img.prop('src', src);
            img.src = src;

            return this;
        },

        /**
         * Resize image  for proper view
         * @method justify
         * @chainable
         */
        justify: function(){
            var opts = this.opts,
                maxWidth = opts.maxWidth,
                maxHeight = opts.maxHeight,
                $img = this.$img,
				width = $img.width(),
				height = $img.height(),
                viewer = this;

            width <= maxWidth && height <= maxHeight || width/height > maxWidth/maxHeight ? $img.width(maxWidth) : $img.height(maxHeight);
            $img.fadeIn(function(){
                /**
                 * Fire when image is justified
                 * @event justified
                 */
                viewer.trigger('justified');
            });

            return this;
        }
    });

    ImageViewer.include(Tip, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            maxWidth: 500,
            maxHeight: 500,
            content: '<img src=""/>'
        }
    });

    return ImageViewer;
});