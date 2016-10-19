/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-16 下午4:34
 */
LBF.define('ui.widget.FileUpload.FileUpload', function(require){
    var proxy = require('lang.proxy'),
        browser = require('lang.browser'),
        Node = require('ui.Nodes.Node');

    var FRAME_NAME = 'LBF-UPLOADER',
        CALLBACK_NAME = 'LBFUPLOADER';

    var count = 0;

    var genCallbackName = function(){
        var i = 0;
        return function(){
            return CALLBACK_NAME + ++i;
        }
    }();

    /**
     * Common file uploader. Will extend to support n files upload in near future.
     * @class Uploader
     * @namespace util
     * @module util
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} opts Options of uploader
     * @param {String} [opts.method="post"] Upload method
     * @param {String} [opts.target="LBF-UPLOADER-file"] Upload file input's name
     * @param {String} [opts.cbName="LBFUPLOADERn"] Name of upload callback function
     * @param {Object} [opts.trigger] The node trigger file selection
     * @param {Object} [opts.url] The target to be submit to. Use ? as placeholder of cbName.
     * @example
     *      new Uploader({
     *          target: 'uploadName',
     *          cbName: 'uploadCallback',
     *          trigger: 'fileSelectBtnSelector',
     *          url: 'address'
     *      });
     */
    var FileUpload = Node.inherit({
        initialize: function(opts){
            this.mergeOptions(opts);
            this.render();
            this.initEvents();
            this.initElements();
        },

        /**
         * Render and bind UI events. Invisible file input should be place exactly on top of trigger node.
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var node = this,
                $ = this.$,
                $el = this.$el = $('<input type="file" style="display:none;" />'),
				$fileUploadContainner = this.$fileUploadContainner = $('<span class="lbf-file-upload"></span>'),
                frameName = FRAME_NAME + ++count,
                $frame = this.$frame = $('<iframe id="' + frameName + '" name="' + frameName + '" style="display:none;"></iframe>'),
                $form = this.$form = $('<form target="' + frameName + '" enctype="multipart/form-data" encoding="multipart/form-data"></form>');
            $form.prop('method', node.get('method'));
			$form.css({
				margin: 0	
			});
            $el.prop('target', node.get('target'));
            this.setCbName(node.get('cbName') || genCallbackName());
            node.get('url') && this.setURL(node.get('url'));

            this.change(proxy(function(){
                this.upload();
            }, this));

            var $trigger = this.$trigger = $(node.get('trigger'));

            node.css({
                opacity: 0,
                position: 'absolute',
                zIndex: 2
            });
            this.update();

            $form.append($el);
			$trigger.wrap($fileUploadContainner);

			$trigger.parent().css({
				'display': 'inline',
				'zoom': 1,
				'display': 'inline-block'	
			});
			$trigger.parent().append($frame).append($form);
			
			//弥补trigger不能触发hover和active效果
			$trigger.parent().hover(
				function(){
					$trigger.addClass(node.get('hoverClassName'));
				},
				function(){
					$trigger.removeClass(node.get('hoverClassName'));
					$trigger.removeClass(node.get('activeClassName'));
				}
			);
			$trigger.parent().mousedown(function(){
				$trigger.addClass(node.get('activeClassName'));
			});
			$trigger.parent().mouseup(function(){
				$trigger.removeClass(node.get('activeClassName'));
			});

            return this;
        },

        /**
         * Update file input position. In some cases, trigger node could be moved. Therefore, input position needs to be updated
         * @method update
         * @chainable
         */
        update: function(){
            var node = this,
                $trigger = this.$trigger;

            // for security reason
            // $trigger should be in DOM, otherwise will cause position error
            // delay it to avoid some cases
            setTimeout(function(){
                node.css({
                    width: $trigger.outerWidth(),
                    height: $trigger.outerHeight(),
                    top: $trigger.position().top,
                    left: $trigger.position().left
                }).show();
            }, 0);

            return this;
        },

        /**
         * Set(Update) upload target
         * @method setURL
         * @param {String} url The target to be submit to. Use ? as placeholder of cbName.
         * @chainable
         */
        setURL: function(url){
            this.url = url.replace('=?', this._cbName);
            return this;
        },

        /**
         * Set(Update) the name of upload callback function
         * @param {String} name Callback function name
         * @chainable
         */
        setCbName: function(name){
            this._cbName = name;
            return this;
        },

        /**
         * Submit form and upload file
         * @method upload
         * @param {String} [url] Submit target
         * @chainable
         */
        upload: function(url){
            var $form = this.$form;

            url && this.setURL(url);

            window[this._cbName] = proxy(this._uploaded, this);

            $form.prop('action', this.url).submit();

            /**
             * Fire when a file starts uploading
             * @event upload
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('upload', [this]);

            return this;
        },

        /**
         * Cancel uploading
         * @method cancel
         * @chainable
         */
        cancel: function(){
            this.$frame.prop('src', 'javascript:false;');

            /**
             * Fire when upload canceled
             * @event cancel
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
            this.trigger('cancel', [this]);

            return this;
        },

        /**
         * Reset file input to empty(No file is selected)
         * @method reset
         * @chainable
         */
        reset: function(){
            this.val('');
            return this;
        },

        /**
         * Uploaded callback. Clear global point, and fire uploaded event
         * @method _uploaded
         * @chainable
         * @private
         */
        _uploaded: function(){
            window[this._cbName] = null;

            /**
             * Fire when file uploaded, event payload depends on callback arguments
             * @event uploaded
             * @param {Event} event JQuery event
             * @example
             *      // assume callback name is 'cb'
             *      // upload response is cb(attr1, attr2, ...)
             *      uploader.bind('uploaded', function(event, attr1, attr2, ..){
             *          // uploaded handler
             *      });
             */
            this.trigger('uploaded', arguments);

            return this;
        }
    });

    FileUpload.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            method: 'post',
            target: '#demo-file-upload',
			hoverClassName: 'lbf-file-upload-hover',
			activeClassName: 'lbf-file-upload-focus'
        }
    });

    return FileUpload;
});