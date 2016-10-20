/**
 * User: sqchen
 * Date: 15-12-01
 * Time: 下午16:10
 * RecentTips
 */
LBF.define('qidian.comp.RecentTips', function(require, exports, module) {
    var extend = require('lang.extend'),
        each = require('lang.each'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks'),
        REST = require('qidian.comp.REST'),
        Autocomplete = require('qidian.comp.Autocomplete');

    var RecentTips = exports = module.exports = Autocomplete.inherit({
        // @override onInput
        // as we have to filter empty string
        onInput: function() {
        },

        // @override onFocusInput
        onFocusInput: function(){
            var ac = this;
            
            this.addClass('lbf-text-input-focus');

            ac.set('options', ac.get('uins'));

            ac.showPanel();
        },

        onBlurInput: function(){
            var ac = this;

            this.removeClass('lbf-text-input-focus');

            // close ret panel when blured
            // delay hide in case of interrupting click event inside panel
            setTimeout(function(){
                ac.hidePanel();
            }, 150);
        },

        // @override select
        // Autocomplete
        select: function(idx){
            var option;

            option = this.get('options')[idx];
            if(!option) {
                return this;
            }

            this.val(option.uin);
            // bug fix
            this.find('.lbf-text-input-placeholder').css('display', 'none');

            this.trigger('selectOption', [option]);

            return this;
        },

        setUins: function(uins) {
            this.set('uins', uins);
        }
    });

    RecentTips.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend({}, Autocomplete.settings, {
            optionTmpl: [
                '<ul class="lbf-autocomplete-options lbf-autocomplete-items">',
                '<% for(var i=0, len=options.length, op; i<len; i++){ %>',
                '<% op = options[i] %>',
                '<li class="lbf-autocomplete-option" data-index="<%== i %>"><a title="<%= op.uin %>" href="javascript:"><%= op.uin %></a></li>',
                '<% } %>',
                '</ul>'
            ].join(''),

            placeholder: '',

            //样式定制接口
            className: ''
        })
    });
});
