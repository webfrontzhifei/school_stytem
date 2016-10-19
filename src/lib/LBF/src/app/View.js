/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-2-28 上午11:31
 */
LBF.define('app.View', function(require){
    var extend = require('lang.extend'),
        jQuery = require('lib.jQuery'),
        Backbone = require('lib.Backbone'),
        _ = require('lib.underscore'),
        template = require('util.template');

    var methods = {},
        fn = jQuery.fn;
    for(var methodName in fn){
        if(fn.hasOwnProperty(methodName)){
            (function(methodName){
                methods[methodName] = function(){
                    var result = this.$el[methodName].apply(this.$el, arguments);
                    return this.$el === result ? this : result;
                }
            })(methodName);
        }
    }
    delete methods.constructor;

    // add loaded module to tempalte helpers
    template.helper('_', _);    

    /**
     * View management. Besides methods of Backbone.View, all jQuery methods are ready to use.
     * @class View
     * @namespace app
     * @module app
     * @extends lib.Backbone.View
     * @constructor
     * @uses lib.Backbone.View
     * @uses lib.jQuery
     * @uses util.template
     * @example
     *      var SomeView = View.extend({
     *          tagName: 'ul', // set the outer wrap tagName
     *
     *          // delegate child-node event to view wrap
     *          events: {
     *              'click .someElement': 'clickHandler'
     *          },
     *
     *          initialize: function(opts){
     *              // initialization things
     *              // argument opts is passed in when instantiation, like new View(opts)
     *          },
     *
     *          // sample render function
     *          render: function(){
     *              // use template engine
     *              this.template('SomeTemplateStr', {
     *                  // render data
     *              });
     *
     *              // bind UI event
     *          },
     *
     *          clickHandler: function(){
     *              // handler click event on .someElement
     *          }
     *      });
     *
     *      var view = new SomeView({
     *          // will be linked to view.model automatically
     *          // this also works out for collection
     *          model: someModel,
     *
     *          // addition options are acceptable
     *          // initialize function will get this object
     *          someAdditionalOptions: someOptionObject
     *      });
     *
     *      // View has mix in all jQuery APIs
     *      // all APIs are chainable
     *      view
     *          .html(someHTMLStringOrJQueryObject)
     *          .click(function(){
     *              alert('click');
     *          });
     */
    return Backbone.View.extend(extend(methods, {
        /**
         * Find element inside view
         * @method $
         * @deprecated Use 'find' instead
         */

        /**
         * Import lib.jQuery as this.jQuery
         * @method jQuery
         * @see lib.jQuery
         */
        jQuery: jQuery,

        /**
         * Import util.template as this.template
         * @method template
         * @see util.template
         */
        template: template
    }));
});