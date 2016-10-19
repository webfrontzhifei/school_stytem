/**
 * @fileOverview
 * @author seanxphuang
 * @version 1
 * Created: 13-10-17  上午10:00
 */

LBF.define('ui.widget.FileUploader.swfUpload.init', function(require){
    var $ = require('lib.jQuery'),
        proxy = require('lang.proxy'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node'),
        Button = require('ui.Nodes.Button'),
        isFunction = require('lang.isFunction'),
        Cookie = require('util.Cookie');

    var count = 0;

    //flash需要全局的SWFUpload对象;
    window.SWFUpload = require('ui.widget.FileUploader.swfUpload.swfUploadQueue');

    var swfUpload = Node.inherit({
        initialize: function(opts){
            var node = this;
            opts.file_post_name = opts.name;
            node.mergeOptions(opts);

            node._adjustUrl();

            var flashUrl = node.get('flashUrl') || node._getFlashUrl( node.get('url') );
            node.set('flash_url', flashUrl);

            node.get('post_params')['file_size_limit'] = node.get('file_size_limit');
            node.get('post_params')['file_types'] = node.get('file_types');

            var settings = node.attributes();
            settings.file_dialog_complete_handler = proxy(fileDialogComplete, this);
            settings.file_queue_error_handler = proxy(fileQueueError, this);
            settings.upload_error_handler = proxy(uploadError, this);
            settings.upload_success_handler = proxy(uploadSuccess, this);
            settings.queue_complete_handler = proxy(uploadComplete, this);

            this.render(settings);
        },

        //type: selector or container;
        addTrigger: function(ele, type, settings){
            var node = this,
                loading = this.loading.clone(),
                type = type || 'selector',
                $trigger;

            if( type === 'selector' ) {
                $trigger = ele;
            } else {
                var $fileUploadContainner = ele.addClass('lbf-fileUpload-container');

                $trigger = new Button({
                    content: node.get('buttonText'),
                    container: $fileUploadContainner
                }).$el;
            }

            var width = node.get('triggerWidth') || $trigger.outerWidth(),
                height = node.get('triggerHeight') || $trigger.outerHeight();

            settings['button_width'] = width;
            settings['button_height'] = height;

            var buttonId = "lbf-swfUpload" + ++count;
            $trigger.addClass('lbf-fileUpload-trigger').append('<span class="lbf-swfUpload"><span id="' + buttonId + '"></span></span>').after(loading);
            settings['button_placeholder_id'] = buttonId;

            settings.file_dialog_start_handler = function(){
                node.uploading && node.cancel();

                node.uploader = swfupload;
                node.$loading = loading;
            };

            var swfupload = new SWFUpload(settings);

            node.buttons.push($trigger);
        },

        render: function(settings){
            var node = this,
                type = node.get('selector') ? 'selector' : 'container';

            node.buttons = [];
            node.loading = $('<span class="lbf-loading"></span>');

            $(node.get(type)).each(function(n){
                node.addTrigger($(this), type, settings);
            });

            return this;
        },

        cancel: function(){
            var queued = this.uploader.getStats().files_queued;

            for(var i = 0; i < queued; i++){
                this.uploader.cancelUpload();
            }

            this.trigger('uploadCancel', [this]);

            this._hideLoading();
            this.uploading = false;

            return this;
        },

        disable: function(index){
            var $ = this.$,
                node = this;

            if(index === undefined) {
                $.each(node.buttons, function(i, btn){
                    btn.addClass('lbf-fileUpload-disabled');
                });
            } else {
                node.buttons[index] && node.buttons[index].addClass('lbf-fileUpload-disabled');
            }

        },

        enable: function(index){
            var $ = this.$,
                node = this;

            if(index === undefined) {
                $.each(node.buttons, function(i, btn){
                    btn.removeClass('lbf-fileUpload-disabled');
                });
            } else {
                node.buttons[index] && node.buttons[index].removeClass('lbf-fileUpload-disabled');
            }
        },

        /*
         * 根据上传处理文件的路径获取flash文件的路径
         * flash文件需与上传处理文件在同一目录
         */
        _getFlashUrl: function(url){
            var flashName = 'swfupload.swf',
                flashRoot = '';

            if( /http/.test(url) ) {
                flashRoot = url.substring( 0, url.lastIndexOf('/') + 1 );
            } else {
                flashRoot = window.location.href;
                flashRoot = flashRoot.substring( 0, flashRoot.lastIndexOf('/') + 1 );

                if ( url.indexOf('/') === 0 ) {
                    flashRoot = window.location.protocol + '//' + window.location.host + '/';
                } else if ( url.indexOf('/') ) {
                    flashRoot += url.substring( 0, url.lastIndexOf('/') + 1 );
                }
            }

            return flashRoot + flashName;
        },

        _showLoading: function(){
            this.$loading.css('display', 'inline-block');
        },

        _hideLoading: function(){
            this.$loading.css('display', 'none');
        },

        _adjustUrl: function(){
            var url = this.get('url');

            url += url.indexOf('?') === -1 ? '?type=upload' : '&type=upload';

            this.set('upload_url', url);
        }
    });

    /**
     * selected: files selected
     * queued: files added into the queue
     * total: total files in the queue
     */
    var fileDialogComplete = function(selected, queued, total) {
            if(queued > 0){
                this._showLoading();

                var processData = this.get('processData'),
					data = this.get('data');
					
				isFunction(processData) && processData(data);
				
				for(var name in data){
					if(data.hasOwnProperty(name)) {
						this.uploader.addPostParam(name, data[name]);
					}
				}

                var stat = this.uploader.getStats();
				stat.files_queued = stat.successful_uploads + stat.upload_errors + stat.files_queued;
				
                this.trigger('uploadStart', [this, stat]);
                this.uploader.startUpload();

                this.uploading = true;
            }
        },

        //单个文件加入失败就会触发一次;
        fileQueueError = function(fileObj, code, message){
            var stat = this.uploader.getStats();
			stat.files_queued = stat.successful_uploads + stat.upload_errors + stat.files_queued;
			
            this.trigger('uploadError', [{r: code, msg: message}, stat]);
        },

        //单个文件加入失败就会触发一次;
        uploadError = function(fileObj, code, message) {
            var stat = this.uploader.getStats();
			stat.files_queued = stat.successful_uploads + stat.upload_errors + stat.files_queued;
			
            this.trigger('uploadError', [{r: code, msg: message}, stat]);
        },

        //单个文件加入失败就会触发一次;
        uploadSuccess = function(file, serverData) {
            var json;
            try{
                json = $.parseJSON(serverData);
            } catch(e) {
                json = {};
            }

            var stat = this.uploader.getStats();
			stat.files_queued = stat.successful_uploads + stat.upload_errors + stat.files_queued;
			
            if( $.isEmptyObject(json) || json.r ){
                this.trigger('uploadError', [json, stat]);
            } else {
                this.trigger('uploadSuccess', [json, stat]);
            }

        },

        //所有文件都上传完成时触发;
        uploadComplete = function() {
            this._hideLoading();

            var stat = this.uploader.getStats();
			stat.files_queued = stat.successful_uploads + stat.upload_errors + stat.files_queued;
			
            this.trigger('uploadComplete', [{}, stat]);
			
			this.uploader.setStats({
				successful_uploads: 0,
				upload_errors: 0,
				files_queued: 0
			});

            this.uploading = false;
        };

    swfUpload.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            button_placeholder_id: "lbf-swfUpload",
            file_types_description : "files",
            file_queue_limit : 0,
            debug: false,
            button_action: SWFUpload.BUTTON_ACTION.SELECT_FILES,
            button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,
            file_upload_limit : 0,
            post_params: {}
        }
    });

    //清除上传对象;
    window.onbeforeunload = function(){
        for (var i = 0; i < SWFUpload.instances.length; i++ ) {
            SWFUpload.instances[i].destroy();
        }
    }

    return swfUpload;

});
