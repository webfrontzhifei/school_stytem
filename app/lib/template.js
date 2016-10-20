/**
 * Created by amos on 14-4-14.
 */
var template = module.exports = require('art-template/node/template-native.js'),
    underscore = require('underscore'),
    dateTool = require('../lib/dateTool'),
    safeJSONStringify = require('../lib/safeJSONStringify'),
    ua = require('../lib/ua');
    
// template helpers
template.helper('_', underscore);
template.helper('JSON', JSON);
template.helper('safeJSONStringify', safeJSONStringify);
template.helper('Date', Date);
template.helper('Math', Math);
template.helper('ua', ua);
template.helper('dateTool', dateTool);
template.helper('encodeURIComponent', encodeURIComponent);
template.helper('decodeURIComponent', decodeURIComponent);
