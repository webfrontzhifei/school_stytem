/**
 * Created by dericktang on 2016/4/18.
 */
/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.ComboBox.ComboBox', function(require, exports, module){
    var $ = require('lib.jQuery'),
        ComboBoxOld = require('ui.widget.ComboBox.ComboBox'),
        Tip = require('ui.Nodes.Tip'),
        extend = require('lang.extend');
    require('{theme}/comp/ComboBox/ComboBox.css');

    exports = module.exports = ComboBoxOld.inherit({
//        initialize: function(opts){
//            console.log("===>>>"+opts.model)
//            this.render();
//        },
        render: function(){
            var _this = this,
                _trigger = $(_this.get('selector')),
                _divctx = $(_this.get('divctx'));

            ComboBoxOld.prototype.render.apply(this, arguments);
            this.optionPanel.addClass("qidian-combobox-panel");
            if(_divctx.selector!=""){
                //需要
                $(this.optionPanel.$el).find(".lbf-combobox-options").empty();
                this.divContainer = "<div class='divContainer'></div>";
                $(this.optionPanel.$el).find(".lbf-combobox-options").append(this.divContainer);

            }

            var index = this.get('selectedIndex') || 0;
            var options = this.get('options');
            if(options){
                this.set('value', options[index].value);
            }


        },

        getDivContainer:function(){
            return $(this.optionPanel.$el).find(".lbf-combobox-options .divContainer");
        },

        /**
         * Invoke When an item is selected
         * @method selectItem
         * @protected
         * @param {Event} event
         * @chainable
         */
        selectedItem: function(data){
                var selectedName = data.text,
                selectedValue = data.id;

            this.selectDiv(selectedName,selectedValue);

            return false;
        },


        selectDiv: function(selectedName,selectedValue){


            var newValue = selectedValue,
                text = selectedName,
                oldValue = this.get('value');

            /**
             * Fire when an item selected, no matter it changes or not
             * @event select
             * @param {Event} event JQuery event
             * @param newValue New value
             * @param oldValue Old value
             */
            this.trigger('select', [newValue, oldValue]);

            // when value changed
            if(newValue !== oldValue){
                //更新combobox的value和text
                this.set('value', newValue);
                this.$caption.text(text);

                //给原生表单赋值
                this.$oldEl && this.$oldEl.val(newValue);

                this.set('selectedIndex', newValue);

                // todo
                // by amoschen
                // change event here is occupied

                /**
                 * Fire when value changed
                 * @event change
                 * @param {Event} event JQuery event
                 * @param newValue New value
                 * @param oldValue Old value
                 */
                this.trigger('change', [newValue, oldValue]);
            }

            this.$label.focus();
            this.hideOptions();

            return this;
        },

        getVal : function(){
            return this.get('value');
        },

        setVal:function(val){
            this.set('value', val);
        }




    });

    exports.include(extend(true, {}, ComboBoxOld, {
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            selectTemplate: [
                '<div class="lbf-combobox qidian-combobox">',
                '<a href="javascript:;" class="lbf-button lbf-combobox-label" data-value="<%== options[defaultIndex].value %>" hidefocus="true">',
                '<span class="lbf-combobox-caption"><%= options[defaultIndex].text %></span>',
                '<span class="lbf-combobox-icon">&nbsp;</span>',
                '</a>',
                '</div>'
            ].join(''),

            optionPanelTemplate: [
                '<ul class="lbf-combobox-options">',
                '<% for(var i=0,len=options.length; i<len; i++){ %>',
                '<li class="lbf-combobox-option <%if(options[i].disabled){%>disabled<%}%>"><a class="lbf-combobox-item" href="javascript:;" onclick="return false;" data-value="<%== options[i].value %>"><%= options[i].text %>',
                '<span class="lbf-combobox-tag"><%= options[i].text1 %></span></a></li>',
                '<% }%>',
                '</ul>'
            ].join(''),

            selectOptionTemplate: [
                '<% for(var i=0,len=options.length; i<len; i++){ %>',
                '<option value="<%== options[i].value %>"><%== options[i].text %></option>',
                '<% }%>'
            ].join(''),
            maxlength: 0,
            immediate: false,
            mode:"",
            byte:false,//为true的话 英文算半个汉字(两个英文算一个汉字)，中文一个汉字
            events: {
                error: function(){
                    this.showTip();
                },
                success: function(){
                    //this.hideTip();
                }
            }
        }
    }));
});
