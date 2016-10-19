/**
 * @fileOverview DragDrop
 * @author amoschen
 * @version 1
 * Created: 12-10-31 上午10:37
 */
LBF.define('ui.Plugins.DragDrop', function(require){
    var extend = require('lang.extend'),
        Drag = require('ui.Plugins.Drag');

    /**
     * Make a node draggable.
     * @class DragDrop
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Drag
     * @beta
     */

    var DragDrop = Drag.inherit({
        initialize: function(node, opts){
            Drag.prototype.initialize.apply(this, arguments);

            this.get('dropArea') && this.setDropArea(this.get('dropArea'));

            this.bindDropUI();
        },

        bindDropUI: function(){
            var top0, left0, dropArea, $el;

            this.bind('beforeDrag', function(e, dd){
                top0 = dd.$el.css('top');
                left0 = dd.$el.css('left');
                $el = dd.$el;
                dropArea = dd.dropArea;
            });

            this.bind('drop', function(e, dd, x, y, left, top){
                if(!dropArea){
                    return;
                }

                if(top < dropArea.top || top + $el.height() > dropArea.bottom ||
                    left < dropArea.left || left + $el.width() > dropArea.right){
                    $el.css({
                        top: top0,
                        left: left0
                    });
                }
            });
        },

        setDropArea: function(area){
            if(area && !area.top){
                area = this.$(area);
                var offset = this.$(area).outerPosition();
                area = {
                    top: offset.top,
                    left: offset.left,
                    bottom: offset.top + area.height(),
                    right: offset.left + area.width()
                };
            }

            this.dropArea = area;

            return this;
        }
    });

    DragDrop.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'DragDrop',

        /**
         * Methods to be mix in host node
         * @property methods
         * @type {Array}
         * @static
         */
        methods: ['enableDrag', 'disableDrag', 'enableProxy', 'disableProxy', 'setDragArea', 'setDropArea'],

        /**
         * Events to be mix in host node
         * @property events
         * @type {Array}
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
        settings: extend(true, {}, Drag.settings)
    });

    return DragDrop;
});