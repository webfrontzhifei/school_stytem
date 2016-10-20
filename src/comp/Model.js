/**
 *
 * @overview
 * @author amoschen
 * @create 14-6-8
 */
LBF.define('qidian.comp.Model', function(require){
    var Model = require('app.Model'),
        REST = require('qidian.comp.REST'),
        _ = require('lib.underscore');

    return Model.extend({
        REST: REST,

        _isAttrChanged: false,

        _isAttrSaved: true,

        modelChanged: function() {
            this._isAttrChanged = true;
            this._isAttrSaved = false;
        },

        modelSaved: function() {
            this._isAttrChanged = false;
            this._isAttrSaved = true;
        },

        needSave: function() {
            return this._isAttrChanged && !this._isAttrSaved ? true : false;
        },

        pick: function(){
            var args = [].slice.call(arguments);

            return _.pick.apply(_, [this.attributes].concat(args));
        },

        toJSON: function(options){
            var attrs = Model.prototype.toJSON.call(this);

            if(options && options.pick){
                attrs = _.pick.apply(_, [attrs].concat(options.pick));
            }

            return attrs;
        }
    });
});