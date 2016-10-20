/**
 * Created by leoriccao on 2015/9/1.
 */
LBF.define('qidian.comp.emoji',function (require, exports, module) {
    var jEmoji = require('qidian.comp.emoji.emoji');
    function emoji(){
        this.parse=function(text){
            return jEmoji.unifiedToHTML(text);
        }
    }

    module.exports=new emoji();
});
