/**
 * @fileOverview
 * @author seanxphuang
 * @version 6.0.0 beta
 * Created: 13-12-25 下午16:12
 */
LBF.define('util.Validform', function(require){
    require('{theme}/lbfUI/css/Validform.css');

    var Node = require('ui.Nodes.Node'),
        $ = require('lib.jQuery'),
        extend = require('lang.extend'),
        isFunction = require('lang.isFunction'),
        isRegExp = require('lang.isRegExp');

    /*
     * errorobj: 指示当前验证失败的表单元素;
     * msgobj: pop box object
     * msghidden: msgbox hidden?
     */
    var errorobj = null,
        msgobj = null,
        msghidden = true;

    //默认提示文字;
    var tipmsg = {
        tit: '提示信息',
        w: {
            '*': '不能为空！',
            '*6-16': '请填写6到16位任意字符！',
            'n': '请填写数字！',
            'n6-16': '请填写6到16位数字！',
            's': '不能输入特殊字符！',
            's6-18': '请填写6到18位字符！',
            'p': '请填写邮政编码！',
            'm': '请填写手机号码！',
            'email': '邮箱地址格式不对！',
            'url': '请填写网址！',
            'search': '请填写关键字！',
            'ckbox': '第{0}项是必选项！'
        },
        def: '请填写正确信息！',
        undef: 'datatype未定义！',
        reck: '两次输入的内容不一致！',
        r: '&nbsp;',
        c: '正在检测信息…',
        s: '请{填写|选择}{0|信息}！',
        v: '所填信息没有经过验证，请稍后…',
        p: '正在提交数据…'
    };

    //内置的常用规则;
    var DataType = {
        '*': /[\w\W]+/,
        '*6-16': /^[\w\W]{6,16}$/,
        'n': /^\d+$/,
        'n6-16': /^\d{6,16}$/,
        's': /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/,
        's6-18': /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/,
        'p': /^[0-9]{6}$/,
        'm': /^13[0-9]{9}$|^14[0-9]{9}|^15[0-9]{9}$|^18[0-9]{9}$/,
        'email': /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
        'url': /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
        'date': /^(?:(?:1[6-9]|[2-9][0-9])[0-9]{2}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00)([-/.]?)0?2\2(?:29))(\s+([01][0-9]:|2[0-3]:)?[0-5][0-9]:[0-5][0-9])?$/,
        'datetime': '',
        'datetime-local': '',
        'month': '',
        'week': '',
        'time': '',
        'number': /^(\d+[\s,]*)+\.?\d*$/,
        'search': /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/,
        'telephone': /\d{7}/,
        'ckbox': function(gets, input){
            var $input = $(input),
                rexp = RegExp($input.data('datatype'), 'g'),
                need = $input.data('need');

            gets = gets.match(rexp) ? gets.match(rexp).length : 0;

            return need == gets ? true : false;
        }
    };

    /**
     * 通用表单验证方法
     * @class Validform
     * @namespace util
     * @module util
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} opts Options for initialization
     * @param {String|Dom|$} opts.selector 对象或选择符,必须绑定在form元素上
     * @param {Boolean} [opts.html5] 是否使用html5自带的验证方式
     * @param {String|Dom|$} [opts.btnSubmit] 触发表单提交的对象，会在当前表单下查找
     * @param {String|Dom|$} [opts.btnReset] 触发表单充值的对象，会在当前表单下查找
     * @param {Number|Function} [opts.tiptype] 指定信息提示方式
     * @param {Boolean} [opts.ignoreHidden] 是否忽略对隐藏元素的验证
     * @param {Boolean} [opts.dragonfly] 值为空时不触发验证
     * @param {Boolean} [opts.tipSweep] 是否只在表单提交时触发验证
     * @param {String|Dom|$} [opts.label] 在没有绑定nullmsg时查找要显示的提示文字
     * @param {Boolean} [opts.showAllError] 提交表单时是否显示所有错误信息
     * @param {Boolean} [opts.postonce] 是否让表单只能成功提交一次
     * @param {Boolean} [opts.ajaxPost] 是否以ajax方式提交当前表单
     * @param {Object} [opts.datatype] 扩展datatype类型
     * @param {Function} [opts.beforeCheck(curform)] 表单验证前执行的函数
     * @param {Function} [opts.beforeSubmit(curform)] 表单提交前执行的函数
     * @param {Function} [opts.callback(data)] 表单提交后的回调
     *
     * @example
     * new Validform({
     *     selector: '.demoform', // 必需, '.demoform'指明是哪一表单需要验证,名称需加在form表单上;
     *     html5: false, //可选项 true | false，true：使用html5验证，false：使用Validform统一验证，默认false;
     *     btnSubmit: "#btn_sub", //#btn_sub是该表单下要绑定点击提交表单事件的按钮;如果form内含有submit按钮该参数可省略;
     *     btnReset: ".btn_reset", //可选项 .btn_reset是该表单下要绑定点击重置表单事件的按钮;
     *     tiptype:1, //可选项 1=>pop box,2=>side tip(parent.next.find; with default pop),3=>side tip(siblings; with default pop),4=>side tip(siblings; none pop)，默认为1，也可以传入一个function函数，自定义提示信息的显示方式（可以实现你想要的任何效果）;
     *                  @example tiptype ==> function:
     *                  tiptype:function(type, msg, curObj, curform, cssctl){
                            //type指示提示的状态，值为1、2、3、4， 1：正在检测/提交数据，2：通过验证，3：验证失败，4：提示ignore状态;
                            //msg：提示信息;
                            //curObj 是当前验证的表单元素（或表单对象）;
                            //curform 当前所在表单;
                            //cssctl:内置的提示信息样式控制函数，该函数需传入两个参数：显示提示信息的对象 和 当前提示的状态（既形参o中的type）;
                            $curObj = $(curObj);
                            if(!$curObj.is("form")){//验证表单元素时o.obj为该表单元素，全部验证通过提交表单时o.obj为该表单对象;
                                var objtip=$curObj.siblings(".Validform_checktip");
                                cssctl(objtip,type);
                                objtip.html(msg);
                            }
                        }
     *     ignoreHidden: false, //可选项 true | false 默认为false，当为true时对:hidden的表单元素将不做验证;
     *     dragonfly: false, //可选项 true | false 默认false，当为true时，值为空时不做验证；
     *     tipSweep: true, //可选项 true | false 默认为false，只在表单提交时触发检测，blur事件将不会触发检测（实时验证会在后台进行，不会显示检测结果）;
     *     label: ".label", //可选项 选择符，在没有绑定nullmsg时查找要显示的提示文字，默认查找".Validform_label"下的文字;
     *     showAllError: false, //可选项 true | false，true：提交表单时所有错误提示信息都会显示，false：一碰到验证不通过的就停止检测后面的元素，只显示该元素的错误信息;
     *     postonce: true, //可选项 表单是否只能提交一次，true开启，不填则默认关闭;
     *     ajaxPost: true, //使用ajax方式提交表单数据，默认false，提交地址就是action指定地址;
     *     datatype: {//传入自定义datatype类型，可以是正则，也可以是函数（函数内会传入一个参数）;
     *         "*6-20": /^[^\s]{6,20}$/,
     *         "z2-4" : /^[\u4E00-\u9FA5\uf900-\ufa2d]{2,4}$/,
     *         "username":function(inputval, input, curform, regxp){
     *             //参数inputval是获取到的表单元素值，input为当前表单元素，curform为当前验证的表单，regxp为内置的一些正则表达式的引用;
     *             var reg1=/^[\w\.]{4,16}$/,
     *             reg2=/^[\u4E00-\u9FA5\uf900-\ufa2d]{2,8}$/;
     *
     *             if(reg1.test(inputval)){return true;}
     *             if(reg2.test(inputval)){return true;}
     *             return false;
     *
     *             //注意return可以返回true 或 false 或 字符串文字，true表示验证通过，返回字符串表示验证失败，字符串作为错误提示显示，返回false则用errmsg或默认的错误提示;
     *         }
     *     },
     *     beforeCheck: function(curform){
     *         //在表单提交执行验证之前执行的函数，curform参数是当前表单对象。
     *         //这里明确return false的话将不会继续执行验证操作;
     *     },
     *     beforeSubmit: function(curform){
     *         //在验证成功后，表单提交前执行的函数，curform参数是当前表单对象。
     *         //这里明确return false的话表单将不会提交;
     *     },
     *     callback: function(data){
     *         //返回数据data是json格式，{"info":"demo info","status":"y"}
     *         //info: 输出提示信息;
     *         //status: 返回提交数据的状态,是否提交成功。如可以用"y"表示提交成功，"n"表示提交失败，在ajax_post.php文件返回数据里自定字符，主要用在callback函数里根据该值执行相应的回调操作;
     *         //你也可以在ajax_post.php文件返回更多信息在这里获取，进行相应操作；
     *         //ajax遇到服务端错误时也会执行回调，这时的data是{ status:**, statusText:**, readyState:**, responseText:** }；
     *
     *         //这里执行回调操作;
     *         //注意：如果不是ajax方式提交表单，传入callback，这时data参数是当前表单对象，回调函数会在表单验证全部通过后执行，然后判断是否提交表单，如果callback里明确return false，则表单不会提交，如果return true或没有return，则会提交表单。
     *     }
     * });
     *
     * Validform对象的方法和属性：
     * tipmsg：自定义提示信息，通过修改Validform对象的这个属性值来让同一个页面的不同表单使用不同的提示文字；
     * dataType：获取内置的一些正则；
     * eq(n)：获取Validform对象的第n个元素;
     * ajaxPost(flag, sync, url)：以ajax方式提交表单。flag为true时，跳过验证直接提交，sync为true时将以同步的方式进行ajax提交，传入了url地址时，表单会提交到这个地址；
     * abort()：终止ajax的提交；
     * submitForm(flag, url)：以参数里设置的方式提交表单，flag为true时，跳过验证直接提交，传入了url地址时，表单会提交到这个地址；
     * resetForm()：重置表单；
     * resetStatus()：重置表单的提交状态。传入了postonce参数的话，表单成功提交后状态会设置为"posted"，重置提交状态可以让表单继续可以提交；
     * getStatus()：获取表单的提交状态，normal：未提交，posting：正在提交，posted：已成功提交过；
     * setStatus(status)：设置表单的提交状态，可以设置normal，posting，posted三种状态，不传参则设置状态为posting，这个状态表单可以验证，但不能提交；
     * ignore(selector)：忽略对所选择对象的验证；
     * unignore(selector)：将ignore方法所忽略验证的对象重新获取验证效果；
     * addRule(rule)：可以通过Validform对象的这个方法来给表单元素绑定验证规则；
     * check(selector, bool): 对指定对象进行验证(默认验证当前整个表单)，通过返回true，否则返回false（绑定实时验证的对象，格式符合要求时返回true，而不会等ajax的返回结果），bool为true时则只验证不显示提示信息；
     * config(setup): 可以通过这个方法来修改初始化参数，指定表单的提交地址，给表单ajax和实时验证的ajax里设置参数；
     * showmsg(msg, curObj, type);
     */

    var Validform = Node.inherit({
        initialize: function(opts, el){
            if(opts){
                this.mergeOptions(opts);
                //this.render();
                //this.initEvents();
                //this.initElements();

                var datatype = this.get('datatype');
                datatype && extend(this.dataType, datatype);
            }

            var forms = el || $(this.get('selector')).get();
            this.render(forms);
        },

        render: function(forms){
            var me = this,
                settings = this.attributes();

            me.setElement(forms);

            me.tipmsg = {w:{}};
            me.forms = forms;
            me.objects = [];

            $(forms).each(function(){
                var curform = this;

                //已经绑定事件时跳过，避免事件重复绑定;
                if(curform.validform_inited === 'inited'){
                    return true;
                }
                curform.validform_inited = 'inited';

                //复制一个setting对象绑定在当前表单;
                curform.settings = extend({}, settings);

                var $curform = $(curform);

                //防止表单按钮双击提交两次;
                curform.validform_status = 'normal'; //normal | posting | posted;

                //让每个Validform对象都能自定义tipmsg;
                $curform.data('tipmsg', me.tipmsg);

                //bind the blur event;
                $curform.delegate('[datatype]', 'blur', function(){
                    //判断是否是在提交表单操作时触发的验证请求；
                    var subpost = arguments[1];
                    me._check(this, curform, subpost);
                });

                //for html5;
                curform.settings.html5 || $curform.find('input').on('invalid', function(event){
                    //firefox下，invalid触发后不会提交表单;
                    /Firefox/.test(navigator.userAgent) && $curform.submit();
                    event.preventDefault();
                });

                $curform.delegate(':text', 'keypress', function(event){
                    if(event.keyCode === 13 && $curform.find(':submit').length === 0){
                        $curform.submit();
                    }
                });

                //点击表单元素，默认文字消失效果;
                //表单元素值比较时的信息提示增强;
                //radio、checkbox提示信息增强;
                //外调插件初始化;
                me._enhance(curform);

                curform.settings.btnSubmit && $curform.delegate(curform.settings.btnSubmit, 'click', function(){
                    $curform.trigger('submit');
                    return false;
                });

                $curform.submit(function(){
                    var subflag = me._submitForm(curform);
                    subflag === undefined && (subflag = true);
                    return subflag;
                });

                $curform.delegate('[type="reset"]' + (curform.settings.btnReset ? ',' + curform.settings.btnReset : ''), 'click',function(){
                    me._resetForm(curform);
                });

            });

            //预创建pop box;
            if( settings.tiptype === 1 || (settings.tiptype === 2 || settings.tiptype === 3) && settings.ajaxPost ){
                me._creatMsgbox();
            }
        },

        /**
         * dataype的引用
         * @property dataType
         */
        dataType: DataType,

        /**
         * 获取第n个表单
         * @method eq
         * @param {Number} n 获取第n个表单
         */
        eq: function(n){
            var me = this;

            if(n >= me.forms.length){
                return null;
            }

            if(!(n in me.objects)){
                me.objects[n] = new Validform(null, me.forms[n]);
            }

            return me.objects[n];

        },

        /**
         * 重置表单状态
         * @method resetStatus
         */
        resetStatus: function(){
            $(this.forms).each(function(){
                this.validform_status = 'normal';
            });

            return this;
        },

        /**
         * 设置表单状态
         * @method setStatus
         * @param {String} [status] 设置表单状态
         */
        setStatus: function(status){
            $(this.forms).each(function(){
                this.validform_status = status || 'posting';
            });

            return this;
        },

        /**
         * 设置表单状态
         * @method getStatus
         */
        getStatus: function(){
            return this.forms[0].validform_status;
        },

        /**
         * 忽略对某个或某些元素的验证
         * @method ignore
         * @param {String} [selector] 选择符，会在当前表单下查找
         */
        ignore: function(selector){
            var selector = selector || '[datatype]'

            $(this.forms).find(selector).each(function(){
                $(this).data('dataIgnore', 'dataIgnore').removeClass('Validform_error');
            });

            return this;
        },

        /**
         * 恢复对某个或某些元素的验证
         * @method unignore
         * @param {String} [selector] 选择符，会在当前表单下查找
         */
        unignore: function(selector){
            var selector = selector || '[datatype]'

            $(this.forms).find(selector).each(function(){
                $(this).removeData('dataIgnore');
            });

            return this;
        },

        /**
         * 给表单元素绑定验证规则
         * @method addRule
         * @param {Array} [rule]
         */
        addRule: function(rule){
            /*
             rule => [{
             ele:"#id",
             datatype:"*",
             errormsg:"出错提示文字！",
             nullmsg:"为空时的提示文字！",
             tip:"默认显示的提示文字",
             altercss:"gray",
             ignore:"ignore",
             ajaxurl:"valid.php",
             recheck:"password",
             plugin:"passwordStrength"
             },{},{},...]
             */
            var me = this,
                rule = rule || [];

            for(var index = 0; index < rule.length; index++){
                var o = $(this.forms).find(rule[index].ele);
                for(var attr in rule[index]){
                    attr !== 'ele' && o.attr(attr, rule[index][attr]);
                }
            }

            $(this.forms).each(function(){
                me._enhance(this, 'addRule');
            });

            return this;
        },

        /**
         * 显示提示信息
         * @method showmsg
         * @param {String} msg 文字消息
         * @param {Object} curObj 当前dom元素
         * @param {String} [type] 消息类型 'success', 'checking', 'reset', 'wrong' 分别对应 验证通过、正在验证、重置状态和验证失败, 默认wrong;
         */
        showmsg: function(msg, curObj, type){
            var curform = $(curObj).is('form') ? curObj : $(curObj).parents('form').get(0);

            switch(type){
                case 'success':
                    type = 2;
                    break;
                case 'checking':
                    type = 1;
                    break;
                case 'reset':
                    type = 4;
                    break;
                default:
                    type = 3;
            }

            this._showmsg(type, msg, curObj, curform);
        },

        /**
         * ajax提交表单
         * @method ajaxPost
         * @param {Boolean} [flag] 是否不做验证直接提交表单
         * @param {Boolean} [sync] 是否使用同步模式
         * @param {String} [url] 表单提交地址，会覆盖form的action和config方法指定的地址;
         */
        ajaxPost: function(flag, sync, url){
            var me = this;

            $(me.forms).each(function(i){
                //创建pop box;
                if( this.settings.tiptype === 1 || this.settings.tiptype === 2 || this.settings.tiptype === 3 ){
                    me._creatMsgbox();
                }

                me._submitForm(this, flag, url, 'ajaxPost', sync);
            });

            return this;
        },

        /**
         * 提交表单
         * @method submitForm
         * @param {Boolean} [flag] 是否不做验证直接提交表单
         * @param {String} [url] 表单提交地址，会覆盖form的action和config方法指定的地址;
         */
        submitForm: function(flag, url){
            /*flag===true时不做验证直接提交*/
            var me = this;

            $(me.forms).each(function(){
                var subflag = me._submitForm(this, flag, url);
                subflag === undefined && (subflag = true);
                if(subflag === true){
                    this.submit();
                }
            });

            return this;
        },

        /**
         * 重置表单
         * @method resetForm
         */
        resetForm: function(){
            this._resetForm();

            return this;
        },

        /**
         * 取消ajax提交表单
         * @method abort
         */
        abort: function(){
            var me = this;
            $(me.forms).each(function(){
                me._abort(this);
            });

            return this;
        },

        /**
         * 验证指定表单元素
         * @method check
         * @param {String} [selector] 是否不做验证直接提交表单
         * @param {Boolean} [bool] 是否只检测不显示提示信息
         */
        check: function(selector, bool){
            /*
             bool：传入true，只检测不显示提示信息;
             */

            var me = this,
                selector = selector || '[datatype]',
                flag=true;

            $(me.forms).find(selector).each(function(){
                var form = $(this).parents('form').get(0);
                me._check(this, form,  '', bool) || (flag = false);
            });

            return flag;
        },

        /**
         * 配置表单初始化参数
         * @method config
         * @param {Object} [setup]
         * @example
         * setup = {
         *       url:"ajaxpost.php",//指定了url后，数据会提交到这个地址;
         *       ajaxurl:{
         *            timeout:1000,
         *            ...
         *       },
         *       ajaxpost:{
         *            timeout:1000,
         *            ...
         *       }
         *   }
         */
        config: function(setup){
            var me = this;

            setup = setup || {};
            $(me.forms).each(function(){
                this.settings = extend(true, this.settings, setup);
                me._enhance(this);
            });

            return this;
        },


        _isEmpty:function(input, val){
            return val === '' || val === $.trim($(input).attr('tip'));
        },

        _getValue:function(input, curform){
            var $input = $(input),
                $curform = $(curform),
                inputval;

            if($input.is(':radio')){
                inputval = $curform.find(':radio[name="' + $input.attr('name') + '"]:checked').val();
                inputval = inputval === undefined ? '' : inputval;
            } else if ($input.is(':checkbox')){
                inputval = '';
                $curform.find(':checkbox[name="' + $input.attr('name')+'"]:checked').each(function(){
                    inputval += $(this).val() + ',';
                });
                inputval = inputval === undefined ? '' : inputval;
            }else{
                inputval = $input.val();
            }
            inputval = $.trim(inputval);

            return this._isEmpty(input, inputval) ? '' : inputval;
        },

        _enhance:function(curform, addRule){
            var $curform = $(curform),
                tiptype = curform.settings.tiptype,
                tipSweep = curform.settings.tipSweep;

            //for html5;
            curform.settings.html5 || $curform.find('input:not(:submit,:button,:reset)').each(function(){
                //已经绑定事件时跳过;
                if(this.validform_html5 === 'inited'){
                    return true;
                }

                this.validform_html5 = 'inited';

                //required: date,datetime,datetime-local,month,week,time,email,number,url,search,telephone;
                var typestr = 'password,text,file,radio,checkbox',
                    type = $(this).attr('type').toLowerCase(),
                    datatype = typestr.indexOf(type) === -1 ? type : '*';

                if($(this).is('[required]')){
                    $(this).removeAttr('required');

                    if($(this).is(':radio,:checkbox')){
                        var name = $(this).attr('name');

                        if($curform.find('input[name="'+name+'"]').filter('[datatype]').length){
                            return true;
                        }

                        if($(this).is(':checkbox')){
                            var ckbox = $curform.find('input[name="'+name+'"]');
                            ckbox.filter('[required]').add(this).attr('need','need');
                        }

                    }

                    $(this).is('[datatype]') || $(this).attr('datatype',datatype);

                }else if(typestr.indexOf(type) === -1){
                    $(this).is('[datatype]') || $(this).attr('datatype',type) && $(this).attr('ignore','ignore');
                }

            });

            //页面上不存在提示信息的标签时，自动创建;
            $curform.find('[datatype]').each(function(){
                if(tiptype === 2){
                    if($(this).parent().next().find('.Validform_checktip').length === 0){
                        $(this).parent().next().append('<span class="Validform_checktip" />');
                        $(this).siblings('.Validform_checktip').remove();
                    }
                }else if(tiptype === 3 || tiptype === 4){
                    if($(this).siblings('.Validform_checktip').length === 0){
                        $(this).parent().append('<span class="Validform_checktip" />');
                        $(this).parent().next().find('.Validform_checktip').remove();
                    }
                }
            })

            //表单元素值比较时的信息提示增强;
            $curform.find('input[recheck]').each(function(){
                //已经绑定事件时跳过;
                if(this.validform_inited === 'inited'){return true;}
                this.validform_inited = 'inited';

                var $input = $(this);
                var recheckinput = $curform.find('input[name="'+$(this).attr('recheck')+'"]');
                recheckinput.bind('keyup',function(){
                    if(recheckinput.val() == $input.val() && recheckinput.val() != ''){
                        if(recheckinput.attr('tip')){
                            if(recheckinput.attr('tip') == recheckinput.val()){return false;}
                        }
                        $input.trigger('blur');
                    }
                }).bind('blur',function(){
                    if(recheckinput.val() != $input.val() && $input.val() != ''){
                        if($input.attr('tip')){
                            if($input.attr('tip') == $input.val()){return false;}
                        }
                        $input.trigger('blur');
                    }
                });
            });

            //hasDefaultText;
            $curform.find('[tip]').each(function(){//tip是表单元素的默认提示信息,这是点击清空效果;
                //已经绑定事件时跳过;
                if(this.validform_inited === 'inited'){return true;}
                this.validform_inited = 'inited';

                var defaultvalue = $(this).attr('tip');
                var altercss = $(this).attr('altercss');
                $(this).focus(function(){
                    if($(this).val() == defaultvalue){
                        $(this).val('');
                        if(altercss){$(this).removeClass(altercss);}
                    }
                }).blur(function(){
                        if($.trim($(this).val()) === ''){
                            $(this).val(defaultvalue);
                            if(altercss){$(this).addClass(altercss);}
                        }
                    });
            });

            //enhance info feedback for checkbox & radio;
            $curform.find(':checkbox[datatype],:radio[datatype]').each(function(){
                //已经绑定事件时跳过;
                if(this.validform_inited === 'inited'){return true;}
                this.validform_inited = 'inited';

                var $input = $(this),
                    name = $input.attr('name'),
                    ckbox = $curform.find('input[name="'+name+'"]');

                //给checkbox另外绑定功能，指定哪几个项是必选项;
                if($input.is(':checkbox') && ckbox.filter('[need]').length){
                    var datatype = [],
                        index = [];

                    ckbox.filter('[need]').each(function(n){
                        datatype.push($(this).attr('value'));
                        index.push(ckbox.index(this)+1);
                    });
                    datatype = datatype.join('|');
                    $(this).data('need',index.length);
                    $(this).data('datatype',datatype);
                    index = index.join(',');
                    index = (curform.data('tipmsg').w.ckbox || tipmsg.w.ckbox).replace('{0}',index);
                    datatype = $(this).attr('datatype')+','+'ckbox';
                    $(this).attr('errormsg',index).attr('datatype',datatype);
                }

                ckbox.bind('click',function(){
                    //避免多个事件绑定时的取值滞后问题;
                    setTimeout(function(){
                        $input.trigger('blur');
                    },0);
                });

            });

            //select multiple;
            $curform.find('select[datatype][multiple]').bind('click',function(){
                var $input = $(this);
                setTimeout(function(){
                    $input.trigger('blur');
                },0);
            });

        },

        _getNullmsg:function(input, curform){
            var $curform = $(curform),
                $input = $(input),
                reg = /[\u4E00-\u9FA5\uf900-\ufa2da-zA-Z\s]+/g,
                nullmsg;

            var label = curform.settings.label || '.Validform_label';
            label = $input.prevAll(label).eq(0).text() || $input.prevAll().find(label).eq(0).text() || $input.parent().prevAll(label).eq(0).text() || $input.parent().prevAll().find(label).eq(0).text();
            label = label.replace(/\s(?![a-zA-Z])/g,'').match(reg);
            label = label? label.join('') : [''];

            reg = /\{(.+)\|(.+)\}/;
            nullmsg = $curform.data('tipmsg').s || tipmsg.s;

            if(label != ''){
                nullmsg = nullmsg.replace(/\{0\|(.+)\}/,label);
                if($input.attr('recheck')){
                    nullmsg = nullmsg.replace(/\{(.+)\}/,'');
                    $input.attr('nullmsg',nullmsg);
                    return nullmsg;
                }
            }else{
                nullmsg = $input.is(':checkbox,:radio,select') ? nullmsg.replace(/\{0\|(.+)\}/,'') : nullmsg.replace(/\{0\|(.+)\}/,'$1');
            }
            nullmsg = $input.is(':checkbox,:radio,select') ? nullmsg.replace(reg,'$2') : nullmsg.replace(reg,'$1');

            $input.attr('nullmsg',nullmsg);
            return nullmsg;
        },

        _getErrormsg:function(input, curform, datatype, recheck){
            var regxp = /^(.+?)((\d+)-(\d+))?$/,
                regxp2 = /^(.+?)(\d+)-(\d+)$/,
                regxp3 = /(.*?)\d+(.+?)\d+(.*)/,
                mac = datatype.match(regxp),
                $curform = $(curform),
                temp, str;

            //如果是值不一样而报错;
            if(recheck === 'recheck'){
                str = $curform.data('tipmsg').reck || tipmsg.reck;
                return str;
            }

            var tipmsg_w_ex = $.extend({},tipmsg.w,$curform.data('tipmsg').w);

            //如果原来就有，直接显示该项的提示信息;
            if(mac[0] in tipmsg_w_ex){
                return $curform.data('tipmsg').w[mac[0]] || tipmsg.w[mac[0]];
            }

            //没有的话在提示对象里查找相似;
            for(var name in tipmsg_w_ex){
                if(name.indexOf(mac[1]) != -1 && regxp2.test(name)){
                    str = ($curform.data('tipmsg').w[name] || tipmsg.w[name]).replace(regxp3,'$1'+mac[3]+'$2'+mac[4]+'$3');
                    $curform.data('tipmsg').w[mac[0]] = str;

                    return str;
                }

            }

            return $curform.data('tipmsg').def || tipmsg.def;
        },

        _groupRegcheck:function(datatype, inputval, input, curform){
            var me = this,
                $curform = $(curform),
                $input = $(input),
                info = null,
                passed = false,
                reg = /\/.+\//g,
                regex = /^(.+?)(\d+)-(\d+)$/,
                type = 3;//default set to wrong type, 2,3,4;

            //datatype有三种情况：正则，函数和直接绑定的正则;

            //直接是正则;
            if(reg.test(datatype)){
                var regstr = datatype.match(reg)[0].slice(1,-1);
                var param = datatype.replace(reg,'');
                var rexp = RegExp(regstr, param);

                passed = rexp.test(inputval);

            //function;
            }else if( isFunction(me.dataType[datatype]) ){
                passed = me.dataType[datatype](inputval, input, curform, me.dataType);
                if(passed === true || passed === undefined){
                    passed = true;
                }else{
                    info = passed;
                    passed = false;
                }

            //自定义正则;
            }else{
                //自动扩展datatype;
                if(!(datatype in me.dataType)){
                    var mac = datatype.match(regex),
                        temp;

                    if(mac) {
                        for(var name in me.dataType){
                            temp = name.match(regex);
                            if(!temp){continue;}
                            if(mac[1] === temp[1]){
                                var str = me.dataType[name].toString(),
                                    param = str.match(/\/[mgi]*/g)[1].replace('\/',''),
                                    regxp = new RegExp('\\{'+temp[2]+','+temp[3]+'\\}','g');
                                str = str.replace(/\/[mgi]*/g,'\/').replace(regxp,'{'+mac[2]+','+mac[3]+'}').replace(/^\//,'').replace(/\/$/,'');
                                me.dataType[datatype] = new RegExp(str, param);
                                break;
                            }
                        }
                    }

                    //没有查找到对应datatype时;
                    if(!mac || !me.dataType[datatype]) {
                        passed = false;
                        info = $curform.data('tipmsg').undef || tipmsg.undef;
                    }
                }

                if( isRegExp(me.dataType[datatype]) ){
                    passed = me.dataType[datatype].test(inputval);
                }

            }


            if(passed){
                type = 2;
                info = $input.attr('sucmsg') || $curform.data('tipmsg').r||tipmsg.r;

                //规则验证通过后，还需要对绑定recheck的对象进行值比较;
                if($input.attr('recheck')){
                    var theother = $curform.find('input[name="'+$input.attr("recheck")+'"]:first');
                    if(inputval != theother.val()){
                        passed = false;
                        type = 3;
                        info = $input.attr('errormsg')  || me._getErrormsg(input, curform, datatype, 'recheck');
                    }
                }
            }else{
                info = info || $input.attr('errormsg') || me._getErrormsg(input, curform, datatype);

                //验证不通过且为空时;
                if(me._isEmpty(input, inputval)){
                    info = $input.attr('nullmsg') || me._getNullmsg(input, curform);
                }
            }

            return{
                passed:passed,
                type:type,
                info:info
            };

        },

        _regcheck:function(curform, datatype, inputval, input){
            /*
             datatype:datatype;
             inputval:inputvalue;
             input:input dom;
             */
            var me = this,
                $input = $(input),
                info = null,
                passed = false,
                type = 3;//default set to wrong type, 2,3,4;

            //ignore;
            if($input.attr('ignore') === 'ignore' && me._isEmpty(input, inputval)){
                if($input.data('cked')){
                    info = '';
                }

                return {
                    passed:true,
                    type:4,
                    info:info
                };
            }

            $input.data('cked','cked');//do nothing if is the first time validation triggered;

            var dtype = me._parseDatatype(datatype);
            var res;
            for(var eithor = 0; eithor<dtype.length; eithor++){
                for(var dtp = 0; dtp<dtype[eithor].length; dtp++){
                    res = me._groupRegcheck(dtype[eithor][dtp],inputval, input, curform);
                    if(!res.passed){
                        break;
                    }
                }
                if(res.passed){
                    break;
                }
            }
            return res;

        },

        _parseDatatype:function(datatype){
            /*
             字符串里面只能含有一个正则表达式;
             Datatype名称必须是字母，数字、下划线或*号组成;
             datatype = "/regexp/|phone|tel,s,e|f,e";
             ==>[["/regexp/"],["phone"],["tel","s","e"],["f","e"]];
             */

            var reg = /\/.+?\/[mgi]*(?=(,|$|\||\s))|[\w\*-]+/g,
                dtype = datatype.match(reg),
                sepor = datatype.replace(reg,'').replace(/\s*/g,'').split(''),
                arr = [],
                m = 0;

            arr[0] = [];
            arr[0].push(dtype[0]);
            for(var n = 0;n<sepor.length;n++){
                if(sepor[n] === '|'){
                    m++;
                    arr[m] = [];
                }
                arr[m].push(dtype[n+1]);
            }

            return arr;
        },

        /*
         * type: 信息类型，1：checking, 2:passed, 4:for ignore, 其他值就是wrong;
         * msg: 提示文字;
         * curObj：当前正在处理的表单元素,
         * curform：当前元素所属表单,
         * triggered:在blur或提交表单触发的验证中，有些情况不需要显示提示文字，如自定义弹出提示框的显示方式，不需要每次blur时就马上弹出提示;
         */
        _showmsg:function(type, msg, curObj, curform, triggered){
            var me = this,
                $curObj = $(curObj),
                settings = curform.settings,
                sweep = settings.tipSweep,
                tiptype = settings.tiptype;

            //如果msg为undefined，那么就没必要执行后面的操作，ignore有可能会出现这情况;
            if(msg == undefined){return;}

            //tipSweep为true，且当前不是处于错误状态时，blur事件不触发信息显示;
            if(triggered === 'bycheck' && sweep && ($curObj.length && !$curObj.is('.Validform_error') || typeof type === 'function')){return;}

            if(typeof tiptype === 'function'){
                tiptype(type, msg, curObj, curform, me._cssctl);
                return;
            }

            if(tiptype === 1 || triggered === 'byajax' && tiptype !== 4){
                msgobj.find('.Validform_info').html(msg);
            }

            //tiptypt=1时，blur触发showmsg，验证是否通过都不弹框，提交表单触发的话，只要验证出错，就弹框;
            if(tiptype === 1 && triggered != 'bycheck' && type !== 2 || triggered === 'byajax' && tiptype !== 4){
                msghidden = false;
                msgobj.find('.iframe').css('height',msgobj.outerHeight());
                msgobj.show();
                me._setCenter(msgobj, 100);
            }

            if(tiptype === 2 && $curObj.length){
                $curObj.parent().next().find('.Validform_checktip').html(msg);
                me._cssctl($curObj.parent().next().find('.Validform_checktip'), type);
            }

            if((tiptype === 3 || tiptype === 4) && $curObj.length){
                $curObj.siblings('.Validform_checktip').html(msg);
                me._cssctl($curObj.siblings('.Validform_checktip'), type);
            }

        },

        _cssctl:function(input, status){
            var $input = $(input);
            switch(status){
                case 1:
                    $input.removeClass('Validform_right Validform_wrong').addClass('Validform_checktip Validform_loading');//checking;
                    break;
                case 2:
                    $input.removeClass('Validform_wrong Validform_loading').addClass('Validform_checktip Validform_right');//passed;
                    break;
                case 4:
                    $input.removeClass('Validform_right Validform_wrong Validform_loading').addClass('Validform_checktip');//for ignore;
                    break;
                default:
                    $input.removeClass('Validform_right Validform_loading').addClass('Validform_checktip Validform_wrong');//wrong;
            }
        },

        /*
         * 检测单个表单元素;
         * 验证通过返回true，否则返回false、实时验证返回值为ajax;
         * bool，传入true则只检测不显示提示信息;
         */
        _check:function(input, curform, subpost, bool){
            var me = this,
                $curform = $(curform),
                $input = $(input),
                settings = curform.settings,
                subpost = subpost || '',
                inputval = me._getValue(input, curform);

            //隐藏或绑定dataIgnore的表单对象不做验证;
            if(settings.ignoreHidden && $input.is(':hidden') || $input.data('dataIgnore') === 'dataIgnore'){
                return true;
            }

            //dragonfly=true时，没有绑定ignore，值为空不做验证，但验证不通过;
            if(settings.dragonfly && !$input.data('cked') && me._isEmpty(input, inputval) && $input.attr('ignore') != 'ignore'){
                return false;
            }

            var flag = me._regcheck(curform, $input.attr('datatype'), inputval, input);

            //值没变化不做检测，这时要考虑recheck情况;
            //不是在提交表单时触发的ajax验证;
            if(inputval == input.validform_lastval && !$input.attr('recheck') && subpost == ''){
            	me._showmsg(flag.type, flag.info, input, curform, 'bycheck');
                return flag.passed ? true : false;
            }

            input.validform_lastval = inputval;//存储当前值;

            var errorobj = $input;

            if(!flag.passed){
                //取消正在进行的ajax验证;
                me._abort(input);

                if(!bool){
                    //传入"bycheck"，指示当前是check方法里调用的，当tiptype=1时，blur事件不让触发错误信息显示;
                    me._showmsg(flag.type, flag.info, input, curform, 'bycheck');
                    //me._showmsg(curform, flag.info, settings.tiptype, {obj:input, type:flag.type, sweep:settings.tipSweep}, 'bycheck');

                    !settings.tipSweep && $input.addClass('Validform_error');
                }
                return false;
            }

            //验证通过的话，如果绑定有ajaxurl，要执行ajax检测;
            //当ignore="ignore"时，为空值可以通过验证，这时不需要ajax检测;
            var ajaxurl = $input.attr('ajaxurl');
            if(ajaxurl && !me._isEmpty(input, inputval) && !bool){
                //当提交表单时，表单中的某项已经在执行ajax检测，这时需要让该项ajax结束后继续提交表单;
                if(subpost === 'postform'){
                    input.validform_subpost = 'postform';
                }else{
                    input.validform_subpost = '';
                }

                if(input.validform_valid === 'posting' && inputval == input.validform_ckvalue){return 'ajax';}

                input.validform_valid = 'posting';
                input.validform_ckvalue = inputval;
                me._showmsg(1, $curform.data('tipmsg').c||tipmsg.c, input, curform, 'bycheck');
                //me._showmsg(curform,$curform.data('tipmsg').c||tipmsg.c, settings.tiptype, {obj:input, type:1, sweep:settings.tipSweep}, 'bycheck');

                me._abort(input);

                var ajaxsetup = $.extend(true,{},settings.ajaxurl || {});

                var localconfig = {
                    type: 'POST',
                    cache:false,
                    url: ajaxurl,
                    data: {
                        param: encodeURIComponent(inputval),
                        name: encodeURIComponent($input.attr('name'))
                    },
                    success: function(data){
                        if($.trim(data.status) === 'y'){
                            input.validform_valid = 'true';
                            data.info && $input.attr('sucmsg',data.info);
                            me._showmsg(2, $input.attr('sucmsg') || $curform.data('tipmsg').r||tipmsg.r, input, curform, 'bycheck');
                            //me._showmsg(curform,$input.attr('sucmsg') || $curform.data('tipmsg').r||tipmsg.r, settings.tiptype, {obj:input, type:2, sweep:settings.tipSweep}, 'bycheck');
                            $input.removeClass('Validform_error');
                            errorobj = null;
                            if(input.validform_subpost === 'postform'){
                                $curform.trigger('submit');
                            }
                        }else{
                            input.validform_valid = data.info;
                            me._showmsg(3, data.info, input, curform, 'bycheck');
                            //me._showmsg(curform, data.info, settings.tiptype, {obj:input, type:3, sweep:settings.tipSweep});
                            $input.addClass('Validform_error');
                        }
                        input.validform_ajax = null;
                    },
                    error: function(data){
                        if(data.status === '200'){
                            if(data.responseText == 'y'){
                                ajaxsetup.success({'status':'y'});
                            }else{
                                ajaxsetup.success({'status':'n','info':data.responseText});
                            }
                            return false;
                        }

                        //正在检测时，要检测的数据发生改变，这时要终止当前的ajax。不是这种情况引起的ajax错误，那么显示相关错误信息;
                        if(data.statusText !== 'abort'){
                            var msg = 'status: '+data.status+'; statusText: '+data.statusText;

                            me._showmsg(3, msg, input, curform);
                            //me._showmsg(curform, msg, settings.tiptype, {obj:input, type:3, sweep:settings.tipSweep});
                            $input.addClass('Validform_error');
                        }

                        input.validform_valid = data.statusText;
                        $input.validform_ajax = null;

                        //localconfig.error返回true表示还需要执行temp_err;
                        return true;
                    }
                }

                if(ajaxsetup.success){
                    var temp_suc = ajaxsetup.success;
                    ajaxsetup.success = function(data){
                        localconfig.success(data);
                        temp_suc(data, input);
                    }
                }

                if(ajaxsetup.error){
                    var temp_err = ajaxsetup.error;
                    ajaxsetup.error = function(data){
                        //localconfig.error返回false表示不需要执行temp_err;
                        localconfig.error(data) && temp_err(data, input);
                    }
                }

                ajaxsetup = $.extend({}, localconfig, ajaxsetup, {dataType:'json'});
                input.validform_ajax = $.ajax(ajaxsetup);

                return 'ajax';
            }else if(ajaxurl && me._isEmpty(input, inputval)){
                me._abort(input);
                input.validform_valid = 'true';
            }

            if(!bool){
                me._showmsg(flag.type, flag.info, input, curform, 'bycheck');
                //me._showmsg(curform, flag.info, settings.tiptype, {obj:input, type:flag.type, sweep:settings.tipSweep}, 'bycheck');
                $input.removeClass('Validform_error');
            }
            errorobj = null;

            return true;

        },

        /**
         * flg===true时跳过验证直接提交;
         * ajaxPost==="ajaxPost"指示当前表单以ajax方式提交;
         */
        _submitForm:function(curform, flg, url, ajaxPost, sync){
            var me = this,
                $curform = $(curform),
                settings = curform.settings;

            //表单正在提交时点击提交按钮不做反应;
            if(curform.validform_status === 'posting'){return false;}

            //要求只能提交一次时;
            if(settings.postonce && curform.validform_status === 'posted'){return false;}

            var beforeCheck = settings.beforeCheck && settings.beforeCheck(curform);
            if(beforeCheck === false){return false;}

            var flag = true,
                inflag;

            $curform.find('[datatype]').each(function(){
                var curInput = this,
                    $curInput = $(curInput);

                //跳过验证;
                if(flg){
                    return false;
                }

                //隐藏或绑定dataIgnore的表单对象不做验证;
                if(settings.ignoreHidden && $curInput.is(':hidden') || $curInput.data('dataIgnore') === 'dataIgnore'){
                    return true;
                }

                var inputval = me._getValue($curInput, curform);
                errorobj = $curInput;

                inflag = me._regcheck(curform, $curInput.attr('datatype'), inputval, $curInput);

                if(!inflag.passed){
                    me._showmsg(inflag.type, inflag.info, curInput, curform);
                    //me._showmsg(curform, inflag.info, settings.tiptype, {obj:curInput, type:inflag.type, sweep:settings.tipSweep});
                    $curInput.addClass('Validform_error');

                    if(!settings.showAllError){
                        $curInput.focus().select();
                        flag = false;
                        return false;
                    }

                    flag && (flag = false);
                    return true;
                }

                //当ignore="ignore"时，为空值可以通过验证，这时不需要ajax检测;
                if($curInput.attr('ajaxurl') && !me._isEmpty(curInput, inputval)){
                    if(curInput.validform_valid !== 'true'){
                        me._showmsg(3, $curform.data('tipmsg').v||tipmsg.v, curInput, curform);
                        //me._showmsg(curform,$curform.data('tipmsg').v||tipmsg.v, settings.tiptype, {obj:curInput, type:3, sweep:settings.tipSweep});
                        $curInput.addClass('Validform_error');

                        $curInput.trigger('blur',['postform']);//continue the form post;

                        if(!settings.showAllError){
                            flag = false;
                            return false;
                        }

                        flag && (flag = false);
                        return true;
                    }
                }else if($curInput.attr('ajaxurl') && me._isEmpty(curInput, inputval)){
                    me._abort(curInput);
                    curInput.validform_valid = 'true';
                }

                me._showmsg(inflag.type, inflag.info, curInput, curform);
                //me._showmsg(curform, inflag.info, settings.tiptype, {obj:curInput, type:inflag.type, sweep:settings.tipSweep});
                $curInput.removeClass('Validform_error');
                errorobj = null;
            });

            if(settings.showAllError){
                $curform.find('.Validform_error:first').focus().select();
            }

            if(flag){
                var beforeSubmit = settings.beforeSubmit && settings.beforeSubmit(curform);
                if(beforeSubmit === false){return false;}

                curform.validform_status = 'posting';

                if(settings.ajaxPost || ajaxPost === 'ajaxPost'){
                    //获取配置参数;
                    var ajaxsetup = $.extend(true,{},settings.ajaxpost || {});
                    //有可能需要动态的改变提交地址，所以把action所指定的url层级设为最低;
                    ajaxsetup.url = url || ajaxsetup.url || settings.url || $curform.attr('action');

                    //byajax：ajax时，tiptye为1、2或3需要弹出提示框;
                    me._showmsg(1, $curform.data('tipmsg').p || tipmsg.p, curform, curform, 'byajax');
                    //me._showmsg(curform,$curform.data('tipmsg').p||tipmsg.p, settings.tiptype, {obj:curform, type:1, sweep:settings.tipSweep}, 'byajax');

                    //方法里的优先级要高;
                    //有undefined情况;
                    if(sync){
                        ajaxsetup.async = false;
                    }else if(sync === false){
                        ajaxsetup.async = true;
                    }

                    if(ajaxsetup.success){
                        var temp_suc = ajaxsetup.success;
                        ajaxsetup.success = function(data){
                            settings.callback && settings.callback(data);
                            curform.validform_ajax = null;
                            if($.trim(data.status) === 'y'){
                                curform.validform_status = 'posted';
                            }else{
                                curform.validform_status = 'normal';
                            }

                            temp_suc(data, curform);
                        }
                    }

                    if(ajaxsetup.error){
                        var temp_err = ajaxsetup.error;
                        ajaxsetup.error = function(data){
                            settings.callback && settings.callback(data);
                            curform.validform_status = 'normal';
                            curform.validform_ajax = null;

                            temp_err(data, curform);
                        }
                    }

                    var localconfig = {
                        type: 'POST',
                        async:true,
                        data: $curform.serializeArray(),
                        success: function(data){
                            var data = data || {};
                            if($.trim(data.status) === 'y'){
                                //成功提交;
                                curform.validform_status = 'posted';
                                me._showmsg(2, data.info, curform, curform, 'byajax');
                                //me._showmsg(curform, data.info, settings.tiptype, {obj:curform, type:2, sweep:settings.tipSweep}, 'byajax');
                            }else{
                                //提交出错;
                                curform[0].validform_status = 'normal';
                                me._showmsg(3, data.info, curform, curform, 'byajax');
                                //me._showmsg(curform, data.info, settings.tiptype, {obj:curform, type:3, sweep:settings.tipSweep}, 'byajax');
                            }

                            settings.callback && settings.callback(data);
                            curform[0].validform_ajax = null;
                        },
                        error: function(data){
                            var msg = 'status: '+data.status+'; statusText: '+data.statusText;

                            me._showmsg(3, msg, curform, curform, 'byajax');
                            //me._showmsg(curform, msg, settings.tiptype, {obj:curform, type:3, sweep:settings.tipSweep}, 'byajax');

                            settings.callback && settings.callback(data);
                            curform.validform_status = 'normal';
                            curform.validform_ajax = null;
                        }
                    }

                    ajaxsetup = $.extend({},localconfig, ajaxsetup, {dataType:'json'});

                    curform.validform_ajax = $.ajax(ajaxsetup);

                }else{
                    if(!settings.postonce){
                        curform.validform_status = 'normal';
                    }

                    var url = url || settings.url;
                    if(url){
                        $curform.attr('action',url);
                    }

                    return settings.callback && settings.callback(curform);
                }
            }

            return false;

        },

        _resetForm:function(form){
            var $forms = form ? $(form) : $(this.forms);
            $forms.each(function(){
                this.reset && this.reset();
                this.validform_status = 'normal';
            });

            $forms.find('.Validform_right').text('');
            $forms.find('.passwordStrength').children().removeClass('bgStrength');
            $forms.find('.Validform_checktip').removeClass('Validform_wrong Validform_right Validform_loading');
            $forms.find('.Validform_error').removeClass('Validform_error');
            $forms.find('[datatype]').removeData('cked').removeData('dataIgnore').each(function(){
                this.validform_lastval = null;
            });
            $forms.eq(0).find('input:first').focus();
        },

        _abort:function(curObj){
            if(curObj.validform_ajax){
                curObj.validform_ajax.abort();
            }
        },

        _setCenter: function(msgbox, time){
            var left = ($(window).width()-msgbox.outerWidth())/2,
                top = ($(window).height()-msgbox.outerHeight())/2;

                top = (document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop)+(top>0?top:0);

            msgbox.css({
                left:left
            }).animate({
                top : top
            },{ duration:time , queue:false });
        },

        _creatMsgbox: function(){
            var me = this;

            if($('#Validform_msg').length !== 0){return false;}
            msgobj = $('<div id="Validform_msg"><div class="Validform_title">'+tipmsg.tit+'<a class="Validform_close" href="javascript:void(0);">&chi;</a></div><div class="Validform_info"></div><div class="iframe"><iframe frameborder="0" scrolling="no" height="100%" width="100%"></iframe></div></div>').appendTo("body");//提示信息框;
            msgobj.find('a.Validform_close').click(function(){
                msgobj.hide();
                msghidden = true;
                if(errorobj){
                    errorobj.addClass('Validform_error').focus().select();
                }
                return false;
            }).focus(function(){this.blur();});

            $(window).bind('scroll resize',function(){
                !msghidden && me._setCenter(msgobj, 400);
            });
        }

    });

    /*
     * 扩展及改写提示文字的方法：
     * @example:
     * Validform.extend({
     *     defmsg: {r: "passed!"},
     *     errormsg: {"zh1-6":"请输入1到6个中文字符！"},
     *     datatype: {"zh1-6":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,6}$/}
     * });
     */
    Validform.extend = function(data){
        data.datatype && extend(DataType, data.datatype);
        data.errormsg && extend(tipmsg.w, data.errormsg);

        if(data.defmsg) {
            data.defmsg.w && delete data.defmsg.w;
            extend(tipmsg, data.defmsg);
        }
    }

    /*
     * datatype扩展方法;
     * @example:
     * Validform.extendDatatype({
     *     "zh1-6":/^[\u4E00-\u9FA5\uf900-\ufa2d]{1,6}$/
     * });
     */
    Validform.extendDatatype = function(datatype){
        extend(DataType, datatype);
    };

    /*
     * 错误提示文字扩展;
     * @example:
     * Validform.extendErrormsg({
     *     "zh1-6": "请输入1到6个中文字符！"
     * });
     */
    Validform.extendErrormsg = function(msg){
        extend(tipmsg.w, msg);
    };

    /*
     * 修改默认提示文字;
     * @example:
     * Validform.extendDefmsg({
     *     r: "passed!"
     * });
     */
    Validform.extendDefmsg = function(msg){
        msg.w && delete msg.w;
        extend(tipmsg, msg);
    };

    Validform.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            tiptype:1,
            tipSweep:false,
            showAllError:false,
            postonce:false,
            ajaxPost:false
        }
    });

    return Validform;
});