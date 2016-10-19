/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-6-25 下午9:45
 */
LBF.define('util.contains', function(){
    return document.createElement('div').compareDocumentPosition ?
        //w3c
        function (parent, child, containSelf) {
            if (!containSelf && parent === child) {
                return false;
            }

            var res = parent.compareDocumentPosition(child);
            return res == 20 || res == 0;
        }:
        //ie
        function (parent, child, containSelf) {
            if (!containSelf && parent === child) {
                return false;
            }

            return parent.contains(child);
        };
});