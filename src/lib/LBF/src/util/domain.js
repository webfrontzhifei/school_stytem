/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 12-8-28 上午10:16
 */
LBF.define('util.domain', function(){
    var domain = {},
        dm = document.domain;

    // in some cases, get location.href will throw security restriction error
    // so catch it and retry
    try{
        // in some cases, get location.href will throw security restriction error
        // so catch it and retry
        domain.url = location.href;
    } catch(e){
        domain.url = '';
    }

    domain.topDomain = function(){
        //in case of domains end up with .com.cn .edu.cn .gov.cn .org.cn
        var reg1 = /\.(?:(?:edu|gov|com|org|net)\.cn|co\.nz)$/,
        //in case of ip
            reg2 = /^[12]?\d?\d\.[12]?\d?\d\.[12]?\d?\d\.[12]?\d?\d$/,
        // for domain ends like .com.cn, top domain starts from -3
        // for ip starts from 0
        // else slice from -2
            slicePos = reg1.test(dm) ? -3 : reg2.test(dm) ? 0 : -2;
        return dm.split('.').slice(slicePos).join('.');
    }();

    domain.domain = function(){
        var reg = /(?::[\/]{2}|:[\\]{3})([a-zA-Z0-9_\.]+)/;

        try{
            var ret = reg.exec(domain.url);
            return ret ? ret[1] || dm : dm;
        } catch(e){
            return dm;
        }
    }();

    return domain;
});