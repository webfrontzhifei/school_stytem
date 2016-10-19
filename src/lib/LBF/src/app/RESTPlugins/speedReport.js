/**
 * Created by amos on 14-1-16.
 */
LBF.define('app.RESTPlugins.speedReport', function(require){
    var extend = require('lang.extend'),
        SpeedReport = require('monitor.SpeedReport');

    /**
     * @example
     *  REST.use('speedReport');
     *
     *  REST.read({
     *      url: 'cgiUrl',
     *      data: {
     *      },
     *
     *      speed: {
     *          // isd cgi as default
     *          // when using https, reset this with your proxy uri
     *          url: 'cgiUrl',
     *
     *          // the proxy url
     *          proxy: 'proxyUrl',
     *
     *          // flags are generated on m.isd.com
     *          // all reports go to isd monitor
     *          flag1: xx,
     *          flag2: xx,
     *          flag3: xx,
     *          point: xx
     *      }
     *  });
     */
    return function(REST){
        REST.on('request', function(xhr, options){
            var speedOption = extend({}, REST.get('speed'), options.speed);

            if(speedOption && speedOption.flag1 && speedOption.flag2 && speedOption.flag3){
                var report = SpeedReport.create(speedOption);

                xhr.done(function(){
                    report
                        .add(+new Date(), speedOption.point || 0)
                        .send();
                });
            }
        });
    }
});