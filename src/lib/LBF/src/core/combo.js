/**
 * Created by amos on 14-8-8.
 */
/**
 * The Sea.js plugin for concatenating HTTP requests
 */
var Module = LBF.Module
var FETCHING = Module.STATUS.FETCHING

var data = LBF.data
var comboHash = data.comboHash = {}

var comboSyntax = ["c/=/", ",/"]
var comboMaxLength = 1000
var comboExcludes
var comboSuffix


LBF.on("load", setComboHash)
LBF.on("fetch", setRequestUri)

function ignoreComboUri(uri){
	var combo = data.combo;
	
	switch(typeof combo) {
		/*case 'boolean':
			return false;*/
		case 'string':
			return uri.indexOf(combo) === -1 ? true : false;
		default:
			return false;
			/*var flag = true;
			
			for(var i in combo) {
				if(uri.indexOf(combo[i]) !== -1) {
					flag = false; 
					break;
				}
			}
			
			return flag;*/
	}
}

function setComboHash(uris) {
    var len = uris.length
    if (len < 2 || !data.combo) {
        return
    }

    data.comboSyntax && (comboSyntax = data.comboSyntax)
    data.comboMaxLength && (comboMaxLength = data.comboMaxLength)
    data.comboSuffix && (comboSuffix = data.comboSuffix)

    comboExcludes = data.comboExcludes
    var needComboUris = []

    for (var i = 0; i < len; i++) {
        var uri = uris[i]

        if (comboHash[uri] || ignoreComboUri(uri)) {
            continue
        }

        var mod = Module.get(uri)

        // Remove fetching and fetched uris, excluded uris, combo uris
        if (mod.status < FETCHING && !isCss(uri) && !isExcluded(uri) && !isComboUri(uri)) {
            needComboUris.push(uri)
        }
    }

    if (needComboUris.length > 1) {
        uris2paths(needComboUris)
    }
}

function setRequestUri(fetchData) {
    if(!data.combo){
        return;
    }

    fetchData.requestUri = comboHash[fetchData.uri] || fetchData.uri
}


// Helpers
var COMBO_ROOT_RE = /^(\S+:\/{2,3}[^\/]+\/)/;

function uris2paths(uris) {
    var paths = [],
        root = COMBO_ROOT_RE.exec(uris[0])[1],
        rootLen = root.length;

    forEach(uris, function(uri){
        paths.push(uri.substr(rootLen));
    });

    setHash(root, paths);
}

function setHash(root, files) {
    var copy = []
    for (var i = 0, len = files.length; i < len; i++) {
        copy[i] = files[i].replace(/\?.*$/, '')
    }
    var comboPath = root + comboSyntax[0] + copy.join(comboSyntax[1])
    if(comboSuffix) {
        comboPath += comboSuffix
    }
    var exceedMax = comboPath.length > comboMaxLength

    // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
    if (files.length > 1 && exceedMax) {
        var parts = splitFiles(files,
            comboMaxLength - (root + comboSyntax[0]).length)

        setHash(root, parts[0])
        setHash(root, parts[1])
    } else {
        if (exceedMax) {
            throw new Error("The combo url is too long: " + comboPath)
        }

        for (var i = 0, len = files.length; i < len; i++) {
            comboHash[root + files[i]] = comboPath
        }
    }
}

function splitFiles(files, filesMaxLength) {
    var sep = comboSyntax[1]
    var s = files[0]

    for (var i = 1, len = files.length; i < len; i++) {
        s += sep + files[i]
        if (s.length > filesMaxLength) {
            return [files.splice(0, i), files]
        }
    }
}

var CSS_EXT_RET = /\.css(?:\?.*)?$/;
function isCss(uri){
    return CSS_EXT_RET.test(uri);
}

function isExcluded(uri) {
    if (comboExcludes) {
        return comboExcludes.test ?
            comboExcludes.test(uri) :
            comboExcludes(uri)
    }
}

function isComboUri(uri) {
    var syntax = data.comboSyntax || comboSyntax
    var s1 = syntax[0]
    var s2 = syntax[1]

    return s1 && uri.indexOf(s1) > 0 || s2 && uri.indexOf(s2) > 0
}


// For test
if (data.test) {
    var test = LBF.test || (LBF.test = {})
    test.uris2paths = uris2paths
    test.paths2hash = paths2hash
}