/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-13 下午9:04
 */
LBF.define('ui.widget.Editor.CountPlugin', function(require){
    var isFunction = require('lang.isFunction'),
        proxy = require('lang.proxy'),
        validates = require('util.validates'),
        Plugin = require('ui.Plugins.Plugin'),
        Popup = require('ui.Nodes.Popup');

    /**
     * Count plugin for editor. Specialized in content length counting.
     * @class CountPlugin
     * @namespace ui.widget.Editor
     * @module ui
     * @submodule ui-widget
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {Object} opts Initialization options
     * @param {Number} opts.limit Max length limit of editor content
     * @param {Function} opts.count Count function to overwritten original str.length method. Can be used in specialized cases like separating Chinese chars and other chars
     * @param {String} opts.wordingTemplate Wording template for counting. Would be re-rendered when content changed
     * @param {Object} opts.wordingTemplate.opts Options got each time the template is rendered
     * @param {Boolean} opts.wordingTemplate.opts.isMinus Whether counting result is minus, which depends on opts.limit and opts.count
     * @param {Number} opts.wordingTemplate.opts.remain Remaining number.
     * @param {Object} opts.wordingTemplate.opts.window Link to window since util.template use strict mode
     * @example
     *      editor.plug(CountPlugin, {
     *          // 100 in max
     *          limit: 100,
     *
     *          // count without blanks
     *          count: function(){
     *              var str = this.node.val(); // get content
     *              str.replace(/\s/g, ''); // remove all blanks
     *              return str.length;
     *          },
     *
     *          // replace with a new template
     *          wordingTemplate: '<p>remaining <%=remain%></p>'
     *      });
     */
    var CountPlugin = Plugin.inherit({
        initialize: function(){
            this.superclass.prototype.initialize.apply(this, arguments);

            var plugin = this,
                opts = this.opts;

            plugin.limit(opts.limit);
            isFunction(opts.count) && (plugin.count = opts.count);

            plugin.node.addValidate(function(){
                if(plugin._limit - plugin.count() < 0){
                    return new Error('CountPlugin:Exceed limit');
                }
            });

            plugin.render();
        },

        /**
         * Render count display and add to editor's bottom panel
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var node = this.node,
                opts = this.opts,
                $el = this.$el = this.$(opts.template),
                update = proxy(this.update, this);

            this.wordingTempate = this.template(opts.wordingTemplate);
            update();

            node.bind('input propertychange change', update);

            node.$bottomPanel.append($el);

            return this;
        },

        /**
         * Update count display
         * @method update
         * @chainable
         */
        update: function(){
            var plugin = this;

            // clear timer
            plugin._updateTimer && clearTimeout(plugin._updateTimer);

            // delayed execution for performance improvement
            plugin._updateTimer = setTimeout(function(){
                var remain = plugin._limit - plugin.count();
                plugin.html(plugin.wordingTempate({
                    isMinus: remain < 0,
                    remain: remain,
                    Math: Math
                }));

                remain < 0 ? plugin.node.error() : plugin.node.clearError();
            }, 0);

            return plugin;
        },

        /**
         * Count host content's length. Can be overwrite to change count logic
         * @method count
         * @return {Number}
         */
        count: function(){
            return this.node.count();
        },

        /**
         * Set limit num
         * @method limit
         * @param {Number} num The limited max num
         * @chainable
         */
        limit: function(num){
            if(!validates.isPosInt(num)){
                throw new TypeError('Limit should be positive integer');
            }

            this._limit = num;

            return this;
        }
    });

    CountPlugin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Count',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            template: '<div class="Editor-CountPlugin"></div>',
            wordingTemplate: '<p class="<%== isMinus ? \'minus\' : \'\' %>"><%== isMinus ? \'超出\' : \'剩余\' %><span class="num"><%==window.Math.abs(remain)%></span>字</p>',
            limit: 200
        }
    });

    return CountPlugin;
});