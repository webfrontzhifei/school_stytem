/**
 * util-lang.js - The minimal language enhancement
 */

function isType(type) {
  return function(obj) {
    return {}.toString.call(obj) == "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")
var isNumber = isType("Number")
var isRegExp = isType("RegExp")

var _cid = 0
function cid() {
  return _cid++
}

function forEach(arr, cb, context){
    context = context || this;

    for(var i= 0, len= arr.length; i< len; i++){
        if(typeof arr[i] !== 'undefined'){
            cb.call(context, arr[i], i, arr);
        }
    }
}
