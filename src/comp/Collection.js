/**
 *
 * @overview
 * @author amoschen
 * @create 14-6-8
 */
LBF.define('qidian.comp.Collection', function(require){
    var Collection = require('app.Collection'),
        Model = require('lib.Backbone').Model,
        REST = require('qidian.comp.REST');

    return Collection.extend({
        REST: REST,

        // fix validate bug
        _prepareModel: function(attrs, options){
            if (attrs instanceof Model) {
                if (!attrs.collection) attrs.collection = this;
                return attrs;
            }
            options || (options = {});
            options.collection = this;
            var model = new this.model(attrs, options);
            if (model.isValid()) return model;
            this.trigger('invalid', this, model.validationError, options);
            return false;
        }
    });
});