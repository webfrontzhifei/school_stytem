/**
 * Created by sqchen on 12/2/14.
 */

// this is the test orgTree by sqchen
LBF.define('qidian.comp.testTree', function(require, exports, module) {
    var zTree = require('ui.widget.ZTree.ZTree'),
        $ = require('lib.jQuery'),
        _ = require('lib.underscore'),
        extend = require('lang.extend'),
        proxy = require('lang.proxy'),
        each = require('lang.each'),
        EventProxy = require('util.eventProxy'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        LightTip = require('qidian.comp.LightTip'),
        Controller = require('app.View'),
        template = require('util.template'),
        JSON = require('lang.JSON'),
        GUID = require('util.GUID'),
        isDebug = require('globalSettings').debug,
        isIE = require('lang.browser').msie,
        Main = require('qidian.conf.main');

    var LAZY_LOADED_MODULES = '_lazyLoadedMods';

    // template helpers
    template.helper('JSON', JSON);
    template.helper('Date', Date);
    template.helper('Math', Math);

    // set tmplCache to class, not instance. in case of repeatedly loading template files
    module.tmplCache = {};

    var JSONP_DEFAULT = {
        dataType: 'jsonp',
        jsonp: 'jsonpCallback'
    };

    var BigTree = module.exports = exports = Controller.extend({

        tagName: 'ul',

        className: 'ztree',

        // random a id for tree
        id: function() {
            return 'memberSelect' + (new Date().getTime());
        },

        // 树的初始化函数
        // tree settings
        initialize: function(opts) {
            // save ths opts
            var controller = this;

            var DEFAULT_OPTIONS = {
                cgi: {
                    getOrgTreeNodes: '/mng/org/getOrgTreeNodes',
                    getOrgAndUserTreeNodes: '/mng/org/getOrgAndUserTreeNodes',
                    getUserParentOrgIdList: '/mng/org/getUserParentOrgIdList'
                },

                //值为1时表示membersTotal值是递归总数
                recursive: 0,
                isAll: 1,
                show_dis: 0,
                show_del: 0,
                show_rec: 0,
                showOrgOnly: false,
                isHrtxCgiCrossDomain: false
            };

            var options = this.opts = extend(true, DEFAULT_OPTIONS, opts);

            // the default functions is workable but too long...
            var DEFAULT_FUNCTIONS = {
                // 树的设置
                setting: {
                    view: {
                        selectedMulti: false,
                        showLine: false,
                        showIcon: function(treeId, treeNode) {
                            return !treeNode.isParent;
                        },
                        // 为了实现hover是一整条的
                        addDiyDom: function(treeId, treeNode) {
                            var spaceWidth = 15,
                                switchObj = controller.find('#' + treeNode.tId + "_switch"),
                                icoObj = controller.find("#" + treeNode.tId + "_ico");

                            switchObj.remove();
                            icoObj.before(switchObj);

                            if(treeNode.level >= 1) {
                                var spaceStr = "<span id='" + treeNode.tId + "_ico_before' class='tree_ico_before' style='display:inline-block;width:" + (spaceWidth * treeNode.level)+ "px'></span>";
                                switchObj.before(spaceStr);
                            }
                            switchObj.parent().css('width', '100%');
                        },
                        // 为了实现hover是一整条的
                        addHoverDom: function(treeId, treeNode) {
                            var aObj = controller.find('#' + treeNode.tId + '_a'), linksStr = '',
                                _this = this,
                                _isParent = treeNode.isParent || treeNode.children;

                            aObj.find('.edit').hide();
                        },
                        // 为了实现hover是一整条的
                        removeHoverDom: function(treeId, treeNode) {
                            controller.find('#treeBtnCtrlRight_' + treeNode.id).unbind().remove();
                        }
                    },
                    data: {
                        parent: true,
                        leaf: true
                    },
                    async: extend({
                            enable: true,
                            url: proxy(function(treeId, treeNode) {
                                var that = this,
                                    opts = this.opts;

                                var appId = typeof opts.appId != 'undefined' ? opts.appId : '',
                                    companyId = typeof opts.companyId != 'undefined' ? opts.companyId : '',
                                    _url = (typeof opts.showOrgOnly != 'undefined' && opts.showOrgOnly) ? opts.cgi.getOrgTreeNodes : opts.cgi.getOrgAndUserTreeNodes;

                                return _url + '?' + 'id=' + treeNode.id + (that.recursive == 1 ? '&recursive=1' : '') + (appId != '' ? '&appId=' + appId : '') + (companyId != '' ? '&companyId=' + companyId : '');

                            }, controller),
                            type: 'GET',

                            dataFilter: proxy(function(treeId, parentNode, childNodes) {
                                var that = this,
                                    opts = this.opts;

                                return opts.transformIcon(childNodes.list);
                            }, controller)
                        },

                        controller.opts.isHrtxCgiCrossDomain ? (extend(JSONP_DEFAULT, _.pick(controller.opts, ['jsonp']))) : {}
                    ),
                    callback: {
                        onExpand: function(event, treeId, treeNode) {
                            controller.trigger('onExpand', [event, treeId, treeNode]);
                        },
                        onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
                            controller.trigger('onDrop', [event, treeId, treeNodes, targetNode, moveType]);
                        },
                        onClick: function(event, treeId, treeNode) {
                            controller.trigger('onClick', [event, treeId, treeNode]);
                        },
                        beforeAsync: function(treeId, treeNode) {
                            //如果该组织节点下的一级组织个数和直属成员数都为0,则不再拉取数据
                            if(treeNode.membersTotal + treeNode.orgsTotal <= 0) {
                                return false;
                            }
                        },
                        onAsyncError: function(event, treeId, treeNode) {

                            controller.trigger('onAsyncError', [treeId, treeNode]);
                        },
                        onAsyncSuccess: function(event, treeId, treeNode) {

                            controller.trigger('onAsyncSuccess', [treeId, treeNode]);
                        }
                    }
                },

                transformIcon: function(aData) {
                    var treeIcons = Main.treeIcons;

                    for(var i = 0, l = aData.length; i < l; i++) {
                        aData[i].icon = treeIcons[aData[i].icon];
                    }
                    return aData;
                }
            };

            options = this.opts = extend(true, DEFAULT_FUNCTIONS, options);

            // 创建此树
            this.create();
        },

        renderTasks: {},

        template: template,

        /**
         *
         * @method renderEngine
         * @param {Boolean} synchron {required} synchron can be render simultaneously, if synchron is set, renderEngine can response all requests.
         * @param {String} url {required} the url of the required template
         * @param {Object} data {required} the date should be place into the template
         * @param {Object} promise {optional} the promise is usually not passed by users, but if the users want to control the promise status, they can pass one.
         * @returns {promise}
         * @example
         *     renderEngine('/template/a/b', {a: 'a'})
         *           .done(function(html) {
         *               console.log(html);
         *           });
         *
         * // send many requests with the same url synchronized
         *     renderEngine(true, '/template/a/b', {a: 'a'})
         *           .done(function(html) {
         *               console.log(html);
         *           });
         */
        renderEngine: function(synchron, url, data, promise){

            // dealing params
            // if synchron is not boolean, the first passed param is url
            if(typeof synchron !== 'boolean') {
                promise = data;
                data = url;
                url = synchron;
            }

            logger.info('[controller][render engine] render ' + url);

            // delay render to improve performance
            var view = this,
                tmplCache = module.tmplCache,
                tasks = this.renderTasks,
                taskIndex = synchron === true ? GUID() : url,

                render = function(taskIndex, url, data, promise) {
                    if(tasks[taskIndex] && !(typeof synchron === 'boolean' && synchron)) {

                        // clear duplicate render to improve performance
                        // when task already exist
                        // override promise & data
                        tasks[taskIndex].promise = promise;
                        tasks[taskIndex].data = data;
                        return;
                    }

                    tasks[taskIndex] = {
                        task: Tasks.once(function() {
                            tasks[taskIndex].promise.resolve(tmplCache[url](tasks[taskIndex].data));
                            tasks[taskIndex] = null;

                        }).run(),

                        promise: promise,

                        data: data
                    };
                };

            promise = promise || new Promise;

            this.fetchTemplate(url)
                .done(function() {
                    render(taskIndex, url, data, promise);
                })
                .fail(function() {
                    logger.error('fetch template error ' + url);
                    promise.reject();
                });

            return promise.promise();

        },

        fetchTemplate: function(url){
            var view = this,
                tmplCache = module.tmplCache,
                promise = new Promise;

            // if this url template is in tmplCache
            // we directly return a deferred obj compatible with listeners listening to deferred obj
            if(tmplCache[url] && typeof tmplCache[url].done === 'undefined') {
                Tasks.once(function() {
                    promise.resolve();
                }, 0).run();

                return promise.promise();
            } else if(tmplCache[url] && typeof tmplCache[url].done === 'function') {
                // this kind of situation will happen when one fetchTemplate is called, then another fetchTemplate
                // is called immediately. The first one is just ajaxing with the server. So we return the first one as a deferred object
                return tmplCache[url];
            } else {
                // fill cache with promise
                // so render method can add done callbacks if template is not ready yet
                return (tmplCache[url] = REST
                    .ajax({
                        url: url,
                        cache: isIE ? false : true
                    })
                    .done(function(template){
                        logger.info('[controller][fetch template] template ' + url + ' ready');

                        // replace cache with real template
                        tmplCache[url] = view.template.compile(template, isDebug);
                    })
                    .fail(function() {
                        logger.error('[controller][fetch template] template ' + url + ' failed!');
                    }));
            }

        },

        /**
         * Lazy load module
         * Load module only when needed to, and avoid duplicate
         *  this.lazyload(
         *      {
         *          ns: 'module.to.be.loaded',
         *          options: {
         *              // fill options here
         *              // options will be straightly passs through to your initialization callback
         *          }
         *      },
         *
         *      function(module, options){
         *          // enjoy
         *      }
         *  });
         *
         * @method lazyLoad
         * @param {String} ns Namespace of the module to be loaded
         * @param {Function} constructor Constructor/initialization of module
         * @param {Object} [options={}] Options for initializing module
         * @param {Number|Boolean} [timeout=false] Time before aborting module loading
         * @param promise
         */
        lazyLoad: function(ns, constructor, options, timeout){
            options = options || {};
            timeout = timeout || false;

            var mods = this[LAZY_LOADED_MODULES] = this[LAZY_LOADED_MODULES] || {},
                promise = new Promise;

            mods[ns] ?
                Tasks.once(function(){
                    promise.resolve(mods[ns]);
                }, 0).run() :

                require.async(ns, function(Module){
                    // init module & callback with it
                    promise.resolve(mods[ns] = constructor(Module, options));
                });

            timeout && Tasks.once(function(){
                !promise.isResolved() && promise.reject();
            }, timeout).run();

            return promise.promise();
        },

        /**
         * 创建树函数
         */
        create: function() {
            var controller = this,
                opts = this.opts;

            this.getNodesRequest('0')
                .done(function(data) {
                    var initData = data.list;

                    // 是根组织
                    if (initData[0] && initData[0].isRoot == 1 && initData.length == 1) {
                        controller.getNodesRequest(initData[0].id)
                            .done(function (data) {
                                initData[0].children = opts.transformIcon(data.list);
                                initData[0].open = true;

                                // 根组织树获取完毕
                                // 进行初始化树
                                var tree = controller.tree = $.fn.zTree.init(controller.$el, opts.setting, initData);

                                //@fire onCreateSuccess
                                controller.trigger('onCreateSuccess', tree, initData);
                            })
                            .fail(function() {
                                logger.warn('[Tree][create] tree is not created successfully. ajax error.');

                                //@fire onCreateFailure
                                controller.trigger('onCreateFailure');
                            });

                    } else {
                        // 不是根组织
                        // 非根组织树拉取完毕
                        // 进行初始化树操作
                        initData = opts.transformIcon(initData);
                        var tree = controller.tree = $.fn.zTree.init(controller.$el, opts.setting, initData);

                        //@fire onCreateSuccess
                        controller.trigger('onCreateSuccess', tree, initData);
                    }
                })
                .fail(function() {
                    logger.warn('[Tree][create] tree is not created successfully. ajax error.');

                    //@fire onCreateFailure
                    controller.trigger('onCreateFailure');
                });

        },

        /**
         * 获取某组织节点下的直属成员和直属组织请求
         * @param {Number} nId 父组织id
         * @return {Object} promise
         * options = {
         *    cgi: {
         *        getOrgTreeNodes,
         *        getOrgAndUserTreeNodes,
         *    },
         *    isAll: '',
         *    show_dis: '',
         *    show_del: '',
         *    show_rec: '',
         *    recursive: '',
         *    appId: '',
         *    companyId: '',
         *    isHrtxCgiCrossDomain: '',
         *    jsonp: '' // jsonpCallback function name,
         *    treeIcons: function() {}
         * }
         */
        getNodesRequest: function(nId, options) {
            var controller = this,
                opts = options ? extend(true, this.opts, options) : this.opts;

            // passed params to the REST.read function
            var passedParams = ['isAll', 'show_dis', 'show_del', 'show_rec', 'recursive', 'appId', 'companyId', 'permission_id'];

            return REST.read(
                extend({
                    url: opts.showOrgOnly ? opts.cgi.getOrgTreeNodes: opts.cgi.getOrgAndUserTreeNodes,
                    data: extend({
                        // 如果nId没设，则填空
                        id: nId || ''
                    }, _.pick(opts, passedParams)
                )},
                opts.isHrtxCgiCrossDomain ? (extend(JSONP_DEFAULT, _.pick(opts, ['jsonp']))) : {}
            ))
                .done(function(res) {
                })
                .fail(function(e) {
                    LightTip.error(e.message || '请求出错，请重试');
                });
        },

        /**
         * 给点节点id， 自动展开至结点处
         * @method expandNodeAncestors
         * @param nId
         * @param options
         */
        expandNodeAncestors: function(nId, options) {
            var controller = this,
                promise = new Promise,
                opts = options ? extend(true, this.opts, options) : this.opts,
                requestParam = ['appId', 'companyId'];

            // 展开成员必须拉取该节点的祖先链
            REST.create(
                extend({
                    url: opts.cgi.getUserParentOrgIdList,
                    cache: false,
                    data: extend({
                        id: nId
                    }, _.pick(opts, requestParam))
                },
                opts.isHrtxCgiCrossDomain ? (extend(JSONP_DEFAULT, _.pick(opts, ['jsonp']))) : {}
            ))
                .done(function(data) {
                    //lists保存的是该成员的所有组织链id
                    var lists = data.list,
                        //names保存的是该成员的所有组织链名称
                        names = data.name,
                        // 获取tree的引用
                        tree = controller.tree;

                    // 返回错误
                    if(!lists[0] || !lists[0].length) {
                        promise.reject({
                            errCode: 'onExpandNodeAncestorError'
                        });

                        return;
                    }

                    var tmpObj = controller.listSplice(lists, names, tree);
                    lists = tmpObj['lists'];
                    names = tmpObj['names'];

                    //该成员只有一条组织链，即只属于一个组织
                    if(lists.length == 1) {
                        controller.expandOrgChain(nId, lists[0])
                            .done(function() {
                                promise.resolve.apply(promise, [].slice.apply(arguments));
                            })
                            .fail(function() {
                                promise.reject.apply(promise, [].slice.apply(arguments));
                            });

                    } else {
                        // 有多条组织链，让用户进行操作
                        promise.resolve({
                            errCode: 'onExpandMultiOrgsMember',
                            data: [tree, lists, names]
                        });
                    }
                })
                .fail(function(e) {
                    LightTip.error(e.message || '请求出错，请重试');
                });

            return promise.promise();
        },

        /**
         * 后台传过来的都是用户直接到根结点的组织链
         * 对于非全量树（即根结点不是公司根结点）的情况，需要对lists和names进行处理
         * @method listSplice
         * @param lists
         * @param names
         * @param tree
         * @returns {{lists: *, names: *}}
         */
        listSplice: function (lists, names, tree) {
            //在非全量树的情况,即无根节点情况下,需要把前边不存在的节点剔除
            each(lists, function (index, item) {
                if (tree.getNodes()[0].id != 1) {
                    while (item.length) {
                        if (!tree.getNodeByParam('id', item[0])) {
                            item.splice(0, 1);
                            //同时对name进行处理, name保存的是id对应的组织名
                            if(names[index]) {
                                names[index].splice(0, 1);
                            }
                        } else {
                            break;
                        }
                    }
                }
            });

            return {
                lists: lists,
                names: names
            };
        },

        /**
         * 根据组织链来展开结点
         * @param nId : userMember
         * @param list: userOrgList
         * @example list = [1, 123123, 123123123]
         */
        expandOrgChain: function (nId, list) {

            var controller = this,
                tree = controller.tree,
                promise = new Promise,
                needExpandIndex = 0,
                curNode;

            //查找树上是否已经存在最末级节点，或者是属于在非全量树的情况（该情况下父组织链上第一个肯定不是根节点1）。符合条件则开始异步去展开各级别组织
            if (!tree.getNodeByParam('id', list[list.length - 1]) || (tree.getNodes()[0].isRoot != 1 && tree.getNodeByParam('id', list[list.length - 1]) && !tree.getNodeByParam('id', list[list.length - 1]).zAsync)) {

                // 可能已有部分结点展开过，所以从根往下查找，从哪一级开始没有被展开过
                // needExpandIndex记录了需要展开的层级
                for (var i = 0, l = list.length; i < l; i++) {
                    if (!tree.getNodeByParam('id', list[i])) {
                        needExpandIndex = i;
                        break;
                    }
                }
                // 将list的前面已被展开过的节点删除掉
                list.splice(0, needExpandIndex - 1);

                Tasks.once(function() {
                    // 从list[0]开始展开
                    (function (index, treeId, treeNode) {
                        var _that = arguments.callee;

                        // 如果index >= list.length
                        if (index >= list.length) {
                            // 全部展开完成
                            // 获取nId对应的treeNode
                            promise.resolve({
                                tree: tree,
                                nId: nId,
                                treeNode: tree.getNodeByParam('id', nId)
                            });
                            return;
                        }

                        // 监听tree的onAsyncSuccess
                        controller.once('onAsyncSuccess', function (e, treeId, treeNode) {
                            _that(++index, treeId, treeNode);
                        });

                        controller.once('onAsyncError', function() {
                            promise.reject({
                                errCode: 'error'
                            });
                        });

                        tree.expandNode(tree.getNodeByParam('id', list[index]), true);
                    })(0);
                }).run();

            } else {
                //树上已经存在最末级节点，则优先展开当前搜索的成员节点，没有找到则取组织链最末级节点
                curNode = tree.getNodeByParam('id', nId) || tree.getNodeByParam('id', list[list.length - 1]);

                //如果该节点是组织并且还没展开过
                if (curNode.isParent && !curNode.zAsync) {
                    for (var i = 0, l = list.length; i < l; i++) {
                        if (list[i] == curNode.id) {
                            needExpandIndex = i;
                            break;
                        }
                    }
                    list.splice(0, needExpandIndex - 1);

                    controller.once('onAsyncSuccess', function (e, treeId, treeNode) {
                        promise.resolve({
                            tree: tree,
                            nId: nId,
                            treeNode: tree.getNodeByParam('id', nId)
                        });
                    });

                    controller.once('onAsyncError', function() {
                        promise.reject({
                            errCode: 'error',
                            data: [tree, nId]
                        });
                    });

                    // 展开此节点
                    tree.expandNode(curNode, true);
                } else {
                    Tasks.once(function() {
                        promise.resolve({
                            tree: tree,
                            nId: nId,
                            treeNode: curNode
                        });
                    }).run();
                }
            }
            return promise.promise();
        },

        /**
         * 展开第一层
         * @method expandFirst
         */
        expandFirst: function() {
            var controller = this,
                tree = controller.tree;

            tree.expandNode(tree.getNodes()[0], true);
        },

        render: function() {
            var controller = this;
            return this.$el;
        }
    });
});
