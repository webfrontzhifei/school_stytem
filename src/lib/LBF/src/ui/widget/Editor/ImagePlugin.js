/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-16 下午4:29
 */
LBF.define('ui.widget.Editor.ImagePlugin', function(require){
    var proxy = require('lang.proxy'),
        Uploader = require('util.Uploader'),
        Plugin = require('ui.Plugins.Plugin'),
        Popup = require('ui.Nodes.Popup'),
        ImageViewer = require('ui.widget.ImageViewer');

    var wrapTemplate = '<div class="Editor-topPanel-btn Editor-ImagePlugin-btn"><a class="btn" href="javascript:;">图片</a><a class="remove" href="javascript:;">X</a></div>';

    /**
     * Image plugin for editor. Select a local image, upload and submit with editor's content
     * @class ImagePlugin
     * @namespace ui.widget.Editor
     * @module ui
     * @submodule ui-widget
     * @extends ui.Plugins.Plugin
     * @requires util.Uploader
     * @requires ui.widget.ImageViewer
     * @constructor
     * @param {Object} opts Options for initialization
     * @param {String} [opts.name='EDITOR_IMAGE_PLUGIN'] Name of file input, which uploads image
     * @param {String} opts.url The address to upload image
     * @param {Number} [opts.maxWidth=400] Max-width for image viewer
     * @param {Number} [opts.maxHeight=400] Max-height for image viewer
     * @param {String} [opts.callbackName='EDITOR_IMAGE_PLUGIN_CALLBACK'] Callback name exposed to window for upload callback. Use this option only when CGI use a fixed callback name
     * @example
     *      editor.plug(ImagePlugin, {
     *          name: 'someImage',
     *          url: 'someCGI',
     *          maxWidth: 200,
     *          maxHeight: 200,
     *          callbackName: 'uploaded' // CGI use a fixed callback name 'uploaded'
     *      });
     */
    var ImagePlugin = Plugin.inherit({
        initialize: function(){
            Plugin.prototype.initialize.apply(this, arguments);

            this.render();
        },

        /**
         * Render image panel and add to editor's top panel
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var $el = this.$el = this.$(wrapTemplate);

            var $btn = this.$btn = this.find('.btn');

            this.find('.remove').click(proxy(this._removeImage, this));

            var imgViewer = this.imgViewer = new ImageViewer({
                srcElement: $btn,
                maxWidth: this.get('maxWidth'),
                maxHeight: this.get('maxHeight')
            }).hide().addClass('Editor-ImagePlugin-ImageViewer').arrowUp(true);
            imgViewer.hasImage = false;

            this.uploader = new Uploader({
                name: this.get('name'),
                url: this.get('url'),
                trigger: $btn,
                cbName: this.get('callbackName'),
                events: {
                    uploaded: proxy(this._uploaded, this)
                }
            });

            this.hover(
                proxy(this.showImgViewer, this),
                proxy(this.hideImgViewer, this)
            );

            this.node.$topPanel.append($el);
        },

        /**
         * Show image viewer
         * @method showImgViewer
         * @chainable
         */
        showImgViewer: function(){
            if(this.imgViewer.hasImage){
                this.imgViewer.update().show().justify();
            }
            return this;
        },

        /**
         * Hide image viewer
         * @method hideImgViewer
         * @chainable
         */
        hideImgViewer: function(){
            this.imgViewer.hide();
            return this;
        },

        /**
         * Uploaded callback function
         * @method _uploaded
         * @param {Event} event JQuery Event
         * @param {Object} response Upload response
         * @chainable
         * @private
         */
        _uploaded: function(event, response){
            if(response.r === 0){
                this._addImage(response);
                /**
                 * Fire when image uploaded
                 * @event ImagePlugin.uploaded
                 * @param {Event} event JQuery Event
                 * @param {Object} response Upload response
                 */
                this.node.trigger('ImagePlugin.uploaded', [response]);
                return this;
            }

            /**
             * Fire when image upload failed
             * @event ImagePlugin.fail
             * @param {Event} event JQuery Event
             * @param {Object} response Upload response
             */
            this.node.trigger('ImagePlugin.fail', [response]);
            return this;
        },

        /**
         * Add image to panel
         * @method _addImage
         * @param {Object} response Upload response
         * @chainable
         * @private
         */
        _addImage: function(response){
            //this.$btn.text(response.data.url);
            var picname = this.uploader.$el.val(),
                ext;

            picname = picname.substr(picname.lastIndexOf('\\') + 1);
            ext = picname.substr(picname.lastIndexOf('.') + 1);
            picname = picname.substr(0, picname.lastIndexOf('.'));
            picname = picname.length > 10 ? picname.substr(0, 4) + '…' + picname.substr(picname.length - 5) : picname;
            picname += '.' + ext;
            this.$btn.text(picname);

            this.imgViewer.find('img').prop('src', response.data.url);
            this.imgViewer.hasImage = true;

            this.find('.remove').show();

            this.addClass('Editor-ImagePlugin-btn-text');

            this.uploader.hide();

            /**
             * Fire when add a image
             * @event ImagePlugin.addImage
             * @param {Event} event JQuery event
             * @param {Object} response Upload response
             */
            this.node.trigger('ImagePlugin.addImage', [response]);

            return this;
        },

        /**
         * Remove uploaded image
         * @method _removeImage
         * @chainable
         * @private
         */
        _removeImage: function(){
            this.$btn.text('图片');
            this.imgViewer.find('img').prop('src', '');
            this.imgViewer.hasImage = false;
            this.find('.remove').hide();
            this.removeClass('Editor-ImagePlugin-btn-text');
            this.uploader.update().show().reset();

            /**
             * Fire when remove uploaded image
             * @event ImagePlugin.removeImage
             * @param {Event} event JQuery event
             */
            this.node.trigger('ImagePlugin.removeImage');
            return this;
        }
    });

    ImagePlugin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Image',

        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            name: 'EDITOR_IMAGE_PLUGIN',
            url: '',
            callbackName: 'EDITOR_IMAGE_PLUGIN_CALLBACK',
            maxWidth: 400,
            maxHeight: 400
        }
    });

    return ImagePlugin;
});