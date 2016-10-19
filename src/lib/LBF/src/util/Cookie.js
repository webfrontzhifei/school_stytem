/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-8-27 下午8:26
 */
LBF.define('util.Cookie', function(){
    var doc = document;

    /**
     * Cookie utilities
     * @class Cookie
     * @namespace util
     * @module util
     */
    return {
        /**
         * Set a cookie item
         * @method set
         * @static
         * @param {String} name Cookie name
         * @param {*} value Cookie value
         * @param {String} [domain=fullDomain] The domain cookie store in
         * @param {String} [path=currentPath] The path cookie store in
         * @param {Date} [expires=sessionTime] The expire time of cookie
         * @chainable
         */
        set: function(name, value, domain, path, expires){
            if(expires){
                expires = new Date(+new Date() + expires);
            }

            var tempcookie = name + '=' + escape(value) +
                ((expires) ? '; expires=' + expires.toGMTString() : '') +
                ((path) ? '; path=' + path : '') +
                ((domain) ? '; domain=' + domain : '');

            //Ensure the cookie's size is under the limitation
            if(tempcookie.length < 4096) {
                doc.cookie = tempcookie;
            }

            return this;
        },

        /**
         * Get value of a cookie item
         * @method get
         * @static
         * @param {String} name Cookie name
         * @return {String|Null}
         */
        get: function(name){
            var carr = doc.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (carr != null){
                return unescape(carr[2]);
            }

            return null;
        },

        /**
         * Delete a cookie item
         * @method del
         * @static
         * @param {String} name Cookie name
         * @param {String} [domain=fullDomain] The domain cookie store in
         * @param {String} [path=currentPath] The path cookie store in
         * @chainable
         */
        del: function(name, domain, path){
            if (this.get(name)){
                doc.cookie = name + '=' +
                    ((path) ? '; path=' + path : '') +
                    ((domain) ? '; domain=' + domain : '') +
                    ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
            }

            return this;
        },

        /**
         * Find certain string in cookie with regexp
         * @method find
         * @static
         * @param {RegExp} pattern
         * @return {Array|Null} RegExp matches
         * @example
         *      // assume cookie is like below
         *      // ts_uid=5458535332; ptui_loginuin=mice530@qq.com; Hm_lvt_bb8beb2d26e5d753995874b8b827291d=1367826377,1369234241;
         *      Cookie.find(/ptui_loginuin=([\S]*);/); // returns ["ptui_loginuin=mice530@qq.com;", "mice530@qq.com"]
         */
        find: function(pattern){
            return doc.cookie.match(pattern);
        }
    };
});