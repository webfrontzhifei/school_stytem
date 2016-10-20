/**
 * HuaTuo Report
 * @author: vergilzhou
 * @version: 1.0.0
 * @date: 2016/04/11
 */
LBF.define('qidian.comp.HuaTuoReport', function(require, exports, module){
   
   var conf = require('qidian.conf.main'),
       defaultAppId = conf.appId,
       report = require('util.report'),
       reportHttpUrl = 'http://report.huatuo.qq.com/report.cgi',
       reportHttpsUrl = 'https://huatuo.weiyun.com/report.cgi',
       finalReportUrl = location.protocol.indexOf('https') !== -1 ? reportHttpsUrl : reportHttpUrl;
       
   var htReport = function(options){
        var f1 = options.flag1,
            f2 = options.flag2,
            f3_ie = options.flag3IE,
            f3_c = options.flag3Chrome,
            d0 = options.initTime,
            appId = options.appId || defaultAppId,
            defaultUrl = finalReportUrl;

        var _t, 
            _p = window.performance || window.webkitPerformance || window.msPerformance, 
            _ta = [
                "navigationStart",
                "unloadEventStart",
                "unloadEventEnd",
                "redirectStart",
                "redirectEnd",
                "fetchStart",
                "domainLookupStart",
                "domainLookupEnd",
                "connectStart",
                "connectEnd",
                "requestStart",/*10*/
                "responseStart",
                "responseEnd",
                "domLoading",
                "domInteractive",
                "domContentLoadedEventStart",
                "domContentLoadedEventEnd",
                "domComplete",
                "loadEventStart",
                "loadEventEnd"
            ], 
            _da = [], 
            _t0, 
            _tmp, 
            f3 = f3_ie;

        if (_p && (_t = _p.timing)) {

            if (typeof(_t.msFirstPaint) != 'undefined') {   //ie9
                _ta.push('msFirstPaint');
            } else {
                if (f3_c) {
                    f3 = f3_c;
                }
            }

            _t0 = _t[_ta[0]];
            for (var i = 1, l = _ta.length; i < l; i++) {
                _tmp = _t[_ta[i]];
                _tmp = (_tmp ? (_tmp - _t0) : 0);
                if (_tmp > 0) {
                    _da.push( i + '=' + _tmp);
                }
            }

            if (d0) {//统计页面初始化时的d0时间
                _da.push('30=' + (d0 - _t0));
            }

            var url = options.url || defaultUrl,
                speedparams = encodeURIComponent('flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&'));

            url += '?appid=' + appId + '&speedparams=' + speedparams;

            report(url);
        }

    };
    
    module.exports = exports = htReport;
    
});