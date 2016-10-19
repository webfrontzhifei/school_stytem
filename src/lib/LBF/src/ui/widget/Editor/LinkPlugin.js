/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-13 下午1:09
 */
LBF.define('ui.widget.Editor.LinkPlugin', function(require){
    var proxy = require('lang.proxy'),
        validates = require('util.validates'),
        Plugin = require('ui.Plugins.Plugin'),
        TextInput = require('ui.Nodes.TextInput'),
        Popup = require('ui.Nodes.Popup'),
        Button = require('ui.Nodes.Button');

    var wrapTemplate = '<div class="Editor-topPanel-btn Editor-LinkPlugin-btn"><a class="btn" href="javascript:;">链接</a></div>';

    var linkTemplate = [
        '<span class="cover"></span>',
        '<input type="text" />',
        '<div class="btns">',
            '<div class="add"><span class="icon"></span>添&nbsp;&nbsp;加</div>',
            '<div class="add"><span class="icon"></span>添&nbsp;&nbsp;加</div>',
            '<div class="cancel">取&nbsp;&nbsp;消</div>',
        '</div>'
    ].join('');

    /**
     * Link plugin for editor
     * @class LinkPlugin
     * @namespace ui.widget.Editor
     * @module ui
     * @submodule ui-widget
     * @extends ui.Plugins.Plugin
     * @constructor
     * @param {Object} opts Options for initialization
     * @param {Function} opts.validate Validate function for link input
     * @param {Event} opts.validate.event JQuery event validate function accepted as 1st argument
     * @param {String} opts.validate.value Link input value that needs validation
     * @example
     *      editor.plug(LinkPlugin, {
     *          validate: function(event, value){
     *              // filter blank string
     *              if(value.replace(/\s/g/, '').length === 0){
     *                  // suggest return error object
     *                  return new Error('No empty string is allowed');
     *              }
     *
     *              // if validated ( passed ), return null
     *              return null;
     *          }
     *      });
     */
    var LinkPlugin = Plugin.inherit({
        /**
         * Wrap template of link panel
         * @property wrapTemplate
         * @type String
         */
        wrapTemplate: wrapTemplate,

        /**
         * Link input panel template
         * @property wrapTemplate
         * @type String
         */
        linkTemplate: linkTemplate,

        initialize: function(){
            Plugin.prototype.initialize.apply(this, arguments);

            this.render();
        },

        /**
         * Render link panel
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var $el = this.$el = this.$(this.wrapTemplate),
                opts = this.opts;

            this.$btn = this.find('a');

            var inputPanel = this.inputPanel = new Popup({
                container: this.node.$topPanel,
                content: this.linkTemplate
            }).addClass('Editor-Plugin-PopupPanel Editor-LinkPlugin-inputPanel');

            this.addButton = new Button({
                selector: inputPanel.find('.add')
            });

            this.cancelButton = new Button({
                selector: inputPanel.find('.cancel')
            });

            var input = this.input = new TextInput({
                selector: inputPanel.find('input'),

                placeholder: '输入链接地址',

                validate: opts.validate
            });

            this.bindUI();

            this.node.$topPanel.append($el);

            return this;
        },

        /**
         * Bind UI events
         * @method bindUI
         * @protected
         * @chainable
         */
        bindUI: function(){
            this.isPanelShow = false;
            this.$btn.click(proxy(this.showPanel, this));
            this.inputPanel.click(function(e){
                e.stopPropagation();
            });
            this.addButton.click(proxy(this.addLink, this));
            this.cancelButton.click(proxy(this.hidePanel, this));

            return this;
        },

        /**
         * Show link input panel
         * @method showPanel
         * @chainable
         */
        showPanel: function(){
            var $ = this.$,
                $btn = this.$btn,
                inputPanel = this.inputPanel;

            if(this.isPanelShow){
                return this;
            }

            this.isPanelShow = true;

            // set button state before getting it's offset
            $btn.addClass('on');

            var offset = $btn.outerPosition();
            inputPanel
                .css({
                    top: offset.top + $btn.outerHeight() - 3,
                    left: offset.left
                })
                .show();

            var hidePanel = this._hidePanel = proxy(this.hidePanel, this);
            setTimeout(function(){
                $(document).bind('click', hidePanel);
            }, 1);

            // focus to input
            // also solve placeholder position problem
            this.input.focus();

            return this;
        },

        /**
         * Hide link input panel
         * @method hidePanel
         * @chainable
         */
        hidePanel: function(){
            this.isPanelShow = false;
            this.inputPanel.hide();
            this.$btn.removeClass('on');
            $(document).unbind('click', this._hidePanel);
            return this;
        },

        /**
         * Add link text ( from input ) to editor
         * @method addLink
         * @param {String} link Link text
         * @chainable
         */
        addLink: function(link){
            var input = this.input;

            link = link || input.val();

            var error = input.validate(null, link);
            if(error){
                /**
                 * Fire when adding an invalidate ( according to link input panel's validation ) link to editor
                 * @event LinkPlugin.validateError
                 * @param {Event} event JQuery event
                 * @param {Error} error Validation error
                 * @param {String} link Link intended to add
                 */
                this.node.trigger('LinkPlugin.validateError', [error, link]);
                return this;
            }

            var linkText = '[' + input.val() + ']';
            this.node.append(linkText);
            this.hidePanel();

            /**
             * Fire when add an link to editor
             * @event LinkPlugin.addLink
             * @param {Event} event JQuery event
             * @param {String} link Link text add to editor
             */
            this.node.trigger('LinkPlugin.addLink', [linkText]);

            return this;
        }
    });

    LinkPlugin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Link',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            validate: function(event, val){
                if(!val || !validates.isLink(val)){
                    return new Error('Link validation failed');
                }

                return null;
            }
        }
    });

    return LinkPlugin;
});