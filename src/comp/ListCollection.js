/**
 *
 * @overview
 * @author amoschen
 * @create 14-6-8
 */
LBF.define('qidian.comp.ListCollection', function(require, exports, module){
    var Collection = require('app.Collection'),
        REST = require('qidian.comp.REST'),
        extend = require('lang.extend');

    module.exports = exports = Collection.extend({
        REST: REST,

        defaults: {
            total: 0,
            index: 1,
            count: 15
        },

        fetch: function(options){
            var collection = this,
                options = options || {};

            options.url = options.url || this.url;

            return REST
                .read(options)
                .done(function(res){
                    collection.reset(res);
                    collection.trigger('sync', collection, collection.toJSON, options || {});
                });
        },

        reset: function(data, opts){
            var data = data || {};
            typeof data.count === 'number' && (this.count = data.count);
            typeof data.total === 'number' && (this.total = data.total);
            typeof data.index === 'number' && (this.index = data.index);

            return Collection.prototype.reset.call(this, data.records, opts);
        },

        page: function(page, speed){
            var collection = this,
                page = page || 1;

            if(isNaN(page)) {
                return;
            }

            collection.index = page;

            var data = extend({}, {count: collection.count || this.defaults.count, index: collection.index}, collection.params || {});
            return REST.read({
                    url: collection.url,
                    speed: speed,
                    data: data
                }).done(function(res){
                    collection.reset(res);
                    collection.trigger('sync', collection, collection.toJSON, {page: page});
                });
        }
    });
});