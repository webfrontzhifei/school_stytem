/**
 * Created by patrickliu on 14/11/12.
 * this is a lbf-plugin. Used for storage static js or css in localstorage
 * @create 14/11/12
 * @author patrickliu
 */

/**
 * if you want to use this tool
 * just add it in the preload
 * @example
 * LBF.config({
 *    preload: ['util.staticLocalStorage']
 * });
 *
 * Then everything is ok.
 * It will handle everything
 *
 */

LBF.define('util.staticLocalStorage', function(require, exports, module) {

    // for those didn't support localStorage.
    // we just ignore it
    // ie7 returns true in (window.localStorage) but doesn't support real localStorage
    // So we add slice in [] to exclude ie7
    if (!(window.localStorage) || !('slice' in [])) {
        return;
    }

    /**
     * @require util.localStorage
     * @require lang.JSON
     * @require lang.each
     */
    var uls = require('util.localStorage'),
        JSON = require('lang.JSON'),
        each = require('lang.each');

    /**
     * this is the namespace in localstorage
     * @final
     * @static
     * @type {string}
     */
    var NS = 'LBF_',
        NSVersion = 'LBF_VERSION_',

        REGEX_IS_LBF_NS_FILE = /^LBF_/,

    // a-sagasdrf341234d323gf.js will match
        META_VERSION_REGEXP_JS = /-([0-9a-zA-Z]*)\.js/,
        META_VERSION_REGEXP_CSS = /-([0-9a-zA-Z]*)\.css/,
        REGEX_GET_FUNCTION_MAIN_BODY = /^\s*?function[\s\S]*?\([\s\S]*?\)[\s\S]*?\{([\s\S]*)\}$/,
        PREFIX_FILE_NAME = /(.*?)-[0-9a-zA-Z]*\.(js|css)/,

        helper = {
            /**
             * check whether the url is stored in the localStorage
             * @method existsInLocal
             * @param url
             * @returns {boolean}
             */
            existsInLocal: function(url) {
                return !!uls.getItem(NS + url);
            },


            /**
             * get the stored url static file
             * @method getByUri
             * @param url
             * @returns {*}
             */
            getByUri: function(url) {
                return this.getItem(url);
            },


            /**
             * set the item of meta to the localstorage
             * @method setItem
             * @param index
             * @param meta
             */
            setItem: function(index, meta) {
                // first delete the old stored files
                var match = index.match(PREFIX_FILE_NAME);
                if(match.length >= 2) {
                    this.clearByPrefix(match[1]);
                }

                meta._factoryString = meta.factory.toString();
                uls.setItem(NS + index, JSON.stringify(meta));
            },


            /**
             * the the item in the index of localstorage
             * @method getItem
             * @param index
             * @returns {*}
             */
            getItem: function(index) {
                var meta = JSON.parse(uls.getItem(NS + index));
                meta.factory = new Function('require', 'exports', 'module', REGEX_GET_FUNCTION_MAIN_BODY.exec(meta._factoryString)[1]);
                return meta;
            },

            /**
             * remove the localstorage item
             * @method removeItem
             * @param index
             */
            removeItem: function(index) {
                uls.removeItem(NS + index);
            },

            /**
             * sometimes, if you want to clear all the LBF cache files
             * call this function
             * @method clearAll
             */
            clearAll: function() {
                for(var i = uls.length - 1; i >= 0; i--) {
                    var key = uls.key(i);
                    if(key.match(REGEX_IS_LBF_NS_FILE)) {
                        uls.removeItem(key);
                    }
                }
            },

            /**
             *
             * clear the localstorage by prefix of key
             * @method clearByPrefix
             * @param prefix
             */
            clearByPrefix: function(prefix) {
                for(var i = uls.length - 1; i >= 0; i--) {
                    var key = uls.key(i);
                    if(key.indexOf(NS + prefix) === 0) {
                        uls.removeItem(key);
                    }
                }
            }
        };


    /**
     * LBF listens to the define events
     * @event define
     * @param meta
     * the meta format
     * {
     *     id: id, // id of the listened module
     *     uri: the absolute uri of this module
     *     deps: the dependencies of this module
     *     factory: the callback of this module
     * }
     */
    LBF.on('define', function(meta) {
        // whenever we catch the define event,
        // we save the meta to the localstorage
        // if the uri is not the wanted format we want
        // http://xxxx.com/static...../a.r10212.js -> a.r1012.js is the wanted format
        if(META_VERSION_REGEXP_JS.test(meta.uri) || META_VERSION_REGEXP_CSS.test(meta.uri)) {
            try {
                var version = (meta.uri.match(META_VERSION_REGEXP_JS) || meta.uri.match(META_VERSION_REGEXP_CSS))[1];
                helper.setItem(meta.uri, meta);
                //uls.setItem(NSVersion + meta.uri, version);
            } catch(e) {
                // if an error occurs when setting the value
                // clear it
                helper.removeItem(meta.uri);
                //uls.removeItem(NSVersion + meta.uri);
            }
        }
    });

    /**
     * when the beforeload event is triggered, we deal with the uris to remove js that has been in the localstorage
     * @event beforeload
     * uris is an array
     * @example
     *     ['https://combo.b.qq.com/a.js', 'https://combo.b.qq.com/b.js']
     */
    LBF.on('beforeload', function(uris) {
        for(var i = uris.length - 1; i >= 0; i--) {
            if(helper.existsInLocal(uris[i])) {
                // if the uris exists in the localstorage
                // remove it from uris array
                // because we will load it from the localstorage
                uris.slice(i, 1);

                var Module = LBF.Module,
                    meta = helper.getByUri(uris[i]);

                // directly load from localstorage
                Module.save(uris[i], meta);
            }
        }
    });

    // expose this exports
    exports = module.exports = helper;
});

