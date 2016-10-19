/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-25 上午10:30
 */
LBF.define('util.Range', function(require){
    var Class = require('lang.Class'),
        isString = require('lang.isString'),
        contains = require('util.contains');

    var doc = document,
        selection = window.getSelection ? window.getSelection() : document.selection;

    var Range = window.getSelection ?
            Class.inherit({
                initialize: function(range){
                    range = range || doc.createRange();

                    this.range = range;
                },

                deleteContents: function(){
                    this.range.deleteContents();
                    return this;
                },

                insertNode: function(node){
                    this.range.insertNode(node);
                    return this;
                },

                replaceWith: function(node, collapse, collapseToStart){
                    isString(node) && (node = document.createTextNode(node));

                    var range = this.range;
                    range.deleteContents();
                    range.insertNode(node);
                    range.setStart(range.endContainer, range.endOffset);

                    collapse && range.collapse(collapseToStart || false);

                    return this;
                },

                /**
                 * 判断一个range是否被包含在container中
                 * @memberOf ui.BaseEditor
                 * @function
                 * @name containsRange
                 * @param {HTMLElement} container
                 * @param {Range} range
                 * @return {Boolean}
                 */
                containedIn: function(container){
                     var range = this.range,
                         rangeParent = range.commonAncestorContainer || null;
                     if(rangeParent){
                         return contains(container, rangeParent, true);
                     }
                     return false;
                }
            }):

            Class.inherit({
                RANGE_TYPE_NONE: 'None',
                RANGE_TYPE_TEXT: 'Text',
                RANGE_TYPE_CONTROL: 'Control',

                _selection: selection,

                initialize: function(){
                    this.range = selection.createRange();
                },

                deleteContents: function(){
                    this.replaceWith('', false);
                    return this;
                },

                insertNode: function(node){
                    var range = this.range.insertNode(node),
                        isStr = isString(node);

                    if(this._isTypeText()){
                        range.parseHTML(range.text + (isStr ? node : node.innerHTML));
                        return this;
                    }

                    if(this._isTypeControl()){
                        range.add(isStr ? doc.createTextNode(node) : node);
                    }

                    return this;
                },

                replaceWith: function(node, collapse, collapseToStart){
                    var range = this.range,
                        isStr = isString(node);

                    if(this._isTypeText()){
                        range.parseHTML(isStr ? node : node.innerHTML);
                        return this;
                    }

                    if(this._isTypeControl()){
                        for(var i = 0, len = range.length; i<len; i++){
                            range.remove(0);
                        }

                        range.add(isStr ? doc.createTextNode(node) : node);
                    }

                    collapse && range.collapse(collapseToStart || false);

                    return this;
                },

                select: function(){
                    this.range.select();
                    return this;
                },

                /**
                 * 选择文本范围
                 * @param {Object} node 原生dom元素
                 * @param {Number} start 起始位置
                 * @param {Number} end 结束位置
                 */
                selectTextRange: function(node, start, end) {  
                    if(start > node.value.length) {
                        start = node.value.length;
                    }
                    if(end > node.value.length) {
                        end = node.value.length;
                    }
                    if(start > end) {
                        var temp = start;
                        start = end;
                        end = temp;
                    }
                    if(node.createTextRange) {   //IE
                        var textRange = node.createTextRange();
                        textRange.moveStart('character', start);
                        textRange.moveEnd('character', end);       
                        textRange.select();       
                    } else if(node.setSelectionRange) { 
                        node.setSelectionRange(start, end);  
                        node.focus();  
                    }  
                },

                containedIn: function(container){
                    var range = this.range,
                        rangeParent = range.parentElement && range.parentElement() || null;

                    if(rangeParent){
                        return contains(container, rangeParent, true);
                    }

                    return false;

                },

                _getRangeType: function(){
                    return this._selection.type;
                },

                _isTypeNone: function(){
                    return this._getRangeType() === this.RANGE_TYPE_NONE;
                },

                _isTypeText: function(){
                    return this._getRangeType() === this.RANGE_TYPE_TEXT;
                },

                _isTypeControl: function(){
                    return this._getRangeType() === this.RANGE_TYPE_CONTROL;
                }
            });

    return Range;
});