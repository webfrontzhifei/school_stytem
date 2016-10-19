/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-9 下午4:43
 */
LBF.define('ui.widget.RichEditor.RichEditor', function(require){
    var browser = require('lang.browser'),
        extend = require('lang.extend'),
        contains = require('util.contains'),
        Node = require('ui.Nodes.Node');

    require('{theme}/lbfUI/css/RichEditor.css');

    var RichEditor = Node.inherit({
        /**
         * Commonly used elements
         * @property elements
         * @protected
         */
        elements: {
            /**
             * Input area
             * @property $input
             * @protected
             */
            '$input': '.LBF-RichEditor-input'
        },

        /**
         * Delegated events of the component
         * @property events
         * @protected
         */
        events: {
            'blur .LBF-RichEditor-input': '_onBlur',
            'beforeblur .LBF-RichEditor-input': '_onBeforeBlur',
            'mousedown .LBF-RichEditor-input': '_onMouseDown',
            'keyup .LBF-RichEditor-input': '_onKeyUp',
            input: '_onInput'
        },

        /**
         * @override
         */
        setElement: function(){
            // clear up
            this.$placeholder = null;

            Node.prototype.setElement.apply(this, arguments);

            return this;
        },

        /**
         * Default actions when setting element
         * @override
         */
        defaultActions: function(){
            var node = this;

            this.on('change:readOnly', function(event, attr){
                node.prop('contentEditable', attr);
            });

            this.on('change:placeholder', function(event, attr){
                node._setPlaceholder(attr);
            });

            if(browser.msie){
                var $input = this.$input,
                    inputTimer;

                $input
                    .focus(function(){
                        inputTimer && clearInterval(inputTimer);

                        var content = node.getContent();
                        inputTimer = setInterval(function(){
                            var newContent = node.getContent();
                            if(content !== newContent){
                                /**
                                 * Fire when input ( content changed )
                                 * @event input
                                 */
                                node.trigger('input');
                                content = newContent;
                            }
                        }, 50);
                    })
                    .blur(function(){
                        inputTimer && clearInterval(inputTimer);
                    });
            }
        },

        /**
         * Render editor
         * @override
         */
        render: function(){
            var plugins = this.get('plugins');

            if(plugins){
                for(var i= 0, len= plugins.length; i< len; i++){
                    // todo
                    // async load plugin
                }
            }

            var wrapTemplate = this.wrapTemplate = this.template(this.get('wrapTemplate')),
                $el = wrapTemplate(this.attributes());

            this
                .setElement($el)
                .appendTo(this.get('container'));

            var $input = this.$input;

            $input.prop('contentEditable', true);

            this.get('placeholder') && this._setPlaceholder(this.get('placeholder'));

            // for ie
            if(browser.isIE9Below){
                // ie 6 :hover
                if(browser.isIE6){
                    $input
                        .mouseenter(function(){
                            $input.addClass('LBF-RichEditor-input-hover');
                        })
                        .mouseleave(function(){
                            $input.removeClass('LBF-RichEditor-input-hover');
                        });
                }

                // :focus
                $input
                    .focus(function(){
                        $input.addClass('LBF-RichEditor-input-focus');
                    })
                    .blur(function(){
                        $input.removeClass('LBF-RichEditor-input-focus');
                    });
            }

            return this;
        },

        /**
         * Get raw html of input content
         * @method getContent
         * @returns {String}
         */
        getContent: function(){
            return this.$input.html();
        },

        /**
         * Clear all contents in editor body
         * @method empty
         * @chainable
         */
        empty: function(){
            this.$input.html('');
            return this;
        },

        /**
         * Disable editor
         * @method disable
         * @chainable
         */
        disable: function(){
            return this.set('readOnly', true);
        },

        /**
         * Enable editor
         * @method enable
         * @chainable
         */
        enable: function(){
            return this.set('readOnly', false);
        },

        /**
         * Is content empty, exclude br tag
         * @method isEmpty
         * @returns {Boolean}
         */
        isEmpty: function(){
            // editable element will leave a <br> when blank
            // so we have to trim it before test
            var EMPTY_RE = /<br>/g;

            return !(this.getContent().replace(EMPTY_RE, ''));
        },

        /**
         * 在光标处插入一段html
         * NOTE:调用时需确保光标在输入框中
         * @method insertHtml
         * @param {String} html
         * @chainable
         */
        insertHtml: function(html) {
            if (html === '') {
                return this;
            }

            var range = this.getRange(),
                inputNode = this.$input.get(0);

            if (!range) {//如果拿不到输入框中的range, 就直接添加到最后
                if (this.isEmpty()) {
                    inputNode.innerHTML = html;
                } else {
                    inputNode.innerHTML += html;
                }

                range = this.constructor.getRange();

                if(!range){
                    return this;
                }

                var divLastNode = inputNode.lastChild;
                if (range.selectNode) {
                    range.setEndAfter(divLastNode);
                    range.setStartAfter(divLastNode);
                    var selection = this.constructor.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else if (range.moveToElementText) {
                    range.moveToElementText(divLastNode);
                    range.collapse(false);
                    range.select();
                }

            } else if(range.pasteHTML) {//ie, ie9 也在这里
                //html += '<img style="display:inline;width:1px;height:1px;">';
                range.pasteHTML(html);
                range.collapse(false);
                range.select();

            } else if (range.createContextualFragment) {//ie9竟然不支持这个方法
                // 使用img标签是因为img是行内元素的同时, 又能设置宽高占位
                html += '<img style="display:inline;width:1px;height:1px;">';
                var fragment = range.createContextualFragment(html);
                var lastNode = fragment.lastChild;
                //如果已经选中了内容, 先把选中的删除
                range.deleteContents();
                range.insertNode(fragment);
                //插入后把开始和结束位置都放到lastNode后面, 然后添加到selection
                range.setEndAfter(lastNode);
                range.setStartAfter(lastNode);
                var selection = this.constructor.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                //把光标滚动到可视区
                //            if(lastNode.nodeType === 1){
                //                ff开了firbug的时候, 会导致样式错乱, 换用scrollTop的方式
                //                lastNode.scrollIntoView();
                //            }

                var $ = this.jQuery,
                    delY = $(inputNode).offset().top - $(lastNode).offset().top;

                inputNode.scrollTop = delY < inputNode.scrollHeight ? inputNode.scrollHeight : delY;

                // 删除附加的节点, 这里只能这样删, chrome直接remove节点会导致光标消失掉
                if (!browser.opera) {//TODO opera的光标还原有问题, 要想办法解决
                    document.execCommand('Delete', false, null);
                }
                if (contains(inputNode, lastNode)) {//for opera
                    inputNode.removeChild(lastNode);
                }
            }

            if (this.get('keepCursor')) {
                //插入后把最后的range设置为刚刚的插入点
                this.saveRange();
            }

            return this;
        },

        /**
         * Clear tags of input content, except the node fits a filter
         * @method clearNodes
         * @chainable
         */
        clearNodes: function(){
            /*
             * 这里的原理是:
             * 倒序遍历输入框的直接子节点
             * 1. 如果是文本节点则跳过
             * 2. 如果是element,且不是br,则用其包含的文本保存替换该节点
             * 3. 如果是其他, 如comment,则移除
             * 最后把光标位置还原
             */
            var editable = this.$input.get(0),
                childNodes = editable.childNodes,
                text, textNode, cursorNode;

            for(var i = childNodes.length - 1, node, nodeType; i>=0; i--){
                node = childNodes[i];
                nodeType = node.nodeType;

                if(nodeType === 1){ // element
                    // filter function returns true when needs no filter
                    if(node.nodeName !== 'BR' && !this.filter(node)){
                        text = node.textContent || node.innerText || ''; // innerText for ie

                        textNode = document.createTextNode(text);

                        cursorNode = cursorNode || textNode;

                        editable.replaceChild(textNode, node);
                    }
                } else {
                    nodeType !== 3 && editable.removeChild(node);
                }
            }

            // 清除多余标签后还原光标位置
            if(cursorNode){
                var selection = this.constructor.getSelection();

                // ff, chrome 要先扩展选区，然后把选区开头合并到结尾
                if(selection.extend){
                    selection.extend(cursorNode, cursorNode.length);
                    selection.collapseToEnd();
                }
            }

            return this;
        },

        /**
         * Filter a node and tell clearNodes whether to clear node tag or not
         * @param {HTMLElement} node
         * @return {Boolean} return false if the node needs no clearing
         * @protected
         */
        filter: function(node){
            var filters = this.get('filters');
            for(var i= 0, len=filters.length; i<len; i++){
                if(filters[i](node) === false){
                    return false;
                }
            }

            return true;
        },

        /**
         * Add a filter for clearNodes
         * @param {Function} filter Filter function, return false if the node needs no clearing
         * @chainable
         */
        addFilter: function(filter){
            this.get('filters').push(filter);
            return this;
        },

        /**
         * Remove a filter for clearNodes
         * @param {Function} filter Filter function
         * @chainable
         */
        removeFilter: function(filter){
            var filters = this.get('filters');

            for(var i= 0, len=filters.length; i< len; i++){
                if(filters[i] === filter){
                    filters.splice(i, 1);
                    break;
                }
            }

            return this;
        },

        /**
         * Get range of current input area, if exists
         * @returns {Range|Null}
         */
        getRange: function(){
            return this.constructor.getRange(this.$input.get(0));
        },

        /**
         * 保存当前光标位置
         * 如果调用时确认当前光标是在输入框中, 不执行检测会节约些许性能
         * @param {Boolean} checkRange 指示是否检查range是否在文本框中
         *
         */
        saveRange: function (checkRange) {
            var lastRange = checkRange ? this.getRange() : this.constructor.getRange();

            lastRange && (this.set('lastRange', lastRange));
            //        if(lastRange.getBookmark){// for ie
            //            this._lastBookmark = lastRange.getBookmark();
            //        }

            return this;
        },

        /**
         * 还原保存的光标位置
         * NOTE: 调用时需确保光标是在输入框中
         */
        restoreRange: function () {
            var lastRange = this.get('lastRange');

            if(!lastRange){
                return this;
            }

            var selection = this.constructor.getSelection();

            if (selection.addRange) {
                /*
                 * 对于高级浏览器, 直接把原来的range添加到selection就可以还原选区了
                 */
                selection.removeAllRanges();
                selection.addRange(lastRange);
            } else {//ie
                //NOTE: ie还可以使用其专有的bookmark来还原,
                //但是如果在输入框以外的地方选中了文字, 偶尔会出现还原失败的情况
                /*if(this._lastBookmark){ //ie
                 /*
                 * 这里的原理是:
                 * 1. 先把保存lastRange的bookmark
                 * 2. 把新的range的选中位置移动到上次保存的bookmark
                 * 3. 选中该range就能把上次保存的选区还原了
                 *
                 var range = BaseEditor.getRange();
                 if(range){
                 range.moveToBookmark(this._lastBookmark);
                 range.select();
                 }
                 }*/
                /*
                 * 这里的原理是:
                 * 1. 先把保存lastRange, 如"ABCDEFG"中的"CDE"
                 * 2. 把新的range的结尾移动到lastRange的开头(即"C"的左边),
                 * 3. 然后调用 collapse(false)把光标的插入点移动到range的结尾
                 * 也就是把range的开头和结尾合并在一起, 因为新的range的开头都是在内容的起点
                 * 不这样处理的话, 调用select之后会选中"AB"(即选中"C"之前的所有内容)
                 * 4. 把range的结尾移动到lastRange的结尾(即"E"的右边)
                 * 5. 选中该range就能把上次保存的选区还原了(即选中"CDE")
                 */
                var range = this.constructor.getRange();
                if (range) {
                    //TODO 如果选中的内容是图片, 这里就会出错了
                    range.setEndPoint('EndToStart', lastRange);
                    range.collapse(false);
                    range.setEndPoint('EndToEnd', lastRange);
                    range.select();
                    //                    range.setEndPoint('EndToEnd', this._lastRange);
                    //                    range.setEndPoint('StartToStart', this._lastRange);
                    //                    range.select();
                }
                //                这个方法说不定可以
                //                this._lastRange.select();
            }

            return this;
        },

        /**
         * Focus on input area
         * @chainable
         */
        focus: function(){
            if(!this.get('readOnly')){
                this.$input.focus();

                if(this.get('keepCursor')){
                    this.restoreRange();
                }
            }

            return this;
        },

        _delayClearNodes: function(){
            var node = this,
                timer = this.get('_delayClearNodes');

            if(timer){
                clearTimeout(timer);
                this.set('_delayClearNodes', null);
            }

            setTimeout(function(){
                node.clearNodes();
            }, 16);
        },

        _setPlaceholder: function(text){
            if(this.$placeholder){
                this.$placeholder.text(text);
                return this;
            }

            var node = this,
                placeholderHTML = this.template(this.get('placeholderTemplate'))({
                    placeholder: text
                }),
                $placeholder = this.jQuery(placeholderHTML);

            $placeholder.click(function(){
                node.focus();
            });

            node.on('input', function(){
                node.isEmpty() ? $placeholder.show() : $placeholder.hide();
            });

            this.$input.before($placeholder);

            return this;
        },

        _onInput: function(event){
            this.get('clearNodes') && this._delayClearNodes();
        },

        _onBlur: function(event){
            //本来想在blur的时候保存range, 但是执行这个事件的时候,
            //光标已经不在输入框了, 也许ie可以用onfocusout事件来做
//            this.get('keepCursor') && this.restoreRange(true);

            this._clearTimeoutSaveRange();
        },

        _onBeforeBlur: function(event){
            event.preventDefault();
            event.stopImmediatePropagation();
        },

        _onMouseDown: function(event){
            if(this.get('keepCursor')){
                var editor = this;

                this.jQuery('body').one('mouseup', function(){
                    editor.saveRange(true);
                });
            }
        },

        _onKeyUp: function(event){
            var keyCode = event.which;

            //排除掉单纯的shift,ctrl,alt键
            if(keyCode >= 16 && keyCode <=18){
                return;
            }

            //延时进行保存, 避免连续输入文字的时候做了太多次操作
            this.get('keepCursor') && this._startTimeoutSaveRange(100);
        },

        _startTimeoutSaveRange: function(timeout){
            this._clearTimeoutSaveRange();

            var editor = this;
            this.set('keyUpTimer', window.setTimeout(function(){
                editor.saveRange(true);
            }, timeout || 0));
        },

        _clearTimeoutSaveRange: function(){
            var timer = this.get('keyUpTimer');
            if(timer){
                clearTimeout(timer);
                this.set('keyUpTimer', 0);
            }
        }
    });

    RichEditor.include({
        settings: {
            wrapTemplate: [
                '<div class="LBF-RichEditor">',
                    '<div class="LBF-RichEditor-inputWrap">',
                        '<div class="LBF-RichEditor-input"></div>',
                    '</div>',
                    '<div class="LBF-RichEditor-attach"></div>',
                '</div>'
            ].join(''),

            placeholderTemplate: '<label class="LBF-RichEditor-placeholder"><%== placeholder %></label>',

            clearNodes: true,

            keepCursor: true,

            filters: []
        },

        /**
         * 获取选中区, 如果传入了container, 则返回container的range
         * @method getRange
         * @static
         * @param {HTMLElement} container  目标range的容器, 可选
         * @return {Range|Null}
         */
        getRange: function(container){
            var selection = this.getSelection();
            if (!selection) {
                return null;
            }
            var range = selection.getRangeAt ? (selection.rangeCount ? selection
                .getRangeAt(0) : null) : selection.createRange();
            if (!range) {
                return null;
            }
            if (container) {
                if (this.containsRange(container, range)) {
                    return range;
                } else {
                    return null;
                }
            } else {
                return range;
            }
        },

        /**
         * 获取当前页面的selection对象
         * @method getSelection
         * @static
         * @return {Selection}
         */
        getSelection: function(){
            // 先判断ie专有的, 因为ie9对range的支持不完全啊>_<
            return (document.selection) ? document.selection : window.getSelection();
        },

        /**
         * 判断一个range是否被包含在container中
         * @method containsRange
         * @static
         * @param {HTMLElement} container
         * @param {Range} range
         * @return {Boolean}
         */
        containsRange: function(container, range){
            var rangeParent = range.commonAncestorContainer || (range.parentElement && range.parentElement()) || null;

            if(rangeParent){
                return this.contains(container, rangeParent, true);
            }

            return false;
        },

        /**
         * 判断一个节点是否是某个父节点的子节点,
         * 默认不包含parent === child的情况
         * @method contains
         * @static
         * @param {HTMLElement} parent
         * @param {HTMLElement} child
         * @param {Boolean} containSelf 指示是否可包含parent等于child的情况
         * @return {Boolean} 包含则返回true
         */
        contains: function(parent, child, containSelf){
            if(!containSelf && parent === child){
                return false;
            }

            if(parent.compareDocumentPosition) { // w3c
                var res = parent.compareDocumentPosition(child);
                if(res === 20 || res === 0){
                    return true;
                }
            } else {
                if(parent.contains(child)){ // ie
                    return true;
                }
            }

            return false;
        }
    });

    return RichEditor;
});