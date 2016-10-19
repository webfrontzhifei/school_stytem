/**
 * Simple MVC with Backbone
 * @main app
 * @module app
 * @since 0.3
 */
LBF.define('app.Collection', function(require){
    var isFunction = require('lang.isFunction'),
        JSON = require('lang.JSON'),
        REST = require('app.REST'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks'),
        Backbone = require('lib.Backbone'),
        _ = require('lib.underscore'),
        sync = require('app.RESTSync')( REST );

    /**
     * Model collection. For easy and fast management of models.
     * @class Collection
     * @namespace app
     * @constructor
     * @extends lib.Backbone.Collection
     * @see http://backbonejs.org/#Model
     * @example
     *      var SomeCollection = Collection.extend({
     *          model: SomeModel, // assign a model class to manage
     *
     *          url: 'CGI_URL', // CGI URL for sync data, use model's URL when leave it blank
     *
     *          initialize: function(){
     *              // initialization things
     *          }
     *      });
     *
     *      (new SomeCollection()).fetch(); // fetch on initialization
     *
     * @example
     *      // initialize with client-side data is also acceptable
     *      // data format should be an array of objects
     *      new SomeCollection([
     *          {
     *              id: 1,
     *              attr: 'data1'
     *          },
     *          {
     *              id: 1,
     *              attr: 'data1'
     *          }
     *      ]);
     */
    return Backbone.Collection.extend({
        REST: REST,

        /**
         * Sync with server. Wrap Backbone.Collection.sync and add _handlerServiceError
         * @method sync
         * @chainable
         * @param {String} method Sync method type
         * @param {app.Collection} collection Instance to sync
         * @param {Object} options Sync options
         * @return {app.Collection}
         * @see Backbone.Collection.sync
         */
        sync: function(method, collection, options){
            options = options || {};
            return sync.call(this, method, collection, options);
        },

        /**
         * Ajax. Wrap Backbone.Collection.Ajax
         * @method ajax
         * @chainable
         * @param {Object} options Sync options
         * @return {jqXHR}
         * @see Backbone.Collection.ajax
         */
        ajax: REST.ajax
    });
});
