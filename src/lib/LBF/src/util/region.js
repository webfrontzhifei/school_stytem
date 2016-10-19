/**
 *
 * @overview
 * @author amoschen
 * @create 14-6-4
 */
LBF.define('util.region', function(require, exports, module){
    var each = require('lang.each'),
        db = require('util.regionData');

    var RAW = exports.RAW = db;

    var GLOBAL_KEY = '\u0001',
        LEVEL = exports.POS_LEVEL = 0,
        CODE = exports.POS_CODE = 1,
        NAME = exports.POS_NAME = 2,
        SUB = 3,
        LEVEL_ARRAY = ['global', 'nation', 'province', 'city', 'district'];

    var format = function(key, raw){
        return {
            key: key,
            level: raw[LEVEL],
            name: raw[NAME],

            // uncompress code
            code: uncompress(raw[CODE])
        };
    };

    var getList = exports.getList = function(key){
        key = key || GLOBAL_KEY;

        var parent = RAW[key],
            subArr = parent[SUB],
            children = [];

        if(!subArr){
            return null;
        }

        for(var i= 0, subKey; i< subArr.length; i++){
            subKey = subArr[i];
            children.push(getOne(subKey));
        }

        return children;
    };

    exports.nextLevel = function(key){
        var parent = RAW[key];

        if(!parent || parent[LEVEL] >= LEVEL_ARRAY.length || !parent[SUB]){
            return null;
        }

        var subKey = parent[SUB][0],
            level = RAW[subKey][LEVEL];

        return {
            level: level,
            name: LEVEL_ARRAY[level]
        };
    };

    var getOne = exports.get = function(key){
        return RAW[key] ? format(key, RAW[key]) : null;
    };

    /**
     * Query region info by code
     * @method queryByCode
     * @param {String} code* Code of each level, use null to jump empty one
     * @returns {Array} Region info of each level
     *      @param {Object} [info* = null] Info of the certain level
     *
     * @example
     *  region.queryByCode('1', '');
     */
    exports.queryByCode = function(){
        var list = getList(),
            ret = [],
            args = [].slice.call(arguments);

        each(args, function(_, code){
            // jump empty level
            if(!code){
                // empty level returns null as result
                ret.push(null);

                return;
            }

            // empty parent
            var parent;

            // list may be long
            // use for loop to improve search performance
            for(var i= 0, len= list.length, item; i< len; i++){
                item = list[i];

                // codes in list have been uncompressed
                // so we can directly use it for comparation
                if(item.code === code){
                    ret.push(parent = list[i]);
                    break;
                }
            }

            // get children list
            parent && (list = getList(parent.key));

            // no children list to query from
            if(!list){
                return false;
            }
        });

        return ret;
    };

    /**
     * Code Compress & Uncompress
     * use ascii code as compress base(base 256)
     * which contains much more info at each char(ascii char in utf-8 occupies 1 byte)
     * than demical (base 10)
     */

    var int2char = String.fromCharCode;

    function compress(integer){
        integer = parseInt(integer, 10);

        var ascii = '';

        // take 13362 as example
        while(integer > 0){
            // 13362 % 256 -> 50 -> '2'
            // floor(13362 / 256) = 52
            // 52 % 256 -> 52 -> '4'
            // ascii = '4' + '2' = '42'
            ascii = int2char(integer % 256) + ascii;
            integer = Math.floor(integer / 256);
        }

        return parseInt(ascii, 10);
    }

    function uncompress(ascii){
        // make ascii string
        ascii += '';

        var integer = '';

        // take '42' as example
        for(var i= 0, len= ascii.length; i<len; i++){
            // '4' -> 52 -> '34'
            // '2' -> 50 -> '32'
            // integer = '34' + '32' = '3432'
            integer += ascii.charCodeAt(i).toString(16);
        }

        // '3432' -> 13362
        return parseInt(integer, 16);
    }
});