/**
 * Created by patrickliu on 12/11/14.
 */

// this is a ptlogin helper
LBF.define('util.ptLoginHelper', function(require, exports, module) {
    var RSA = require('util.RSA'),
        TEA = require('util.TEA'),
        md5 = require('util.md5');

    // current public key for pt
    RSA.setPublicKey("F20CE00BAE5361F8FA3AE9CEFA495362FF7DA1BA628F64A347F0A8C012BF0B254A30CD92ABFFE7A6EE0DC424CB6166F8819EFA5BCCB20EDFB4AD02E412CCF579B1CA711D55B8B0B3AEB60153D5E0693A2A86F3167D7847A0CB8B00004716A9095D9BADC977CBB804DBDCBA6029A9710869A453F27DFDDF83C016D928B3CBF4C7");

    function hexchar2bin(str) {
        var arr = [];
        for(var i = 0; i < str.length; i = i + 2) {
            arr.push("\\x" + str.substr(i, 2));
        }
        arr = arr.join("");
        eval("var temp = '" + arr + "'");
        return temp;
    }

    /**
     * 一般调用的就是这个方法了
     * @example
     * var ptHelper = require('util.ptLoginHelper');
     * var encodedPwd = ptHelper.getEncryption('user_pwd', 'salt', 'user_vcode', 'isMd5');
     * @param password (required) 用户输入的原始密码，如果第四个参数isMd5=true, 则这里输入的是一次md5之后的密码
     * @param salt (required) ptui_checkVC回调函数的第三个参数，传入即可
     * @param vcode (required) 用户输入的vcode
     * @param isMd5 (optional) 是否经过了一次md5，和第一个参数对应， 没有经过md5, 则可以忽略
     * @returns {*}
     */
    function getEncryption(password, salt, vcode, isMd5) {
        vcode = vcode || "";
        password = password || "";
        var md5Pwd = isMd5 ? password : md5(password),
            h1 = hexchar2bin(md5Pwd),
            s2 = md5(h1 + salt),
            rsaH1 = RSA.rsa_encrypt(h1),
            rsaH1Len = (rsaH1.length / 2).toString(16),
            hexVcode = TEA.strToBytes(vcode.toUpperCase()),
            vcodeLen = "000" + vcode.length.toString(16);

        while (rsaH1Len.length < 4) {
            rsaH1Len = "0" + rsaH1Len
        }
        TEA.initkey(s2);
        var saltPwd = TEA.enAsBase64(rsaH1Len + rsaH1 + TEA.strToBytes(salt) + vcodeLen + hexVcode);
        TEA.initkey("");

        return saltPwd.replace(/[\/\+=]/g, function(a) {
            return {"/": "-","+": "*","=": "_"}[a]
        })
    }

    function getRSAEncryption(password, vcode, isMd5) {
        var str1 = isMd5 ? password : md5(password);
        var str2 = str1 + vcode.toUpperCase();
        var str3 = RSA.rsa_encrypt(str2);
        return str3
    }

    var ptLoginHelper = {
        // 如果需要自定义RSA的publicKey，调用这个方法, 一般情况不用。
        setPublicKey: function(publicKey) {
            RSA.setPublicKey(publicKey);
        },
        // 一般情况，需要调用的就是这个方法了
        getEncryption: getEncryption,
        getRSAEncryption: getRSAEncryption
    };

    exports = module.exports = ptLoginHelper;
});
