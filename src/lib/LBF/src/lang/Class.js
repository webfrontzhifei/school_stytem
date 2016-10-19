/**
 * Created by amos on 14-8-18.
 */
LBF.define('lang.Class', function(require, exports, module){
    var toArray = require('lang.toArray'),
        extend = require('lang.extend');

    /**
     * Base Class
     * @class Class
     * @namespace lang
     * @module lang
     * @constructor
     * @example
     *      // SubClass extends Class
     *      var SubClass = Class.extend({
     *          // overwritten constructor
     *          initialize: function(){
     *
     *          },
     *
     *          someMethod: function(){
     *          }
     *      });
     *
     *      // add static methods and attributes
     *      SubClass.include({
     *          staticMethod: function(){
     *          },
     *
     *          staticAttr: 'attrValue'
     *      });
     *
     *      // Extension is always available for sub class
     *      var SubSubClass = SubClass.extend({
     *          // methods to be extended
     *      });
     */
    module.exports = inherit.call(Function, {
        initialize: function(){},

        /**
         * Mix in methods and attributes. Instead of inherit from base class, mix provides a lighter way to extend object.
         * @method mixin
         * @since 0.5.2
         * @param {Object} [mixin]* The object to be mixed in
         * @chainable
         * @example
         *      var someInstance = new Class;
         *
         *      someInstance.mix({
         *          sayHello: function(){
         *              alert('hello');
         *          }
         *      });
         */
        mixin: include
    });

    function inherit(ext){
        // prepare extends
        var args = toArray(arguments);

        // constructor
        var Class = function(){
            // real constructor
            this.initialize.apply(this, arguments);
        };

        // copy Base.prototype
        var Base = function(){};
        Base.prototype = this.prototype;
        var proto = new Base();

        // correct constructor pointer
        /**
         * Instance's constructor, which initialized the instance
         * @property constructor
         * @for lang.Class
         * @type {lang.Class}
         */
        proto.constructor = Class;

        /**
         * Superclass of the instance
         * @property superclass
         * @type {lang.Class}
         */
        proto.superclass = this;

        // extends prototype
        args.unshift(proto);
        extend.apply(args, args);
        Class.prototype = proto;

        // add static methods
        extend(Class, {
            /**
             * Extend a sub Class
             * @method inherit
             * @static
             * @for lang.Class
             * @param {Object} [ext]* Prototype extension. Multiple exts are allow here.
             * @chainable
             * @example
             *     var SubClass = Class.extend(ext1);
             *
             * @example
             *      // multiple extensions are acceptable
             *      var SubClass = Class.extend(ext1, ext2, ...);
             */
            inherit: inherit,

            /**
             * Extend static attributes
             * @method include
             * @static
             * @for lang.Class
             * @param {Object} [included]* Static attributes to be extended
             * @chainable
             * @example
             *     Class.include(include1);
             *
             * @example
             *     // multiple includes are acceptable
             *     Class.include(include1, include2, ...);
             */
            include: include,

            /**
             * Inherit base class and add/overwritten some new methods or properties.
             * This is a deprecated method for it's easily misunderstood. It's just for backward compatible use and will be removed in the near future.
             * We recommend inherit for a replacement
             * @method extend
             * @static
             * @for lang.Class
             * @deprecated
             * @see inherit
             */
            extend: inherit,

            /**
             * Superclass the Class inherited from
             * @property superclass
             * @type {lang.Class}
             * @for lang.Class
             */
            superclass: this
        });

        return Class;
    };

    function include(included){
        var args = toArray(arguments);
        args.unshift(this);
        extend.apply(this, args);
        return this;
    }
});