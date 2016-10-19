/**
 * Created by amos on 13-11-6.
 */
LBF.define('util.postReport', function(require, exports){
    var DELAY = 1000,
        dataMap = {},
        reportUrl = 'http://fem.b.qq.com/', //随便写个默认值...
        win = window,
        doc = document,
        isIE = !!(win.ActiveXObject || win.msIsStaticHTML);

    function preSend(fm, doc){
        var t,
            df = doc.createDocumentFragment();

        if(fm && fm.method){
            for(var k in dataMap){
                t = doc.createElement('input');
                t.type = 'hidden';
                df.appendChild(t);
                t.name = k;
                t.value = dataMap[k];
            }
        }

        fm.appendChild(df);
        fm.action = reportUrl;
        fm.submit();
    }

    function response(evt, opts){
        evt = evt || win.event;
        var sf = this;

        if(isIE){
            if(sf.readyState != 'complete') return;
        } else {
            sf.onload = sf.onerror = null;
        }

        opts.callback && opts.callback(evt);

        sf.preSend = null;
        setTimeout(function(){
            sf.parentNode.removeChild(sf);
        }, DELAY);
    }


    return function send(opts){
        // setup
        opts = opts || {};
        dataMap = opts.dataMap || {};
        reportUrl = opts.reportUrl || reportUrl;


        var sf = doc.createElement('iframe'),
            dStr = (doc.domain && doc.domain != 'localhost') ? ('document.domain="' + doc.domain +  '";') : '',
            sdHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta http-equiv="content-type" content="text/html; charset=UTF-8" /><title>postSender</title><script type="text/javascript">document.charset="utf-8";' + dStr + '<\/script></head><body><form method="post" accept-charset="utf-8" id="__cp_post_sender" enctype="application/x-www-form-urlencoded;charset=utf-8" action="javascript:;"></form><script type="text/javascript">if(window.frameElement&&window.frameElement.preSend){window.frameElement.preSend(document.getElementById("__cp_post_sender"),document);}<\/script></body></html>',
            sdDoc, evtHandler;

        sf.style.cssText = 'width:1px;height:0;display:none;';
        doc.body.appendChild(sf);

        sf.src = 'about:blank';
        sf.preSend = preSend;

        evtHandler = (function(op){
            return function(ev){
                response.call(sf, ev, op);
            };
        })(opts);

        isIE ?
            (sf.onreadystatechange = evtHandler)
            :
            (sf.onload = sf.onerror = evtHandler)
        ;

        if(isIE){
            if(location.hostname && location.hostname === doc.domain) doc.domain = location.hostname; //fix form sender bug for IE
            sf.sdHtml = sdHtml;
            sf.src = 'javascript:document.open();' + dStr + 'var sdHtml=frameElement.sdHtml;document.write(sdHtml);document.close();';

            //    opts.clear && consolePlus.clear && consolePlus.clear();
        } else {
            try{
                sdDoc = sf.contentDocument || sf.contentWindow.document;
                sdDoc.open();
                sdDoc.write(sdHtml);
                sdDoc.close();

                //    opts.clear && consolePlus.clear && consolePlus.clear();
            }catch(ign){}
        }

    }
});