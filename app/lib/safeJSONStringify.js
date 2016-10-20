/**
 * Created by amos on 14-5-12.
 */
module.exports = function(obj){
    return JSON.stringify(obj, replacer).replace(/\\u0000\\u0001/g, '\\');
};

function replacer(key, value){
    var RE = /[& <>'"\/]/;

    return typeof value === 'string' && RE.test(value) ?
            value.replace(/([& <>'\/])/g, '\x00\x01$1')
            : value;
};