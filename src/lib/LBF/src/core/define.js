var exports = global.LBF = {
  // The current version of Sea.js being used
  version: "@VERSION"
}

var data = exports.data = {}

exports.noConflict = function(){
	lastVersion && (global.LBF = lastVersion);
}