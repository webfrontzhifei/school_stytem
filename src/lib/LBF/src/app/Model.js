/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-2-27 下午2:57
 */
LBF.define('app.Model', function(require){
    var isFunction = require('lang.isFunction'),
        JSON = require('lang.JSON'),
        REST = require('app.REST'),
        Promise = require('util.Promise'),
        Tasks = require('util.Tasks'),
        Backbone = require('lib.Backbone'),
        _ = require('lib.underscore'),
        sync = require('app.RESTSync')( REST );

    /**
     * Model for data management
     * @class Model
     * @namespace app
     * @module app
     * @extends lib.Backbone.Model
     * @constructor
     * @see http://backbonejs.org/#Model
     * @example
     *      var SomeModel = Model.extend({
     *          // model's default values
     *          defaults: {
     *              attr1: 'defaultAttrValue1',
     *              attr2: 'defaultAttrValue2'
     *          },
     *
     *          url: 'CGI_URL', // CGI URL for sync data
     *
     *          initialize: function(){
     *              // initialization things
     *          }
     *      });
     *
     *      (new SomeModel()).fetch(); // fetch on initialization
     *
     * @example
     *      // initialize with client-side data is also acceptable
     *      // data format should be an array of objects
     *      new SomeModel([
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
    return Backbone.Model.extend({
        REST: REST,

        /**
         * Sync with server. Wrap Backbone.Model.sync and add _handlerServiceError
         * @method sync
         * @param {String} method Sync method type
         * @param {app.Model} model Instance to sync
         * @param {Object} options Sync options
         * @return {app.Model}
         * @see Backbone.Model.sync
         */
        sync: function(method, model, options){
            options = options || {};

            return sync.call(this, method, model, options);
        },

        /**
         * Ajax. Wrap Backbone.Model.Ajax
         * @method ajax
         * @param {Object} options Sync options
         * @return {jqXHR}
         * @see Backbone.Model.ajax
         */
        ajax: REST.ajax
    });
});
