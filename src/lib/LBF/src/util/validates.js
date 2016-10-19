/**
 * @fileOverview
 * @author amoschen, seanxphuang
 * @version 1
 * Created: 13-3-16 下午12:10
 */
LBF.define('util.validates', function(){
    /**
     * Test if the obj matches the regular expression
     * @inner
     * @param {RegExp} reg
     * @param obj
     * @return {Boolean}
     */
    var test = function(reg, obj){
        return reg.test(obj + '');
    };

    /**
     * Frequently used validates
     * @class validates
     * @namespace util
     * @module util
     */
    return {
		post: /^[0-9]{6}$/,
		
        mobile: /^13[0-9]{9}$|^14[0-9]{9}|^15[0-9]{9}$|^18[0-9]{9}$/,
		
        email: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		
		link: /^(http|https):\/\/\w+(\.\w+)+.*$/,
		
        url: /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
		
		/*
		 *	reference http://blog.csdn.net/lxcnn/article/details/4362500;
		 *	日期格式可以是：20120102 / 2012.01.02 / 2012/01/02 / 2012-01-02
		 *	时间格式可以是：10:01:10 / 02:10
		 *	如 2012-01-02 02:10
		 *	   2012-01-02
		 */
		date: /^(?:(?:1[6-9]|[2-9][0-9])[0-9]{2}([-/.]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00)([-/.]?)0?2\2(?:29))(\s+([01][0-9]:|2[0-3]:)?[0-5][0-9]:[0-5][0-9])?$/,
		
		//匹配中文字符;
		zh: /^[\u4e00-\u9fa5]+$/,
		
		//匹配双字节字符;
		dword: /^[^\x00-\xff]+$/,
		
		//货币类型;
		money: /^([\u0024\u00A2\u00A3\u00A4\u20AC\u00A5\u20B1\20B9\uFFE5]\s*)(\d+,?)+\.?\d*\s*$/,
		
		//匹配ipv4地址;
		ipv4: /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/,
		
		/*
		 *	匹配ipv6地址;
		 *	reference http://forums.intermapper.com/viewtopic.php?t=452;
		 */
		ipv6: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
		
		//数值型;
		num: /^(\d+[\s,]*)+\.?\d*$/,
		
		//QQ号码;
		qq: /^[1-9][0-9]{4,}$/,
		
		//匹配整数;
		int: /^-?[1-9]\d*$/,
		
		//匹配正整数;
		positiveInt: /^[1-9]\d*$/,    
		
		//匹配负整数;
        neagtiveInt: /^-[1-9]\d*$/,   
		
		//匹配非负整数（正整数 + 0）;
        nonNegativeInt: /^[1-9]\d*|0$/,
		
		//匹配非正整数（负整数 + 0）;
        nonPositiveInt: /^-[1-9]d*|0$/, 
		
		//匹配正浮点数;
        positiveFloat: /^[1-9]d*.d*|0.d*[1-9]d*$/,    
		
		//匹配负浮点数;
        negativeFloat: /^-([1-9]d*.d*|0.d*[1-9]d*)$/,
		
		//匹配浮点数;
        float: /^-?([1-9]d*.d*|0.d*[1-9]d*|0?.0+|0)$/,    
		
		//匹配非负浮点数（正浮点数 + 0）;
        nonNegativeFloat: /^[1-9]d*.d*|0.d*[1-9]d*|0?.0+|0$/,    
		
		//匹配非正浮点数（负浮点数 + 0）;
        nonPositiveFloat: /^(-([1-9]d*.d*|0.d*[1-9]d*))|0?.0+|0$/,
		
        /**
         * Check if num is int alike
         * @method isInt
         * @static
         * @param {*} num
         * @return {Boolean}
         */
        isInt: function(num){
            return test(this.int, num);
        },

        /**
         * Check if num is positive int alike
         * @method isPosInt
         * @static
         * @param {*} num
         * @return {Boolean}
         */
        isPosInt: function(num){
            return test(this.positiveInt, num);
        },
		
		isNegativeInt: function(num){
            return test(this.negativeInt, num);
        },
		
		isNonNegativeInt: function(num){
            return test(this.nonNegativeInt, num);
        },
		
		isNonPositiveInt: function(num){
            return test(this.nonPositiveInt, num);
        },
		
		isPositiveFloat: function(num){
            return test(this.positiveFloat, num);
        },
		
		isNegativeFloat: function(num){
            return test(this.negativeFloat, num);
        },
		
		isFloat: function(num){
            return test(this.float, num);
        },
		
		isNonNegativeFloat: function(num){
            return test(this.nonNegativeFloat, num);
        },
		
		isNonPositiveFloat: function(num){
            return test(this.nonPositiveFloat, num);
        },

        /**
         * Check if str is http(s) link
         * @method isLink
         * @static
         * @param {String} str
         * @return {Boolean}
         */
        isLink: function(str){
            return test(this.link, str);
        },

        /**
         * Check if str is a legal url
         * @method isURL
         * @static
         * @param {String} str
         * @return {Boolean}
         */
        isURL: function(str){
            return test(this.url, str);
        },
		
		//判断字符长度，中文算两个字;
		bytesBetween:function(str, maxim, minim){
			var regex = /[^\x00-\xff]/g;
			
			str = str ? str + '' : '';
			maxim = parseInt(maxim);
			minim = parseInt(minim) || 0;
				
			strLen = str.replace(regex, "00").length;
			
			if(maxim && strLen > maxim || strLen < minim){
				return false;
			}
			
			return true;
		},
		
		//数值范围检测;
		numBetween: function(num, minim, maxim){
			var regex = /^[-+]?\d+\.?\d*$/;
			
			num = parseFloat(format(num));
			minim = parseFloat(format(minim));
			maxim = parseFloat(format(maxim));
			
			if(!regex.test(num) || regex.test(minim) && num < minim || regex.test(maxim) && num > maxim){
				return false;
			}
			
			return true;
			
			function format(input){
				input = input !== undefined ? input + '' : '';
				return input.replace(/\s*/g, "").replace(/,/g, "");
			}
		},
	
		
		/* 日期范围检测;
		 * 日期格式：2012/12/29 10:10:10 或 2012-12-29 10:10 或 2012.12.29 10:10 或 2012,12,29 10:10:10;
		 * eg: dateBetween('20140803 10:10:11', 20140201, '20140803 10:10:10') ==> false;
		 */
		dateBetween: function(date, minDate, maxDate){
			var regex = /^(\d{4})[^\d]*(\d{1,2}?)[^\d]*(\d{1,2})(\s+\d{1,2}:\d{1,2}(:\d{1,2})?)?$/;
			
			maxDate = format(maxDate);
			minDate = format(minDate);
			date = format(date);
			
			maxDate = +new Date(maxDate);
			minDate = +new Date(minDate);
			date = +new Date(date);

			if(!date || (maxDate && gets > maxDate) || gets < minDate) {
				return false;
			}

			return true;
			
			function format(input){
				input = input ? input + '' : '';
				return input.replace(regex, '$1/$2/$3 $4');
			}
		},
		
		//验证身份证真假;
		isIdCard: function(cardno){
			//加权因子;
			var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];
			
			//身份证验证位值，10代表X;
			var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];
		
			if(cardno.length == 15) {   
				return isValidityBrithBy15IdCard(cardno);   
			} else if (cardno.length == 18){   
				//得到身份证数组;
				var a_idCard = cardno.split("");
				
				if (isValidityBrithBy18IdCard(cardno)&&isTrueValidateCodeBy18IdCard(a_idCard)) {   
					return true;
				}
				 
				return false;
			}
			
			return false;
			
			function isTrueValidateCodeBy18IdCard(a_idCard) {   
				//声明加权求和变量;
				var sum = 0;   
				
				if (a_idCard[17].toLowerCase() == 'x') {   
					//将最后位为x的验证码替换为10方便后续操作;
					a_idCard[17] = 10;   
				}
				 
				for ( var i = 0; i < 17; i++) {
					//加权求和;
					sum += Wi[i] * a_idCard[i];
				}
				
				// 得到验证码所位置;
				valCodePosition = sum % 11;
				
				if (a_idCard[17] == ValideCode[valCodePosition]) {   
					return true;   
				}
				
				return false;   
			}
			
			function isValidityBrithBy18IdCard(idCard18) {   
				var year = idCard18.substring(6,10);   
				var month = idCard18.substring(10,12);   
				var day = idCard18.substring(12,14);   
				var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));
				  
				// 这里用getFullYear()获取年份，避免千年虫问题   
				if(temp_date.getFullYear()!=parseFloat(year) || temp_date.getMonth()!=parseFloat(month)-1 || temp_date.getDate()!=parseFloat(day)){   
					return false;   
				}
				
				return true;   
			}
			
			function isValidityBrithBy15IdCard(idCard15){   
				var year =  idCard15.substring(6,8);   
				var month = idCard15.substring(8,10);   
				var day = idCard15.substring(10,12);
				var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));
				 
				// 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法;
				if(temp_date.getYear()!=parseFloat(year) || temp_date.getMonth()!=parseFloat(month)-1 || temp_date.getDate()!=parseFloat(day)){   
					return false;   
				}
				
				return true;
			}
			
		}
    }
});