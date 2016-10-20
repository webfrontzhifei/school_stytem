/*
 * 判断浏览器和操作系统用
 * @author: vergilzhou
 * @version: 0.0.1
 * @date: 2014/11/11
 *
 */

var msie = 'msie';

exports.isMSIE = function(ua) {
	return typeof ua === 'string' && ua.toLowerCase().indexOf(msie) !== -1 ? true : false;
};

exports.isErrorSys = function(ua, sysList) {
	var result = false;
	if (typeof ua !== 'string') {
		return result;
	}
	ua = ua.toLowerCase();
	for (var i in sysList) {
		if (ua.indexOf(sysList[i].toLowerCase()) !== -1) {
			result = true;
			break;
		}
	}

	return result;
};