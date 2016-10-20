LBF.define('qidian.comp.stringLength', function( require ){
    var _ = require('lib.underscore');

    // regexp for Chinese chars,
    // including symbols like 。；，：“”（）、？《》…
    var RE_GLOBAL_CHAR_ZN = /[\u4e00-\u9fa5\u00b7\u00d7\u2014\u2018\u2019\u201c\u201d\u2026\u3001\u3002\u300a\u300b\u300c\u300d\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uffe5]/g;

    /**
     * Get length of a string, take Chinese char as n chars.
     * @method stringLength
     * @param {String} str
     * @param {Object} [options]
     *   @param {Number} [options.width=2] The width a Chinese char occupies
     */
    return function(str, options){
        str = str || '';
        options = _.defaults( options || {}, {
            width: 2
        } );

        var match = str.match( RE_GLOBAL_CHAR_ZN ),
            count = match ? match.length : 0;

        return count * ( options.width - 1 ) + str.length;
    };
});