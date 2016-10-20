/**
 * Created by patrickliu on 12/15/14.
 */

// this is a wrapper for Autocomplete.js for easy implementing orgTreeSearch
LBF.define('qidian.comp.OrgTreeSearch', function(require, exports, module) {
    var extend = require('lang.extend'),
        each = require('lang.each'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks'),
        REST = require('qidian.comp.REST'),
        Autocomplete = require('qidian.comp.Autocomplete');

    require('{theme}/comp/OrgTreeSearch/OrgTreeSearch.css');
    // 和后台约好了，normal, disabled, trash所对应的state值
    var STATE_TO_ID_HASH = {
        normal: [2],
        disabled: [5],
        trash: [1, 7, 8]
    };

    // id和state的对应
    var ID_TO_STATE_HASH = (function() {
        var newObj = {};
        each(STATE_TO_ID_HASH, function(key, value) {
            newObj[value] = key;
        });
        return newObj;
    })();

    var OrgTreeSearch = exports = module.exports = Autocomplete.inherit({

        // @override onInput
        // as we have to filter empty string
        onInput: function(){
            var ac = this;
            // if this.val() is empty
            // just return
            if(this.val() === '') {
                this.hidePanel();
                return;
            }

            this.query(this.val());
        },

        // @override onFocusInput
        onFocusInput: function(){
            var ac = this;

            this.addClass('lbf-text-input-focus');

            // if this.val() is empty
            // just return
            if(this.val() === '') {
                this.hidePanel();
                return;
            }

            // restore query result of the existing text
            ac.query(this.val());

            // show panel when focus on input
            if(ac.get('userSearchUrl')) {
                setTimeout(function(){
                    ac.showPanel();
                }, 0);
            }
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

        /**
         * set the states of current query
         * @method setState
         * @param state{Array|String|undefined} ['normal', 'disabled', 'trash'] || 'normal' || empty
         */
        setStates: function(state) {
            var orgTreeSearch = this,
                stateArr = this.get('states'),
                newStateArr = [];

            // 如果没有参数传入，则将state设置为空array: []
            if([].slice.apply(arguments).length === 0) {
                this.set('states', []);
                return;
            }

            // 如果传入的是单个string
            if(typeof state === 'string') {
                state = [state];
            }

            each(state, function(key, value) {
                var stateHashArr = STATE_TO_ID_HASH[value] || [];
                newStateArr = newStateArr.concat(stateHashArr);
            });

            this.set({
                states: newStateArr
            });
        },

        /**
         * set the ajaxOptions of current query
         * @method setAjaxOptions
         * @param state{Object} {permissions:[], orgids:[], flags:[]} || empty
         */
        setAjaxOptions: function(options) {
            var _ajaxOptions = this.get('ajaxOptions');

            this.set({
                ajaxOptions: extend(true, _ajaxOptions, options)
            });
        },

        // @override select
        // Autocomplete
        select: function(idx){
            var option;

            if(!this.get('userSearchUrl')) {
                return this;
            }

            option = this.get('options')[idx];
            if( !option ){
                return this;
            }

            this.val(option.name);
            // bug fix
            this.find('.lbf-text-input-placeholder').css('display', 'none');

            this.trigger('selectOption', [option]);

            return this;
        },

        /**
         * Query with string
         * @method query
         * @chainable
         */
        query: function(querystring){
            var autoComplete = this,
                grepRegexp = new RegExp(this.get('grepRegexp'));

            // grep by the regexp
            var matchArr =  grepRegexp.exec(querystring);
            if(matchArr && matchArr.length >= 2) {
                querystring = matchArr[1];
            }
            
            querystring = querystring.split('(')[0];

            /**
             * Fired when query
             * @event query
             * @param {String} querystring
             */
            autoComplete.trigger('query', querystring);

            // delay query to improve performance
            // cancel last query
            autoComplete.timer && clearTimeout(autoComplete.timer) && (autoComplete.timer = null);

            autoComplete.timer = setTimeout(function(){
                // do query
                var queryEngine = autoComplete.get('query'),
                    maxnum = autoComplete.get('maxnum'),
                    queryOptions = {
                        query: querystring,
                        maxnum: maxnum,
                        source: autoComplete.get('querySource')
                    };

                queryEngine.apply(autoComplete, [queryOptions])
                    .done(function(options){
                        // slice & copy options array
                        options = options.slice(0, Math.min(options.length, maxnum));
                        // record options
                        autoComplete.set('options', options || []);

                        autoComplete.showPanel();
                    });
            }, 300);

            return this;
        }
    });

    OrgTreeSearch.include({
        name: 'OrgTreeSearch',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend({}, Autocomplete.settings, {

            query: ajaxQueryFunction,

            // 希望额外被加进ajax中的参数
            ajaxOptions: {
                /**
                 * empty: 全量搜索
                 */
                permissions: [],
                // 要搜索的组织架构id
                orgids: [],
                // 用户标志位
                flags: []
            },

            // by default, we get the normal member
            states: [2],

            // default 10
            maxnum: 10,

            // 从搜索框中grep数据的正则
            // 只取第一个()匹配
            grepRegexp: '(.*)',

            placeholder: '请输入成员姓名或英文名',

            // default userSearchUrl
            userSearchUrl: '/hrtx2015/staff/org/userSearch',

            optionTmpl: [
                '<ul class="lbf-autocomplete-options lbf-autocomplete-items">',
                '<% if( options.length === 0 ) { %>',
                '<li class="lbf-autocomplete-option empty"><a><%= emptyOptionPlaceholder %></a></li>',
                '<% } %>',
                '<% for(var i=0, len=options.length, op; i<len; i++){ %>',
                '<% op = options[i] %>',
                '<li class="lbf-autocomplete-option" data-index="<%== i %>"><a title="<%= op.name%>" href="javascript:;"><%= op.name%></a></li>',
                '<% } %>',
                '</ul>'
            ].join(''),

            //样式定制接口
            className: ''
        })
    });

    function ajaxQueryFunction(options) {
        var controller = this,
            promise = new Promise,
            ajaxOptions = controller.get('ajaxOptions');

        if(controller.get('userSearchUrl')) {
            REST.read({
                url: controller.get('userSearchUrl'),
                data: extend({
                    keyword: options.query,
                    states: controller.get('states'),
                    maxnum: options.maxnum
                }, ajaxOptions)
            })
            .done(function(rs) {
                // items格式为
                // [{
                //    "uin": "2355100000",
                //    "name": "张三",
                //    "account": "zhangsan",
                //    "gender": 1,
                //    "state": 2,
                //    "orgids": [[1], [1, 2, 3]], // 用户所在的多组织，组织链id
                //    "orgnames": [['根组织'], ['组织1', '组织2'], '组织3'] // 用户所在的多组织，组织链名称
                // }]
                var items = rs.items;
                each(items, function(index, item) {
                    // 设置当前号码的状态名称
                    item['stateName'] = ID_TO_STATE_HASH[item.state];
                });

                promise.resolve(items);
            })
            .fail(function() {
                promise.reject();
            });
        }

        return promise.promise();
    }
});
