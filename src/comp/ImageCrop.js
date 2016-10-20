/**
 * Created by amos on 14-4-9.
 */
LBF.define('qidian.comp.ImageCrop', function(require){
    var ImageCrop = require('ui.widget.ImageCrop.ImageCrop'),
		extend = require('lang.extend'),
		Cookie = require('util.Cookie'),
		config = require('qidian.conf.main').FileUploader,
		settings = extend({}, ImageCrop.settings, config);
	
	return ImageCrop.include({
		settings: settings
	});
});