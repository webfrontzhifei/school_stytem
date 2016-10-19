/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-25 上午10:09
 */
LBF.define('util.Selection', function(require){
    var Class = require('lang.Class'),
        Range = require('util.Range');

    var win = window;

    var Selection = win.getSelection ?
            Class.inherit({
                mode: 'standard',

                MODE_STANDARD: 'standard',
                MODE_IE: 'IE',

                initialize: function(){
                    this.selection = this.getSelection();
                },

                getSelection: function(){
                    return win.getSelection();
                },

                getRangeAt: function(index){
                    var sel = this.selection;
                    index = index || 0;

                    return sel.rangeCount > index ? new Range(sel.getRangeAt(index)) : null;
                },

                createRange: function(range){
                    return new Range(range);
                },

                removeAllRanges: function(){
                    this.selection.removeAllRanges();
                    return this;
                },

                addRange: function(range){
                    this.selection.addRange(range.range || range);
                    return this;
                },

                getRangeCount: function(){
                    return this.selection.rangeCount;
                }
            }):

            Class.inherit({
                mode: 'IE',

                MODE_STANDARD: 'standard',
                MODE_IE: 'IE',

                initialize: function(){
                    this.selection = this.getSelection();
                },

                getSelection: function(){
                    return document.selection;
                },

                getRangeAt: function(){
                    return this.createRange();
                },

                createRange: function(){
                    return new Range();
                },

                removeAllRanges: function(){
                    this.selection.empty();
                    return this;
                },

                addRange: function(range){
                    range.select();
                    return this;
                },

                getRangeCount: function(){
                    return 1;
                }
            });

    return Selection;
});