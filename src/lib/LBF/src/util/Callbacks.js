/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.Callbacks', function(require, exports, module){
    var Class = require('lang.Class'),
        forEach = require('lang.forEach'),
        extend = require('lang.extend'),
        isFunction = require('lang.isFunction'),
        isString = require('lang.isString'),
        inArray = require('lang.inArray');


    var REG_NOT_WHITE = /\S+/g;

    // String to Object options format cache
    var optionsCache = {};

    // Convert String-formatted options into Object-formatted ones and store in cache
    var createOptions = function(options){
        var object = optionsCache[options] = {};
        forEach( options.match(REG_NOT_WHITE) || [], function( flag ) {
            object[ flag ] = true;
        });
        return object;
    };

    /**
     * Create a callback list (written in actory mode)
     * By default a callback list will act like an event callback list and can be
     * 'fired' multiple times.
     * Borrowed from jQuery.Callbacks
     * @class Callbacks
     * @namespace util
     * @constructor
     * @param {String|Object} options An optional list of space-separated options that will change how the callback list behaves or a more traditional option object
     * @param {Boolean} once Will ensure the callback list can only be fired once (like a Deferred)
     * @param {Boolean} memory Will keep track of previous values and will call any callback added after the list has been fired right away with the latest 'memorized' values (like a Deferred)
     * @param {Boolean} unique Will ensure a callback can only be added once (no duplicate in the list)
     * @param {Boolean} stopOnFalse Interrupt callings when a callback returns false
     * @example
     *  var list = Callbacks('once memory');
     */
    module.exports = function(options){
        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === 'string' ?
            ( optionsCache[ options ] || createOptions( options ) ) :
            extend( {}, options );

        var // Flag to know if list is currently firing
            firing,
        // Last fire value (for non-forgettable lists)
            memory,
        // Flag to know if list was already fired
            fired,
        // End of the loop when firing
            firingLength,
        // Index of currently firing callback (modified by remove if needed)
            firingIndex,
        // First callback to fire (used internally by add and fireWith)
            firingStart,
        // Actual callback list
            list = [],
        // Stack of fire calls for repeatable lists
            stack = !options.once && [],
        // Fire callbacks
            fire = function( data ) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for ( ; list && firingIndex < firingLength; firingIndex++ ) {
                    if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if ( list ) {
                    if ( stack ) {
                        if ( stack.length ) {
                            fire( stack.shift() );
                        }
                    } else if ( memory ) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
        // Actual Callbacks object
            self = {
                /**
                 * Add a callback or a collection of callbacks to the list
                 * @method add
                 * @return {util.Callbacks}
                 */
                add: function() {
                    if ( list ) {
                        // First, we save the current length
                        var start = list.length;
                        (function add( args ) {
                            forEach( args, function( arg ) {
                                if ( isFunction( arg ) ) {
                                    if ( !options.unique || !self.has( arg ) ) {
                                        list.push( arg );
                                    }
                                } else if ( arg && arg.length && isString( arg ) ) {
                                    // Inspect recursively
                                    add( arg );
                                }
                            });
                        })( arguments );
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if ( firing ) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if ( memory ) {
                            firingStart = start;
                            fire( memory );
                        }
                    }
                    return this;
                },

                /**
                 * Remove a callback from the list
                 * @method remove
                 * @return {util.Callbacks}
                 */
                remove: function() {
                    if ( list ) {
                        forEach( arguments, function( arg ) {
                            var index;
                            while( ( index = inArray( arg, list, index ) ) > -1 ) {
                                list.splice( index, 1 );
                                // Handle firing indexes
                                if ( firing ) {
                                    if ( index <= firingLength ) {
                                        firingLength--;
                                    }
                                    if ( index <= firingIndex ) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },

                /**
                 * Check if a given callback is in the list.
                 * If no argument is given, return whether or not list has callbacks attached.
                 * @method has
                 * @return {util.Callbacks}
                 */
                has: function( fn ) {
                    return fn ? inArray( fn, list ) > -1 : !!( list && list.length );
                },

                /**
                 * Remove all callbacks from the list
                 * @method empty
                 * @return {util.Callbacks}
                 */
                empty: function() {
                    list = [];
                    firingLength = 0;
                    return this;
                },

                /**
                 * Have the list do nothing anymore
                 * @method disable
                 * @return {util.Callbacks}
                 */
                disable: function() {
                    list = stack = memory = undefined;
                    return this;
                },

                /**
                 * Is it disabled?
                 * @method disabled
                 * @return {util.Callbacks}
                 */
                disabled: function() {
                    return !list;
                },

                /**
                 * Lock the list in its current state
                 * @method lock
                 * @return {util.Callbacks}
                 */
                lock: function() {
                    stack = undefined;
                    if ( !memory ) {
                        self.disable();
                    }
                    return this;
                },

                /**
                 * Is it locked?
                 * @method locked
                 * @return {Boolean}
                 */
                locked: function() {
                    return !stack;
                },

                /**
                 * Call all callbacks with the given context and arguments
                 * @method fireWith
                 * @return {util.Callbacks}
                 */
                fireWith: function( context, args ) {
                    if ( list && ( !fired || stack ) ) {
                        args = args || [];
                        args = [ context, args.slice ? args.slice() : args ];
                        if ( firing ) {
                            stack.push( args );
                        } else {
                            fire( args );
                        }
                    }
                    return this;
                },

                /**
                 * Call all the callbacks with the given arguments
                 * @method fire
                 * @return {util.Callbacks}
                 */
                fire: function() {
                    self.fireWith( this, arguments );
                    return this;
                },

                /**
                 * To know if the callbacks have already been called at least once
                 * @method fired
                 * @return {util.Callbacks}
                 */
                fired: function() {
                    return !!fired;
                }
            };

        return self;
    };
});
