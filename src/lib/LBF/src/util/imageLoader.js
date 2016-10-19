/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-9 上午10:11
 */
LBF.define('util.imageLoader', function(require){
    var browser = require('lang.browser');
    var onload = browser.msie ?
                    function(img, ready) {
                        if(typeof img.onreadystatechange != 'undefined') {
                            img.onreadystatechange = function(){
                                if (/^(?:loaded|complete|undefined)$/.test(this.readyState)){
                                    ready();
                                }
                            }
                        } else {
                            img.onload = img.onerror = ready;
                        }
                    }
                    : function(img, ready){
                        img.onload = img.onerror = ready;
                    };
    var count = 0,
        imgs = {};

    /**
     * Provide a util for load image and invoke callback
     * At this moment, we only support one image for a time, but multiple support is coming soon
     * @class imageLoader
     * @module util
     * @namespace util
     * @constructor
     * @param {String} uri Image's url
     * @param {Function} callback Callback when image is ready
     * @return {Image} Img element
     * @example
     *      imageLoader('http://xxx.com/img.jpg', function(){
     *          alert('ok');
     *      });
     */
    return function(uri, callback){
        var index = count++,
            img = imgs[index] = new Image();

        onload(img, ready);
        img.src = uri;

        return img;

        function ready(){
            imgs[index] = img.onreadystatechange = img.onload = null;

            callback && callback(img);
        }
    }
});