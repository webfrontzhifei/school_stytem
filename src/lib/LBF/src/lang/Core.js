/**
 * @fileOverview
 * @author seanxphuang
 * Created: 2016-01-11
 */
LBF.define('lang.Core', function(require, exports, module){
    var extend = require('lang.extend');

    module.exports = inherit.call(Function, {
        initialize: function(){},

		_initialize: function(){
			this.initialize.apply(this, arguments);
			return this;
		}
    });
    
    function toArray(arrayLike){
        return [].slice.call(arrayLike);
    }
	
	function include(){
        var args = toArray(arguments);
        args.unshift(this);
        extend.apply(this, args);
        return this;
    }

    function inherit(){
        // prepare extends
        var args = toArray(arguments);

        // constructor
        var Class = function(){
            // real constructor
            return this._initialize.apply(this, arguments);
        };

        // copy Base.prototype
        var Base = function(){};
        Base.prototype = this.prototype;
        var proto = new Base();

        // correct constructor pointer
        /**
         * Instance's constructor, which initialized the instance
         * @property constructor
         */
        proto.constructor = Class;

        /**
         * Superclass of the instance
         * @property superclass
         */
        proto.superclass = this;

        // extends prototype
        args.unshift(proto);
        extend.apply(args, args);
        Class.prototype = proto;

        // add static methods
        extend(Class, {
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
});