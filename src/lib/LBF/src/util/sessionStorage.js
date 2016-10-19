/**
 * Created with JetBrains WebStorm.
 * User: honsytshen
 * Date: 13-9-9
 * Time: 下午7:45
 * To change this template use File | Settings | File Templates.
 */
LBF.define('util.sessionStorage', function(require) {
    var localStorage = require('util.localStorage'),
        cookie = require('util.Cookie'),
        domain = require('util.domain');

    //variable to check whether the session is alive
    var SESSION_STORAGE_PRE = 'IESESSION';

    /**
     * get the domain aliveStatus
     * @return {Boolean}
     */
    var getAliveStatus = function() {
            return !!cookie.get(SESSION_STORAGE_PRE);
        },

        /**
         * set the domain aliveStatus
         * @param {String} value
         */
        setAliveStatus = function(value) {
            cookie.set(SESSION_STORAGE_PRE, value, null, '/');
        },

        /**
         * When this domain was dead, we clear all item in localStorage
         * which is under this domain
         */
        clear = function() {
            var pattern = new RegExp('^' + SESSION_STORAGE_PRE + '[\\S]+$'),
                queue = [],
                i = 0,
                length = localStorage.length;

            for(; i < length; i++) {
                if(localStorage.key(i).match(pattern)) {
                    queue.push(localStorage.key(i));
                }
            }

            for(i=0, length=queue.length; i<length; i++){
                localStorage.removeItem(queue[i]);
            }
        };

    if(!getAliveStatus()) {
        // set status to alive
        setAliveStatus('alive');

        // clear expired session data
        clear();
    }

    return {
        /**
         * @method setItem
         * Set a key-value item in localStorage
         * @param {String} key
         * @param {String} value
         */
        setItem: function(key, value){
            localStorage.setItem(SESSION_STORAGE_PRE + key, value);
        },

        /**
         * @method getItem
         * get a key-value item in localStorage which is in this domain
         * @param {String} key
         * @return {String}
         */
        getItem: function(key){
            return localStorage.getItem(SESSION_STORAGE_PRE + key);
        },

        /**
         * @method removeItem
         * remove a key-value item in localStorage which is in this domain
         * @param {String} key
         */
        removeItem: function(key){
            localStorage.removeItem(SESSION_STORAGE_PRE + key);
        },

        clear: clear
    }
});
