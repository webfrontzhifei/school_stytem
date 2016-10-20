/**
 * Created by amos on 14-4-19.
 */
LBF.define('qidian.comp.Controller', function(require, exports, module){
    var Controller = require('app.View'),
        Tasks = require('util.Tasks'),
        REST = require('qidian.comp.REST'),
        logger = require('qidian.comp.logger'),
        template = require('util.template'),
        JSON = require('lang.JSON'),
        each = require('lang.each'),
        Promise = require('util.Promise'),
        GUID = require('util.GUID'),
        isDebug = require('globalSettings').debug,
        isIE = require('lang.browser').msie;

    var LAZY_LOADED_MODULES = '_lazyLoadedMods';

    // template helpers
    template.helper('JSON', JSON);
    template.helper('Date', Date);
    template.helper('Math', Math);

    // set tmplCache to class, not instance. in case of repeatedly loading template files
    module.tmplCache = {};

    module.exports = Controller.extend({
        
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
        }
    });
});
