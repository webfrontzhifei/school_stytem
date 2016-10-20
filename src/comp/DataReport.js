/**
 * Created by Dan on 15-11-23.
 */
LBF.define('qidian.comp.DataReport', function(require){

    return function(url){
        if(typeof url !== 'string') return;

        //send data
        var img = new Image();

        img.onload = img.onerror = function(){};

        //url += (url.indexOf('?') > -1 ? '&' : '?') + new Date();

        img.src = url;

        return arguments.callee;
    };

});