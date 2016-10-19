/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 */

var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
    SLASH_RE = /\\\\/g,
    REQUIRE_NAME_RE = /^function[\s]*\([\s]*([^\s,\)]+)/;

function parseDependencies(code) {
    // get require function name
    // in compress code, require function name is no longer 'require'
    var requireName = REQUIRE_NAME_RE.exec(code),
        RE = REQUIRE_RE;

    // no dependencies
    if( !requireName ){
        return [];
    }

    if((requireName = requireName[1]) !== 'require'){
        // reconstruct require regexp
        RE = RE
                .toString()
                // for compressed code
                // replace arg 'require' with actual name
                .replace(/require/g, requireName);

        // remove head & tail
        // '/xxxxx/g' -> 'xxxxx'
        RE = RE.slice(1, RE.length - 2);

        RE = new RegExp(RE, 'g');
    }

    // grep deps by using regexp match
    var ret = [];

    code.replace(SLASH_RE, '')
        .replace(RE, function(m, m1, m2) {
            m2 && ret.push(m2);
        });

    return ret;
}
