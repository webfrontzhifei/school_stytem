/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-12 下午8:20
 */
LBF.define('ui.Plugins.Cursor', function(require){
    var Plugin = require('ui.Plugins.Plugin');

    /**
     * Add cursor related methods to host. Usually useful to input and textarea.
     * @class Cursor
     * @namespace ui.Plugins
     * @module ui
     * @submodule ui-Plugins
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {ui.Nodes.Node} node Node instance of classes extended from ui.Nodes.Node. Usually textarea and input need the plugin most.
     * @param {Object} [opts] Options of node
     * @example
     *      hostNode.plug(Cursor);
     */
    var Cursor = Plugin.inherit({
        initialize: function(node, opts){
            this.node = node;

            this.addMethods(this.constructor.methods);
        },

        /**
         * Get cursor's position
         * @method getCursorPosition
         * @return {Number} Index out of content string at cursor's position
         * @example
         *      hostNode.plug(Cursor);
         *      // do something
         *      // ...
         *      hostNode.getCursorPosition(); // returns the position of cursor
         */
        getCursorPosition: function(){
            var node = this.node,
                el = node.$el.get(0),
                index = 0;

            if (document.selection) { // IE Support
                node.focus();
                var Sel = document.selection.createRange();
                if (el.nodeName === 'TEXTAREA') { //textarea
                    var Sel2 = Sel.duplicate();
                    Sel2.moveToElementText(el);
                    index = -1;
                    while (Sel2.inRange(Sel)) {
                        Sel2.moveStart('character');
                        index++;
                    }
                } else if (el.nodeName === 'INPUT') { // input
                    Sel.moveStart('character', -el.value.length);
                    index = Sel.text.length;
                }
            } else if (el.selectionStart || el.selectionStart == '0') { // Firefox support
                index = el.selectionStart;
            }

            return (index);
        },

        /**
         * Select a range
         * @method selectRange
         * @chainable
         * @example
         *      hostNode.plug(Cursor);
         *      // do something
         *      // ...
         *      hostNode.selectRange(2, 10); // select from 2nd char to 10th
         */
        selectRange: function(selectionStart, selectionEnd){
            var node = this.node,
                el = node.$el.get(0);
            selectionStart = selectionStart || 0;
            selectionEnd = selectionEnd || selectionStart;

            if (el.setSelectionRange) {
                node.focus();
                el.setSelectionRange(selectionStart, selectionEnd);
            } else if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }

            return node;
        },

        /**
         * Get selected text
         * @return {String} Text selected
         * @example
         *      hostNode.plug(Cursor);
         *      // do something
         *      // ...
         *      hostNode.getRangeText(); // returns text of selected range
         */
        getRangeText: function() {
            var node = this.node;
            if(node.document && node.document.selection) {
                return node.document.selection.createRange().text;
            } else if ("selectionStart" in node) {
                return node.value.substring(node.selectionStart, node.selectionEnd);
            }

            return '';
        }
    });

    Cursor.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Cursor',

        /**
         * Methods to be mix in host node
         * @property methods
         * @type Array
         * @static
         */
        methods: ['getCursorPosition', 'selectRange', 'getRangeText']
    });

    return Cursor;
});