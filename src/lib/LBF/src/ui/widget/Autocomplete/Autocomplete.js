/**
 * @fileOverview
 * @author amoschen
 * @version 0.1.0
 * Created: 14-9-17 15:30
 */
LBF.define('ui.widget.Autocomplete.Autocomplete', function(require, exports, module){
    var extend = require('lang.extend'),
        TextInput = require('ui.Nodes.TextInput'),
        Dropdown = require('ui.widget.Dropdown.Dropdown');

    require('{theme}/lbfUI/css/Autocomplete.css');

    /**
     * 自动完成类
     * @class AutoComplete
     * @example
     *
     * TODO
     *
     */
    module.exports = exports = TextInput.inherit({
        events: {
            'input input': 'onInput',
            'propertychange input': 'onInput',
            'change:options': 'renderRet'
        },

        /**
         * Render autocomplete
         * @method render
         * @chainable
         * @protected
         */
        render: function() {
            var autoComplete = this;

            autoComplete.superclass.prototype.render.apply(autoComplete, arguments);

            autoComplete.addClass('lbf-autocomplete-input');

            //缓存
            autoComplete.optionTmpl = autoComplete.template(autoComplete.get('optionTmpl'));
            autoComplete.retPanelTmpl = autoComplete.template(autoComplete.get('retPanelTemplate'));

            return this;
        },

        renderRet: function(options){
            // TODO
            // default empty array ok?
            options = options || [];

            var autoComplete = this,
                $el = autoComplete.$el,
                retPanel = autoComplete.retPanel,
                optionHTML = autoComplete.optionTmpl
                panelHTML = autoComplete.retPanelTmpl({
                    optionHTML: optionHTML
                }),
                jQuery = autoComplete.jQuery;

            console.log('renderRet')
            if(!retPanel){
                console.log('first paint dropdown')
                retPanel = this.retPanel =
                    new Dropdown({
                        trigger: $el,
                        content: panelHTML,
                        direction: autoComplete.get('direction'),
                        show: autoComplete.get('show'),
                        hide: autoComplete.get('hide'),
                        events: autoComplete.get('events')
                    })
                    .addClass('lbf-autocomplete-panel')
                    .delegate('.lbf-autocomplete-option', 'click', function(event){

                    var idx = jQuery(event.currentTarget).data('index');

                    autoComplete.select(idx);
                });
            } else {
                // TODO
                // call dropdown adjust method ?
                retPanel.find('.lbf-autocomplete-options').replaceWith(panelHTML);
            }

            // ajust panel width
            retPanel.css('maxWidth', Math.max(retPanel.width(), $el.outerWidth()));

            return this;
        },

        query: function(querystring){
            var autoComplete = this;

            /**
             * Fired when query
             * @event query
             * @param {String} querystring
             */
            autoComplete.trigger('query', querystring);

            var queryEngine = autoComplete.get('query'),
                max = this.get('maxDisplay'),
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
            queryEngine(queryOptions, function(options){
                if( options && options.length ){
                    // slice & copy options array
                    options = options.slice(0, Math.min(options.length, max));

                    // record options
                    autoComplete.set('options', options)
                }
                
            });
        },

        onInput: function(){
            this.query(this.val());
        }
    });

    
    exports.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

            //是否指定静态结构
            selector: null,

            //placeholder
            placeholder: '请输入要查询的关键字',
            
            optionTmpl: [
                '<ul>',
                    '<% for(var i=0, len=options.length; i<len; i++){ %>',
                        '<li data-index="<%== i %>"><a title="<%= options[i].title %>" href="javascript:;"><%= options[i].name %></a></li>',
                    '<% } %>',
                '<ul>'
            ].join(),

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
             * query(queryOptions, cb);
             * 
             * query方法获得的请求参数：
             * queryOptions = {
             *      string: 'query string',
             *      max: 10, // 最大结果数
             *      data: data // 预设在AutoComplete内的数据源，对采用非默认query方法的场景，可不用考虑             
             * }
             *
             * query完成后返回结果集的示例：
             * cb([
             *  {
             *      name: 'retName for display',
             *      title: 'title for hover, take name as default',
             *      value: 'option value'
             *  }
             * ])
             */
            query: defaultQuery,

            //样式定制接口
            className: ''
        }
    });

    function defaultQuery(options, cb){
        var src = options.source,
            srcMatch = src.match,
            srcRet = src.ret,
            max = options.max,
            qs = options.query,
            retArr = [];

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

        cb(retArr);
    }
});