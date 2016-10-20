/**
 * Created by sean on 14-10-21.
 */
LBF.define('qidian.comp.PageController', function(require, exports, module){
    var Controller = require('qidian.comp.Controller'),
        SpeedReport = require('monitor.SpeedReport'),
        conf = require('qidian.conf.main'),
        htSpeed = conf.htSpeed,
        htReport = require('qidian.comp.HuaTuoReport'),
		commonInit = require('qidian.comp.commonInit');
		
	commonInit();
	
    module.exports = Controller.extend({
        /**
         * Report page performance use H5 perf API
         * Report only when browser supports H5 perf API
         * @method reportPerf
         * @param {Number} pageId Page id         
         */
        reportPerf: function(pageId){
            SpeedReport.reportPerform({
                flag1: 7818,            //appId App id
                flag2: 51,              //siteId Site id
                flag3IE: pageId,
                flag3Chrome: pageId
            });

            return this;
        },
        
        htReport: function(pageId) {
            htReport({
                flag1: htSpeed.flag1,
                flag2: htSpeed.flag2,
                flag3IE: pageId,
                flag3Chrome: pageId
            });
            
            return this;
        }
    });
});