LBF.define('util.defaults', function( require ){
    var extend = require('lang.extend');

    /**
     * Merge options with defaults, support multiple defaults
     * @method defaults
     * @param {Boolean} [isRecursive=false] Should recursive merge or not
     * @param {Object} options Options to be merged to
     * @param {Object} defaults* Defaults for options
     * @return {Object} Options merged with defaults.
     * @example
     *  var ret = defaults( { a: 1 }, { a: 2, b: 2, c: 2 }, { c: 3, d: 4 } );
     *
     *  // defaults won't override options
     *  ret.a === 2;
     *
     *  // the attribute unset in options will be filled with value in defaults
     *  ret.b === 2;
     *
     *  // the latter defaults will override previous one
     *  ret.c === 3;
     */
    return function(){
        var args = [].slice.call( arguments ),
            optPos = typeof args[0] === 'boolean' ? 1 : 0,
            options = args.splice( optPos, 1 )[0];

        // add target options
        args.splice( optPos, 0, {} );

        // move original options to tail
        args.push( options );

        return extend.apply( this, args );
    };
});