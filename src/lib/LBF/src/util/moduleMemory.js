LBF.define('util.moduleMemory', function(require, exports, module){
    var Tasks = require('util.Tasks'),
        REST = require('qidian.comp.REST'),
		template = require('util.template'),
		Promise = require('util.Promise'),
        GUID = require('util.GUID');
		
	var LAZY_LOADED_MODULES = '_lazyLoadedMods';
		
	// set tplCache to class, not instance. in case of repeatedly loading template files
    module.tplCache = {};
	
	module.exports = {
		renderTasks: {},
		
		/**
         *
         * @method renderTpl
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
        renderTpl: function(synchron, url, data, promise){

            // dealing params
            // if synchron is not boolean, the first passed param is url
            if(typeof synchron !== 'boolean') {
                promise = data;
                data = url;
                url = synchron;
            }

            // delay render to improve performance
            var view = this,
                tplCache = module.tplCache,
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
                            tasks[taskIndex].promise.resolve(tplCache[url](tasks[taskIndex].data));
                            tasks[taskIndex] = null;

                        }).run(),

                        promise: promise,

                        data: data
                    };
                };

            promise = promise || new Promise;

            this.fetchTpl(url)
                .done(function() {
                    render(taskIndex, url, data, promise);
                })
                .fail(function() {
                    promise.reject();
                });

            return promise.promise();

        },

        fetchTpl: function(url){
            var view = this,
                tplCache = module.tplCache,
                promise = new Promise;

            // if this url template is in tplCache
            // we directly return a deferred obj compatible with listeners listening to deferred obj
            if(tplCache[url] && typeof tplCache[url].done === 'undefined') {
                Tasks.once(function() {
                    promise.resolve();
                }, 0).run();

                return promise.promise();
            } else if(tplCache[url] && typeof tplCache[url].done === 'function') {
                // this kind of situation will happen when one fetchTpl is called, then another fetchTpl
                // is called immediately. The first one is just ajaxing with the server. So we return the first one as a deferred object
                return tplCache[url];
            } else {
                // fill cache with promise
                // so render method can add done callbacks if template is not ready yet
                return (tplCache[url] = REST
                    .read({
                        url: url,
                        cache: true,
						dataType: 'html'
                    })
                    .done(function(tpl){
                        // replace cache with real template
                        tplCache[url] = template.compile(tpl);
                    }));
            }

        },
        
        template: template,

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
	};
});