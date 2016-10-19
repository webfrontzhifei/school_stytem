/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-12 下午4:22
 */
LBF.define('ui.widget.Editor.Editor', function(require){
    var extend = require('lang.extend'),
        Textarea = require('ui.Nodes.Textarea'),
        Plugin = require('ui.Plugins.Plugin'),
        Cursor = require('ui.Plugins.Cursor');

    require('{theme}/lbfUI/css/Editor.css');

    var wrapTemplate = [
        '<div class="Editor-wrap">',
            '<div class="topPanel clearfix"></div>',
            '<div class="main"></div>',
            '<div class="bottomPanel"></div>',
        '</div>'
    ].join('');

    /**
     * @class Editor
     * @namespace ui.widget.Editor
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Textarea
     * @uses ui.Plugins.Cursor
     * @example
     *      new Editor({
     *          container: 'someContainerSelector',
     *          disabled: true,
     *          maxlength: 100,
     *          placeholder: 'i am placeholder',
     *          validate: function(event, value){
     *              if(!value){
     *                  return new Error('empty is not allowed');
     *              }
     *          },
     *          events: {
     *              click: function(){
     *                  alert('clicked');
     *              },
     *              error: function(e, validateResult){
     *                  // handle error
     *                  alert(validateResult.message);
     *              }
     *          }
     *      });
     *
     * @example
     *      new Editor({
     *          selector: 'textarea[name=abc]',
     *          value: 'hello',
     *          readonly: true,
     *          disabled: true
     *      });
     */
    var Editor = Textarea.inherit({
        /**
         * Render editor, add top and bottom panel and plug cursor plugin
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var $wrap = this.$wrap = this.$(wrapTemplate);

            if(!this.get('selector') && this.get('container')){
                this.$(this.get('container')).append($wrap);
                this.set('container', $wrap.find('.main'));
            }

            var ret = Textarea.prototype.render.apply(this, arguments);


            this.$topPanel = $wrap.find('.topPanel');
            this.$bottomPanel = $wrap.find('.bottomPanel');

            this.plug(Cursor);

            return ret;
        }
    });

    Editor.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Textarea.settings)
    });

    return Editor;
});