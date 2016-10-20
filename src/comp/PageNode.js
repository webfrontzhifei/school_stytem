/**
 * Created by sean on 14-4-19.
 * 兼顾从node继承页面的通用性改造;
 */
LBF.define('qidian.comp.PageNode', function(require, exports, module){
    var Node = require('ui.Nodes.Node'),
        commonInit = require('qidian.comp.commonInit');
	
    commonInit();
	
	module.exports = Node
});