/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.Textarea', function(require, exports, module){
    var $ = require('lib.jQuery'),
        Textarea = require('ui.Nodes.Textarea'),
        Tip = require('ui.Nodes.Tip'),
        extend = require('lang.extend');

    require('qidian.comp.Autosize')

    var classRoot = 'lbf-textarea-';


    exports = module.exports = Textarea.inherit({
        render: function(){
            var _this = this,
                _trigger = $(_this.get('selector'));

           /* _this.tip = new Tip(extend(true, {}, _this.get('tip'), {
                className: 'lbf-tip-error',
                trigger: _trigger.parent(),
                container: _trigger.parent().parent(),
                direction: 'top',
                show: {
                    mode: 'none'
                }
            }));*/

            Textarea.prototype.render.apply(this, arguments);

            if (_trigger.hasClass(classRoot.slice(0, classRoot.length-1))) {
                // 正常的输入框
                _trigger.parent().addClass(classRoot + 'normal');
                // 
                _trigger.bind('input propertychange change focus', function() {
                    if (this.value) {
                        _this.$placeholder.hide();
                    } else {
                        _this.$placeholder.show();
                    }
                }).trigger('input');
            } else {
                // 文本域高度自适应
                _trigger.autosize();
            }


            this.validate = this.get('validate');
            this.immediate = this.get('immediate');
            this.byte = this.get('byte');
            
            // 初始化完成标志量
            _trigger.parent().addClass(classRoot + 'init');
            // 占位符效果
            var placeholder = _trigger.attr('placeholder') || _this.get('placeholder');
            
            if (placeholder) {
                // 不是搜索框
                if (_trigger.prop('required') || _this.get('required')) {
                    // required必选星号
                    placeholder = '<span class="required">*</span>' + placeholder;
                }

                this.placeholder(placeholder);
                _trigger.removeAttr('placeholder');
            }

            
            // 创建出错提示
            this.$error = $('<span class="error"></span>').insertAfter(_trigger);

            // 创建计数
            var maxlength = _trigger.attr('maxlength') || _this.get('maxlength') || 0;
            if (maxlength > 0) {
                this.$count = $('<span class="'+ classRoot +'number"><span>0</span>/'+ maxlength +'</span>').insertAfter(_trigger);
                this.$number = this.$count.find('span').eq(0);
                this.maxlength = maxlength;
                this._isOverflow();

                _trigger.removeAttr('maxlength');

                _trigger.parent().addClass(''+ classRoot +'count');

            }

            // 输入框
            this.$textarea = _trigger;

            // 即时验证开启
            if ('oninput' in document.createElement('div')) {
                _trigger.bind('input', function(e) {
                   _this._isError(e);
                });

                // 兼容模式下的IE9
                if ($('<input type=email>').attr('type') == 'text') {
                    _trigger.bind('keyup', function(e) {
                       _this._isError(e);
                    });
                }
            } else {
                _trigger[0].attachEvent('onpropertychange', function(event) {
                    if (event && event.propertyName == "value") {
                        _this._isError(event);
                    }
                });
            }

            // 占位符位置确认
            _this._textareaActive();
        },

        
        //remove: function() {},

        setTipContent: function(html){
            /*if(typeof html !== 'undefind'){
                this.tip.setContent(html);
                this.error();
                return html;
            }*/
            if(typeof html !== 'undefind'){
                this.$error.html(html);
                html && this.error();
            }
        },

        showTip: function(){
            /*this.tip.set('adjust', {
                x: -parseInt(this.width(), 10)/2 + parseInt(this.tip.width(), 10)/2 - 9,
                y: 0
            });

            this.tip.close().open();*/
            this.$error.show();
        },

        hideTip: function(){
            //this.tip.close();
            this.$error.hide();
        },

        /*validate: function(e, value) {
            return this.get('validate').apply(this, [e, this.val()])
        },*/

        /**
         * Focus the input
         * @method _textareaFocus
         * @protected
         * @chainable
         */
        _textareaFocus: function() {
            if (!this.get('disabled')) {
                this.addClass(classRoot +'focus ' + classRoot +'active');
            } 
        },

        /**
         * position of the placeholder
         * @method _textareaActive
         * @protected
         * @chainable
         */
        _textareaActive: function() {
            // 定位占位符和标题位置
            if ($.trim(this.val()) == '') {
                this.removeClass(classRoot +'active');
            } else {
                this.addClass(classRoot +'active');
            }
        },

        /**
         * Blur the input
         * @method _textareaBlur
         * @protected
         * @chainable
         */
        _textareaBlur: function(e){
            this._textareaActive();            

            //if (this.immediate) {
            //    this._isError(e);
            //}
           
            this.removeClass(classRoot +'focus');
        },

        /**
         * modify placeholder
         * @method placeholder
         */
        placeholder: function(placeholder){
            this.$placeholder.insertAfter(this.$textarea).html(placeholder);
        },

        /* replace origin method */
        _setPlaceholder: function() {
            var id = this.$textarea.attr('id'),
                self = this;
            if (id) {
                this.$placeholder.attr('for', id);
            } else {
                this.$placeholder.click(function(){
                    self.$textarea.focus();
                });
            }
        },

        _update: function() {},

        /**
         * count the length of input's value
         * @method count
         * @chainable
         */
        _isOverflow: function() {
            var length;
            if (this.maxlength > 0) {
                if(this.byte){
                    length = Math.floor(this._getBlength($.trim(this.$textarea.val()))/2);
                }else{
                    length = $.trim(this.$textarea.val()).length;
                }

                this.$number.html(length);

                var action = length > this.maxlength? 'addClass': 'removeClass';

                this.$number[action]('red');
                this.$textarea.parent()[action](classRoot +'error');
                this.setTipContent('');
                return length > this.maxlength;
            }
        },
        /**
         * 获取字符长度，中文算两个字符
         * @param str
         * @returns {*}
         * @private
         */
        _getBlength:  function(str) {
            if (str == null) return 0;
            if (typeof str != "string"){
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g,"01").length;
        } ,

        _isError: function(e) {
            var isOverflow = this._isOverflow();

            var ret = this.immediate? this.get('validate').apply(this, [e, this.val()]): '';

            if(isOverflow == true || typeof ret == 'undefined') {
                this.error();
                /**
                 * Fire when check state changed and failed validation
                 * @event error
                 * @param {Event} JQuery event
                 * @param {Error} Validation result
                 */
                this.trigger('error', [ret]);
            } else {
                this.clearError();
                this.trigger('success', [ret]);
            }
        },

        reset: function(){
            this.removeClass('lbf-textarea-error');
            this.removeClass('lbf-textarea-success');
            this.hideTip();
        }
    });

    exports.include(extend(true, {}, Textarea, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            maxlength: 0,
            immediate: false,
            byte:false,//为true的话 英文算半个汉字(两个英文算一个汉字)，中文一个汉字
            events: {
                error: function(){
                    this.showTip();
                },
                success: function(){
                    this.hideTip();
                }
            }
        }
    }));
});
