/**
 * Created by amos on 14-8-18.
 */
LBF.define('util.Promise', function(require, exports, module){
    var Class = require('lang.Class'),
        forEach = require('lang.forEach'),
        extend = require('lang.extend'),
        proxy = require('lang.proxy'),
        toArray = require('lang.toArray'),
        isFunction = require('lang.isFunction'),
        Callbacks = require('util.Callbacks');

    var STATE_PENDING = 'pending',
        STATE_RESOLVED = 'resolved',
        STATE_REJECTED = 'rejected';

    /**
     * Promise module for complex handling async processed
     * Inspired by Promises/A of CommonJS
     * Partial borrowed from jQuery.Deferred
     * @class Promise
     * @namespace util
     * @example
     *      // Take static method create as example
     *      // 'new Promise' style is the same
     *
     *      var promise = Promise.create(function(promise){
     *          // do something
     *
     *          // when things done
     *          promise.resolve();
     *
     *          // or when error occurs
     *          promise.reject();
     *
     *          // or when things are in progress
     *          promise.notify();
     *      });
     *
     *      promise
     *          .done(function(){
     *              // success callback
     *          })
     *          .done(function(){
     *              // multiple callbacks are accepted in done/fail/progress methods
     *          })
     *          .fail(function(){
     *              // fail/error callback
     *          })
     *          .progress(function(){
     *              // progress callback
     *          })
     */
    var Promise = module.exports = exports = Class.inherit({
        initialize: function(fn){
            this._state = STATE_PENDING;

            var tuples = this.tuples = [
                // action, add listener, listener list, final state
                [ 'resolve', 'done', Callbacks('once memory'), STATE_RESOLVED ],
                [ 'reject', 'fail', Callbacks('once memory'), STATE_REJECTED ],
                [ 'notify', 'progress', Callbacks('memory') ]
            ];

            var promise = this;

            // Add list-specific methods
            forEach( tuples, function( tuple, i ) {
                var list = tuple[ 2 ],
                    stateString = tuple[ 3 ];

                // promise[ done | fail | progress ] = list.add
                promise[ tuple[1] ] = list.add;

                // Handle state
                if ( stateString ) {
                    list.add(function() {
                        // state = [ resolved | rejected ]
                        promise._state = stateString;

                        // [ reject_list | resolve_list ].disable; progress_list.lock
                    }, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
                }

                // deferred[ resolve | reject | notify ]
                promise[ tuple[0] ] = function() {
                    promise[ tuple[0] + 'With' ]( this === promise ? promise : this, arguments );
                    return this;
                };
                promise[ tuple[0] + 'With' ] = function(){
                    return this.__promiseObject ? false : list.fireWith.apply(this, arguments);
                };
            });

            if(isFunction(fn)){
                fn.call(this, this);
            }
        },

        state: function() {
            return this._state;
        },

        always: function() {
            this.done.apply(this, arguments).fail.apply(this, arguments);
            return this;
        },

        then: function( /* fnDone, fnFail, fnProgress */ ) {
            var fns = arguments,
                promise = this,
                tuples = this.tuples;

            return new Promise(function( newPromise ) {
                forEach( tuples, function( tuple, i ) {
                    var action = tuple[ 0 ],
                        fn = isFunction( fns[ i ] ) && fns[ i ];

                    // deferred[ done | fail | progress ] for forwarding actions to newPromise
                    promise[ tuple[1] ](function() {
                        var ret = fn && fn.apply( this, arguments );

                        if ( ret && isFunction( ret.promise ) ) {
                            ret.promise()
                                .done( newPromise.resolve )
                                .fail( newPromise.reject )
                                .progress( newPromise.notify );
                        } else {
                            newPromise[ action + 'With' ]( this === promise ? newPromise.promise() : this, fn ? [ ret ] : arguments );
                        }
                    });
                });

                fns = null;
            }).promise();
        },

        // Get a promise for this deferred
        // If obj is provided, the promise aspect is added to the object
        promise: function( obj ) {
            var promise = this,
                promiseObj = {};

            // create only at first time when calling promise
            // delegate promiseObj to promise instance
            forEach(['state', 'always', 'then', 'promise', 'done', 'fail', 'progress', 'isResolved', 'isRejected'], function( method ){
                promiseObj[method] = proxy(promise[method], promise);
            });

            // replace this.promise and call it immediately
            return (this.promise = function( obj ){
                return obj ? extend( obj, promiseObj ) : promiseObj;
            })(obj);
        },

        isResolved: function(){
            return this.state() === STATE_RESOLVED;
        },

        isRejected: function(){
            return this.state() === STATE_REJECTED;
        }
    });

    exports.include({
        PENDING: STATE_PENDING,
        RESOLVED: STATE_RESOLVED,
        REJECTED: STATE_REJECTED,

        when: function( subordinate /* , ..., subordinateN */ ) {
            var any = false,
                resolveValues = toArray( arguments );

            if(typeof resolveValues[0] === 'boolean'){
                any = resolveValues.shift();
                subordinate = resolveValues[ 0 ];
            }

            var i = 0,
                length = resolveValues.length,

            // the count of uncompleted subordinates
                remaining = length !== 1 || ( subordinate && isFunction( subordinate.promise ) ) ? length : 0,

            // the master Deferred. If resolveValues consist of only a single Deferred, just use that.
                promise = remaining === 1 ? subordinate : new Promise(),

            // Update function for both resolve and progress values
                updateFunc = function( i, contexts, values ) {
                    var changeMethod = (any ? 'reject' : 'resolve') + 'With';

                    return function( value ) {
                        contexts[ i ] = this;
                        values[ i ] = arguments.length > 1 ? toArray( arguments ) : value;
                        if( values === progressValues ) {
                            promise.notifyWith( contexts, values );
                        } else if ( !( --remaining ) ) {
                            promise[changeMethod]( contexts, values );
                        }
                    };
                },

                progressValues, progressContexts, resolveContexts, resolveMethod, rejectMethod;

            // add listeners to Deferred subordinates; treat others as resolved
            if ( length > 1 ) {
                progressValues = new Array( length );
                progressContexts = new Array( length );
                resolveContexts = new Array( length );
                for ( ; i < length; i++ ) {
                    if ( resolveValues[ i ] && isFunction( resolveValues[ i ].promise ) ) {
                        resolveMethod = any ? promise.resolve : updateFunc( i, resolveContexts, resolveValues );
                        rejectMethod = any ? updateFunc( i, resolveContexts, resolveValues ) : promise.reject;

                        resolveValues[ i ]
                            .promise()
                            .done( resolveMethod )
                            .fail( rejectMethod )
                            .progress( updateFunc( i, progressContexts, progressValues ) );
                    } else {
                        --remaining;
                    }
                }
            }

            // if we're not waiting on anything, resolve the master
            if ( !remaining ) {
                promise.resolveWith( resolveContexts, resolveValues );
            }

            return promise.promise();
        },

        any: function( subordinate /* , ..., subordinateN */ ){
            return Promise.when.apply(Promise, arguments);
        }
    });
});