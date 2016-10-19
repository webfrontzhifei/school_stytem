/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-16 下午4:34
 */
LBF.define('ui.widget.FileUploader.iframeUpload.iframeUpload', function(require){
    var proxy = require('lang.proxy'),
        browser = require('lang.browser'),
        Node = require('ui.Nodes.Node'),
        Button = require('ui.Nodes.Button'),
        isFunction = require('lang.isFunction'),
        Cookie = require('util.Cookie'),
        extend = require('lang.extend');

    var FRAME_NAME = 'LBF-UPLOADER',
        CALLBACK_NAME = 'LBFUPLOADER',
        QUEUE_ERROR = {
            //文件大小超过限制;
            FILE_EXCEEDS_SIZE_LIMIT : -110,

            //不是指定类型文件;
            INVALID_FILETYPE : -130
        };

    var count = 0;

    var genCallbackName = function(){
        var i = 0;
        return function(){
            return CALLBACK_NAME + ++i;
        }
    }();

    var iframeUpload = Node.inherit({
        initialize: function(opts){
            this.mergeOptions(opts);
            this.render();
            this.initEvents();
            this.initElements();

            //检测文件大小及允许上传类型;
            var type = this.get('file_types').replace(/\*\./g, '').replace(/;\s*/g, '|').replace(/\*/g, '.*');
            type = new RegExp('(' + type + ')$', 'i');
            this.set('fileTypes', type, {silent: true});

            var size = this.get('file_size_limit').toString().match(/(\d+)\s*(mb|b|gb|kb)?/i);
            if ( !size[2] )  {
                size = size[1];
            } else {
                switch( size[2].toLowerCase() ) {
                    case 'b':
                        size = size[1] / 1024;
                        break;
                    case 'kb':
                        size = size[1];
                        break;
                    case 'mb':
                        size = size[1] * 1024;
                        break;
                    case 'gb':
                        size = size[1] * 1024 * 1024;
                }
            }
            this.set('fileSizeLimit', size, {silent: true});
        },

        //type: selector or container;
        addTrigger: function(ele, type){
            var node = this,
                $form = this.$form.clone(true),
                loading = this.loading.clone(),
                type = type || 'selector';

            var $trigger = type === 'selector' ? ele : ele.addClass('lbf-fileUpload-container') && new Button({content: node.get('buttonText'), container: ele }).$el;

            node.update($form.find('.lbf-fileUpload-input'), ele);
            $trigger.addClass('lbf-fileUpload-trigger').append($form).after(loading);

            node.buttons.push($trigger);
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
                frameName = FRAME_NAME + ++count;
                $form = $('<form target="' + frameName + '" method="POST" enctype="multipart/form-data" encoding="multipart/form-data" class="lbf-fileUpload-form"><input type="hidden" /></form>');

            node.$frame = $('<iframe id="' + frameName + '" name="' + frameName + '" style="display:none;" src="javascript:false;"></iframe>').appendTo('body');

            node.buttons = [];
            node.setElement($('<input type="file" class="lbf-fileUpload-input"  />'));
            node.$el.prop('name', node.get('name'));

            node.setCbName(node.get('cbName') || genCallbackName());
            node.get('url') && node._setURL();
            node.$el.bind('change', function(){
                node.upload(this.files, this);
            });

            node.loading = $('<span class="lbf-loading"></span>');

            //附加用户自定义参数;
            var str = '',
                data = extend(this.get('data'), {
                    'file_size_limit': node.get('file_size_limit'),
                    'file_types': node.get('file_types')
                });

            for(var name in data){
				if(data.hasOwnProperty(name)) {
                	str += '<input type="hidden" name="' + name + '" value="' + data[name] + '" />';
				}
            }
            $form.append(str).append(node.$el);
            node.$form = $form;

            var type = node.get('selector') ? 'selector' : 'container';
            $(node.get(type)).each(function(){
                node.addTrigger($(this), type);
            });

            return this;
        },

        /**
         * Update file input position. In some cases, trigger node could be moved. Therefore, input position needs to be updated
         * @method update
         * @chainable
         */
        update: function(obj, trigger){
            var node = this,
                $trigger = trigger;

            // for security reason
            // $trigger should be in DOM, otherwise will cause position error
            // delay it to avoid some cases
            setTimeout(function(){
                obj.css({
                    width: node.get('triggerWidth') || $trigger.outerWidth(),
                    height: node.get('triggerHeight') || $trigger.outerHeight(),
                    top: 0,
                    left: 0
                }).show();
            }, 0);

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

        checkFileType: function() {
            var filePath = this.$trigger.val(),
                type = filePath.substring(filePath.lastIndexOf('.') + 1),
                allowedType = this.get('fileTypes'),
                flag = allowedType.test(type);

            if(!flag){
                this.stat.queue_errors += 1;
                this.trigger('uploadError', [{r: QUEUE_ERROR.INVALID_FILETYPE}, this.stat]);
                this.resetFileInput();
            }

            return flag;
        },

        checkFileSize: function(file) {
            var size = file ? (file.size || 0) / 1024 : -1,
                allowedSize = this.get('fileSizeLimit'),
                flag = allowedSize == 0 || size <= allowedSize;

            if(!flag){
                this.stat.queue_errors += 1;
                this.trigger('uploadError', [{r: QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT}, this.stat]);
                this.resetFileInput();
            }

            return flag;
        },

        resetFileInput: function(){
            var $trigger = this.$trigger;

            if( !this.$.browser.msie ) {
                $trigger.val('');
            } else {
                //ie下不能清空file input;
                var input = $trigger.clone(true);
                $trigger.replaceWith(input);
            }
        },

        /**
         * Submit form and upload file
         * @method upload
         * @param {String} [url] Submit target
         * @chainable
         */
        upload: function(files, trigger, url){
            var $ = this.$,
                files = files || [];

            this.uploading && this.cancel();

            this.$trigger = $(trigger);
            this.$loading = this.$trigger.parent().parent().siblings('.lbf-loading');

            //记录队列状态;
            this.stat = {
                //加入队列的文件数量;
                files_queued: 0,

                //成功上传的文件数量;
                successful_uploads: 0,

                //上传失败的文件数量;
                upload_errors: 0,

                //加入队列失败的文件数量;
                queue_errors: 0,

                // 'cancel' indicated canceled;
                status: 'normal'
            };

            if( this.checkFileType() && this.checkFileSize(files[0]) ){
                this.stat.files_queued = 1;

                //this.$frame.prop('src', 'javascript:false;');

                var $form = this.$trigger.parents('.lbf-fileUpload-form');

                url && this._setURL(url);
				
				var processData = this.get('processData');
					
				if(isFunction(processData)){
					var data = this.get('data');
					processData(data);
					
					for(var name in data){
						if(data.hasOwnProperty(name)) {
							$form.find('input[name="' + name + '"]').val(data[name]);
						}
					}
				}
				
                window[this._cbName] = proxy(function(res){
                    this._uploaded(res);
                    this._hideLoading();
                    this.resetFileInput();
                    this.uploading = false;
                }, this);

                /**
                 * Fire when a file starts uploading
                 * @event upload
                 * @param {Event} event JQuery event
                 * @param {Node} node Node object
                 * @param {Object} upload stats
                 */
                this.trigger('uploadStart', [this, this.stat]);
                this._showLoading();
                this.uploading = true;

                //防止触发验证，加上了[0];
                $form.prop('action', this.get('url'))[0].submit();
            }

            return this;
        },

        /**
         * Cancel uploading, and fire uploadCancel event
         * @method cancel
         * @chainable
         */
        cancel: function(){
            this.$frame.prop('src', 'javascript:false;');

            if(this.stat) {
                this.stat.status = 'cancel';
                this.stat.upload_errors += 1;
            }
            this.trigger('uploadCancel', [this]);
            this.trigger('uploadError', [{}, this.stat]);
            this.trigger('uploadComplete', [{}, this.stat]);
            this._hideLoading();
            this.uploading = false;
            this.resetFileInput();

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

        /**
         * Set(Update) upload target
         * @method _setURL
         * @param {String} url The target to be submit to.
         * @chainable
         */
        _setURL: function(url){
            url = url || this.get('url');

            if(url.indexOf('?') === -1) {
                url += '?type=upload&cb=?';
            } else if(url.indexOf('type=upload&cb=') === -1) {
                url += '&type=upload&cb=?';
            }
            this.set('url', url.replace('=?', '=' + this._cbName), {silent: true});

            return this;
        },

        _showLoading: function(){
            this.$loading.css('display', 'inline-block');
        },

        _hideLoading: function(){
            this.$loading.hide();
        },

        /**
         * Uploaded callback. Clear global point, and fire uploadError or uploadSuccess event
         * @method _uploaded
         * @chainable
         * @private
         */
        _uploaded: function(res){
            window[this._cbName] = null;

            if(res.r) {
                this.stat.upload_errors += 1;
                this.trigger('uploadError', [res, this.stat]);
            } else {
                this.stat.successful_uploads += 1;
                this.trigger('uploadSuccess', [res, this.stat]);
            }

            this.trigger('uploadComplete', [res, this.stat]);

        }
    });

    return iframeUpload;
});