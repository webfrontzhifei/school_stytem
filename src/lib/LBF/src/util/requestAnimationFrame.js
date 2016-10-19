/**
 * Created by amos on 14-3-26.
 */
LBF.define('util.requestAnimationFrame', function(require, exports){
    var proxy = require('lang.proxy');

    var win = window;

    exports.requestAnimationFrame = proxy(
        win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.msRequsetAnimation ||
        function (step){
            var Date = win.Date;
            return setTimeout(function(){
                step(+new Date);
            }, 16);
        }
    , win);


    exports.cancelAnimationFrame = proxy(
        win.cancelRequestAnimationFrame ||
        win.webkitCancelRequestAnimationFrame ||
        win.mozCancelRequestAnimationFrame ||
        win.msCancelRequestAnimationFrame ||
        clearTimeout
    , win);
});