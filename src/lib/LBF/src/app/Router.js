/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-2-20 下午2:31
 */
LBF.define('app.Router', function(require){
    var Backbone = require('lib.Backbone');

    /**
     * Router on hash management
     * @class Router
     * @namespace app
     * @module app
     * @extends lib.Backbone.Router
     * @constructor
     * @see http://backbonejs.org/#Router
     * @example
     *      var SomeRouter = Router.extend({
     *          routes: {
     *              'help': 'help', // #help
     *              'search/:query': 'search', // #search/kiwis
     *              'search/:query/p:page': 'search', // #search/kiwis/p7
     *          },
     *
     *          initialize: function(){
     *              this.startHistory(); // manually start history on initialization, otherwise router won't work
     *          },
     *
     *          help: function(){
     *              // do help things
     *          },
     *
     *          search: function(query, page){
     *              // in #search/kiwis case
     *              // match route search/:query
     *              query === 'kiwis';
     *              typeof page === 'undefined';
     *
     *              // in #search/kiwis/p7 case
     *              // match route search/:query/p:page
     *              query === 'kiwis';
     *              page === '7'; // pay attention to page's string type
     *          }
     *      });
     *
     *      var router = new SomeRouter;
     *
     *      // manually navigate to another address
     *      // navigate runs silently on default
     *      // only set trigger to true can invoke route handler
     *      router.navigate('help', { trigger: true });
     *
     *      // add route whenever you need it
     *      // besides simple string route, regexp route is also acceptable
     *      // for example, we want to match route like blah/blah/blah/open
     *      // pass whole string to handler
     *      router.open = function(routeStr){
     *          // do open things
     *      };
     *
     *      router.route(/^(.*?)\/open$/, 'open');
     */
    return Backbone.Router.extend({
        /** @lends app.Router.prototype */

        /**
         * Fast touch of starting history record. Router has hard dependencies on history. Start history before any router works
         * @method startHistory
         * @return {app.Router}
         */
        startHistory: function(){
            Backbone.history.start.apply(Backbone.history, arguments);
            return this;
        }
    });
});