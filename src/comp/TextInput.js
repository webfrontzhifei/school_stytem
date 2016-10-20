/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.TextInput', function(require, exports, module){
    var $ = require('lib.jQuery'),
        forEach = require('lang.forEach'),
        TextInput = require('ui.Nodes.TextInput'),
        Tip = require('ui.Nodes.Tip'),
        isArray = require('lang.isArray'),
        extend = require('lang.extend');

    var classRoot = 'lbf-text-input-';

    exports = module.exports = TextInput.inherit({
        render: function(){
            var _this = this,
                _trigger = $(_this.get('selector'));


            /*_this.tip = new Tip(extend(true, {}, _this.get('tip'), {
                className: 'lbf-tip-error',
                trigger: _trigger.parent(),
                container: _trigger.parent().parent(),
                direction: 'top',
                show: {
                    mode: 'none'
                }
            }));*/

            TextInput.prototype.render.apply(this, arguments); 

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
            }



            this.validate = this.get('validate');
            this.immediate = this.get('immediate');
            this.byte = this.get('byte');
            this.byteZh = this.get('byteZh');
            // 是否是搜索框
            this.isSearch = /\-search/.test(_trigger.parent().attr('class'))
            
            // placeholder
            var placeholder = _trigger.attr('placeholder') || _this.get('placeholder');

            if (placeholder && this.isSearch && history.pushState) {
                this.$placeholder.hide();
            } else if (placeholder && this.isSearch == false) {
                // 不是搜索框
                if (_trigger.attr('required') || _this.get('required')) {
                    // required必选星号
                    placeholder = '<span class="required">*</span>' + placeholder;
                }

                this.placeholder(placeholder);
                _trigger.removeAttr('placeholder');
            }
            
            if (this.isSearch == false) {
                // 创建出错提示
                this.$error = $('<span class="error"></span>').insertAfter(_trigger);

                // 创建计数
                var maxlength = _trigger.attr('maxlength') || _this.get('maxlength') || 0;
                if (maxlength > 0) {
                    this.$count = $('<span class="'+ classRoot +'number"><span>0</span>/'+ maxlength +'</span>').insertAfter(_trigger);
                    this.$number = this.$count.find('span').eq(0);
                    this.maxlength = maxlength;
                    this._isOverflow();

                    if (_trigger.attr('type') != 'tel') {
                        _trigger.removeAttr('maxlength');
                    }

                    _trigger.parent().addClass(''+ classRoot +'count');

                }

                // 输入框
                this.$input = _trigger;

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
                } else if (_trigger[0]) {
                    _trigger[0].attachEvent('onpropertychange', function(event) {
                        if (event && event.propertyName == "value") {
                            _this._isError(event); 
                        }
                    });
                }

                // 占位符位置确认
                _this._inputActive();
            }
        },

        setTipContent: function(html){
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

            //如果之前已经有别的输入框出现错误提示，则当前输入框只标红不提示
            if(!$(".lbf-tip-error").filter(":visible").length) {
                this.tip.close().open();
            }*/
            this.$error.show();
        },

        hideTip: function(){
            // this.tip.close();
            this.$error.hide();
        },

        /**
         * Focus the input
         * @method _inputBlur
         * @protected
         * @chainable
         */
        _inputFocus: function() {
            var value = this.val();
            value.length > 0 ? this.val(value) : ''; //增加一个简单的办法让光标停留在文字后面
            if (!this.get('disabled')) {
               this.addClass(classRoot +'focus');
               if (this.isSearch == false) {
                    this.addClass(classRoot +'active');
               }
            } 
        },

        /**
         * position of the placeholder
         * @method _inputActive
         * @protected
         * @chainable
         */
        _inputActive: function() {
            if (this.isSearch) return this;
            // 定位占位符和标题位置
            if ($.trim(this.val()) == '') {
                this.removeClass(classRoot +'active');
            } else {
                this.addClass(classRoot +'active');
            }
        },

        /**
         * Blur the input
         * @method _inputBlur
         * @protected
         * @chainable
         */
        _inputBlur: function(e){
            this._inputActive();            

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
            this.$placeholder.html(placeholder);
        },

        /* replace origin method */
        _setPlaceholder: function() {
            var self = this,
                id = this.$input.attr('id');
            if (id) {
                this.$placeholder.attr('for', id);
            } else {
                this.$placeholder.click(function(){
                    self.$input.focus();
                });
            }
        },

        /**
         * count the length of input's value
         * @method count
         * @chainable
         */
        _isOverflow: function() {
            if (this.isSearch == false && this.maxlength > 0) {
                var length;
                if(this.byte){
                    if(this.byteZh){
                        length =Math.ceil( this._getBlength($.trim(this.$input.val())));
                    }else{
                        length =Math.ceil( this._getBlength($.trim(this.$input.val()))/2);
                    }
                }else{
                    length = $.trim(this.$input.val()).length;
                }
                this.$number.html(length);

                var action = length > this.maxlength ? 'addClass': 'removeClass';

                this.$number[action]('red');
                this.$input.parent()[action](''+ classRoot +'error');
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

            // 其他非计数的验证需要标志量控制
            var ret = this.immediate? this.get('validate').apply(this, [e, this.val()]): '';

            if(isOverflow == true || typeof ret == 'undefined'){
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
            this.removeClass(''+ classRoot +'error');
            this.removeClass(''+ classRoot +'success');
            this.hideTip();
        }
    });

    exports.include(extend(true, {}, TextInput, {
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
            byte: false, //为true的话 英文算半个汉字(两个英文算一个汉字)，中文一个汉字
            byteZh: false,//为true的右下角为字符长度限制75/2-1,
            events: {
                blur: function(){
                },
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
