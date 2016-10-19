/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-5-29 下午8:07
 */
LBF.define('lang.Inject', function(require){
    var each = require('lang.each');

    var BEFORE_INJECTIONS = '_BEFORE_INJECTIONS',
        AFTER_INJECTIONS = '_AFTER_INJECTIONS',
        ORIGINAL_FUNCTION = '_ORIGINAL_FUNCTION';

    var createExecution = function(methodName){
        return function(){
            var args = arguments,
                scope = this,
                beforeInjections = this[BEFORE_INJECTIONS + '-' + methodName],
                afterInjections = this[AFTER_INJECTIONS + '-' + methodName],
                beforeBreak = false,
                result;

            if(beforeInjections && beforeInjections.length){
                each(beforeInjections, function(){
                    beforeBreak = this.apply(scope, args) === false;
                    if(beforeBreak){
                        return false;
                    }
                });

                if(beforeBreak) {
                    return false;
                }
            }

            result = scope[ORIGINAL_FUNCTION][methodName].apply(scope, args);

            if(afterInjections && afterInjections.length){
                each(afterInjections, function(){
                    var afterResult = this.apply(scope, args);
                    result = afterResult || result;
                });
            }

            return result;
        };
    };

    /**
     * [mixable] Inject function before/after a method
     * @class Inject
     * @namespace lang
     * @module lang
     * @requires lang.each
     */
    return {
        /**
         * Inject function
         * @method inject
         * @static
         * @param {String} type Inject before or after
         * @param {String} method Name of method which to be injected
         * @param {Function} injection The function to be injected before or after the original method
         * @return {lang.MethodInjection}
         */
        inject: function(type, method, injection){
            // store original function
            var originalFunctions = this[ORIGINAL_FUNCTION];
            if(!originalFunctions){
                originalFunctions = this[ORIGINAL_FUNCTION] = {};
            }
            originalFunctions[method] = this[method];

            // store injected function
            var injections = this[type + '-' + method];
            if(!injections){
                injections = this[type + '-' + method] = [];
            }
            injections.push(injection);

            // replace method
            this[method] = createExecution(method);

            return this;
        },

        /**
         * Restore a method, revert injections
         * @method restore
         * @param {String} method Name of method injected
         * @return {lang.MethodInjection}
         */
        restore: function(method){
            this[method] = this[ORIGINAL_FUNCTION][method] || this[method];
            return this;
        },

        /**
         * Inject function before original method
         * @method before
         * @static
         * @param {String} method Name of method which to be injected
         * @param {Function} injection The function to be injected before or after the original method
         * @return {lang.MethodInjection}
         */
        before: function(method, injection){
            var args = [BEFORE_INJECTIONS].concat(Array.prototype.slice.call(arguments, 0));
            return this.inject.apply(this, args);
        },

        /**
         * Inject function after original method
         * @method after
         * @static
         * @param {String} method Name of method which to be injected
         * @param {Function} injection The function to be injected before or after the original method
         * @return {lang.MethodInjection}
         */
        after: function(method, injection){
            var args = [AFTER_INJECTIONS].concat(Array.prototype.slice.call(arguments, 0));
            return this.inject.apply(this, args);
        }
    }
});