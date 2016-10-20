/**
 * User: sqchen
 * Date: 15-12-01
 * Time: 下午16:10
 * Autocomplete
 */
LBF.define('qidian.comp.Autocomplete', function(require, exports, module){
    var extend = require('lang.extend'),
        TextInput = require('ui.Nodes.TextInput'),
        Dropdown = require('ui.widget.Dropdown.Dropdown'),
        trim = require('lang.trim'),
        jQuery = require('lib.jQuery'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks');

    require('{theme}/lbfUI/css/Autocomplete.css');

    var KEY_CODE_ENTER = 13,
        KEY_CODE_UP = 38,
        KEY_CODE_DOWN = 40;

    /**
     * 自动完成类
     * @class AutoComplete
     * @example
     *
     * TODO
     *
     */
    module.exports = exports = TextInput.inherit({
        events: extend({}, TextInput.prototype.events, {
            'input input': 'onInput',
            'propertychange input': 'onInput',
            'focus input': 'onFocusInput',
            'blur input': 'onBlurInput',
            'keydown input': 'onKeydown',
            'change:options': 'onChangeOptions',
            'clickOption': 'onClickOption',
            'mouseenterOption': 'onMouseenterOption'
        }),

        /**
         * Render autocomplete
         * @method render
         * @chainable
         * @protected
         */
        render: function() {
            var autoComplete = this;

            TextInput.prototype.render.apply(autoComplete, arguments);

            autoComplete.addClass('lbf-autocomplete-input');

            //缓存
            autoComplete.optionTmpl = autoComplete.template(autoComplete.get('optionTmpl'));
            autoComplete.retPanelTmpl = autoComplete.template(autoComplete.get('retPanelTmpl'));

            // prepare ret panel
            autoComplete.renderRet([]);
            // hide panel at first
            autoComplete.hidePanel();

            autoComplete.resize();

            return this;
        },

        renderRet: function(options){
            var autoComplete = this,
                retPanel = autoComplete.retPanel;

            var $el = autoComplete.$el,
                optionHTML = autoComplete.optionTmpl({
                    options: options,
                    emptyOptionPlaceholder: this.get('emptyOptionPlaceholder')
                }),
                panelHTML = autoComplete.retPanelTmpl({
                    optionHTML: optionHTML
                });

            if(!retPanel){
                retPanel = autoComplete.retPanel =
                    new Dropdown({
                        container: autoComplete.get('resultContainer'),
                        trigger: $el,
                        content: panelHTML,
                        direction: autoComplete.get('direction'),
                        show: autoComplete.get('show'),
                        hide: autoComplete.get('hide'),
                        show: {
                            mode: 'manual'
                        },
                        className: 'lbf-autocomplete-panel'
                    })
                        .delegate('.lbf-autocomplete-option', 'click', function(event){
                            var idx = getIdxFromEvent(event);

                            // in case empty option or error occassion
                            if( idx === NaN ){
                                return;
                            }

                            autoComplete.trigger('clickOption', idx, autoComplete.get('options')[idx]);
                        })
                        .delegate('.lbf-autocomplete-option', 'mouseenter', function(event){
                            var idx = getIdxFromEvent(event);

                            // in case empty option or error occassion
                            if( idx === NaN ){
                                return;
                            }

                            autoComplete.trigger('mouseenterOption', idx, autoComplete.get('options')[idx]);
                        })
                        .delegate('.lbf-autocomplete-option', 'mouseleave', function(event){
                            var idx = getIdxFromEvent(event);

                            // in case empty option or error occassion
                            if( idx === NaN ){
                                return;
                            }

                            autoComplete.trigger('mouseleaveOption', idx, autoComplete.get('options')[idx]);
                        });
            } else {
                // TODO
                // call dropdown adjust method ?
                retPanel.find('.lbf-autocomplete-options').replaceWith(panelHTML);

                if( options.length > 0 ){
                    // default focus on first option
                    autoComplete.focus(0);
                }
            }

            autoComplete.resize();

            return this;
        },

        resize: function(){
            //this.retPanel.outerWidth(this.outerWidth());
            return this;
        },

        /**
         * Query with string
         * @method query
         * @chainable
         */
        query: function(querystring){
            var autoComplete = this;

            /**
             * Fired when query
             * @event query
             * @param {String} querystring
             */
            autoComplete.trigger('query', querystring);

            querystring = querystring.toLowerCase();

            // delay query to improve performance
            // cancel last query
            autoComplete.timer && clearTimeout(autoComplete.timer) && (autoComplete.timer = null);

            autoComplete.timer = setTimeout(function(){
                // do query
                var queryEngine = autoComplete.get('query'),
                    max = autoComplete.get('maxDisplay'),
                    queryOptions = {
                        query: querystring,
                        max: max,
                        source: autoComplete.get('querySource')
                    };

                /**
                 * queryOptions = {
                     *      string: 'query string',
                     *      max: 10, // max accepted length
                     *      source: querySource
                     * }
                 *
                 * =>
                 *
                 * [
                 *  {
                     *      name: 'retName for display',
                     *      title: 'title for hover, take name as default',
                     *      value: 'option value'
                     *  }
                 * ]
                 */
                queryEngine.apply(autoComplete, [queryOptions])
                    .done(function(options){
                        // slice & copy options array
                        options = options.slice(0, Math.min(options.length, max));
                        // record options
                        autoComplete.set('options', options || []);
                    });
            }, 10);

            return this;
        },

        select: function(idx){
            var option = this.get('options')[idx];

            if( !option ){
                return this;
            }

            this.val(option.name || option.value);

            this.trigger('selectOption', [option.value, option]);

            return this;
        },

        focus: function(idx){
            this.retPanel
                .find('.lbf-autocomplete-option a')
                .removeClass('focus')
                .eq(idx)
                .addClass('focus');

            this.set('focusIdx', idx);
        },

        showPanel: function(){
            var _retPanel = this.retPanel,
                documentScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft,
                documentClientWidth = document.documentElement.clientWidth || document.body.clientWidth,
                _left,
                _width;

            _retPanel.open();

            _left = _retPanel.offset().left;
            _width = _retPanel.width();

            if(_left + _width > documentClientWidth) {
                _retPanel.css('left', -(_left + _width - documentScrollLeft - documentClientWidth) + 'px');
            }

            /**
             * Fired when result panel shown
             * @event showPanel
             */
            this.trigger('showPanel');

            return this;
        },

        hidePanel: function(){
            this.retPanel.close();

            /**
             * Fired when result panel hidden
             * @event hidePanel
             */
            this.trigger('hidePanel');

            return this;
        },

        onInput: function(){
            this.query(this.val());
        },

        onFocusInput: function(){
            var ac = this;

            // restore query result of the existing text
            ac.query(this.val());

            // show panel when focus on input
            setTimeout(function(){
                ac.showPanel();
            }, 0);
        },

        onBlurInput: function(){
            var ac = this;

            // close ret panel when blured
            // delay hide in case of interrupting click event inside panel
            setTimeout(function(){
                ac.hidePanel();
            }, 150);
        },

        onChangeOptions: function(event, options){
            // re-render ret panel
            this.renderRet(options);
        },

        onKeydown: function(event){
            var focusIdx = this.get('focusIdx'),
                options = this.get('options') || [],
                len = options.length,
                keyCode = event.keyCode;

            // press enter to select
            if( keyCode === KEY_CODE_ENTER ){
                this.select(focusIdx);
                // bug fix: hide dropdown
                this.hidePanel();

                return;
            }

            if( keyCode === KEY_CODE_UP ){
                event.preventDefault();
                focusIdx = ( focusIdx - 1 + len ) % len;
                this.focus(focusIdx);
                return;
            }

            if( keyCode === KEY_CODE_DOWN ){
                event.preventDefault();
                focusIdx = ( focusIdx + 1 ) % len;
                this.focus(focusIdx);
                return;
            }
        },

        onClickOption: function(event, idx, option){
            this.select(idx)
        },

        onMouseenterOption: function(event, idx, option){
            this.focus(idx);
        }
    });

    exports.tag = 'AutoComplete';

    exports.include({
        name: 'AutoComplete',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend({}, TextInput.settings, Dropdown.settings, {

            //是否指定静态结构
            selector: null,

            // result container
            resultContainer: 'body',

            //placeholder
            placeholder: '请输入要查询的关键字',

            emptyOptionPlaceholder: '暂无查询结果',

            optionTmpl: [
                '<ul class="lbf-autocomplete-options">',
                '<% if( options.length === 0 ) { %>',
                '<li class="lbf-autocomplete-option empty"><%= emptyOptionPlaceholder %></li>',
                '<% } %>',
                '<% for(var i=0, len=options.length, op; i<len; i++){ %>',
                '<% op = options[i] %>',
                '<li class="lbf-autocomplete-option" data-index="<%== i %>"><a title="<%= op.title || op.name || op.value %>" href="javascript:;"><%= options[i].name || op.value %></a></li>',
                '<% } %>',
                '</ul>'
            ].join(''),

            retPanelTmpl: '<%== optionHTML %>',

            //最大显示结果数
            maxDisplay: 10,

            /**
             * 可以用来存储搜索数据源
             * 数据格式随query方法各异，也可不设置
             *
             * 默认query所需的数据格式:
             * {
             *  match: [
             *      [regexp|string|function, value],
             *      [regexp|string|function, value],
             *      ...
             *  ],
             *  ret: {
             *      value: {
             *          name: 'name, default to name',
             *          value: 'value',
             *          title: 'title, default to name'
             *      }
             *  }
             */
            querySource: null,

            /**
             * 指定查询函数，默认查询函数直接使用data字段数据
             * query(queryOptions).done(function(retArr) {});
             *
             * query方法获得的请求参数：
             * queryOptions = {
             *      string: 'query string',
             *      max: 10, // 最大结果数
             *      data: data // 预设在AutoComplete内的数据源，对采用非默认query方法的场景，可不用考虑
             * }
             *
             * query完成后返回结果集的示例：
             * [
             *  {
             *      name: 'retName for display',
             *      title: 'title for hover, take name as default',
             *      value: 'option value'
             *  }
             * ]
             */
            query: defaultQuery,

            //样式定制接口
            className: ''
        })
    });

    function defaultQuery(options){
        var promise = new Promise,
            src = options.source,
            srcMatch = src.match,
            srcRet = src.ret,
            max = options.max,
            qs = options.query,
            retArr = [];

        // no query
        if( !qs || qs.length === 0 ){
            Tasks.once(function() {
                promise.resolve(retArr);
            }).run();
            return promise.promise();
        }

        for(var i= 0, len= srcMatch.length, count= 0, rule, value, ret; i<len; i++){
            match = srcMatch[i];
            rule = match[0];
            value = match[1];

            if(
                // reg
            ( rule.test && rule.test(qs) ) ||
                // fn
            ( typeof rule === 'function' && rule(qs) ) ||
                // str
            ( typeof rule === 'string' && rule.indexOf(qs) > -1 ) ){

                // matched
                // add ret to retArr
                retArr.push(ret = srcRet[value] || {});
                // make sure ret has value
                typeof ret.value === 'undefined' && ( ret.value = value );

                // stop when rets are enough
                if( ++ count > max ){
                    break;
                }
            }
        }

        Tasks.once(function() {
            promise.resolve(retArr);
        }).run();

        return promise.promise();
    }

    function getIdxFromEvent(event){
        return Number(jQuery(event.currentTarget).data('index'));
    }
});

