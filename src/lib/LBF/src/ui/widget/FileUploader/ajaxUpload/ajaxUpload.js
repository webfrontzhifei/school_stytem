/**
 * @fileOverview
 * @author seanxphuang
 * @version 1
 * Created: 13-9-29  下午16:00
 */

LBF.define('ui.widget.FileUploader.ajaxUpload.ajaxUpload', function(require){
    var proxy = require('lang.proxy'),
        Node = require('ui.Nodes.Node'),
        Button = require('ui.Nodes.Button'),
        isFunction = require('lang.isFunction'),
        Cookie = require('util.Cookie');

    var QUEUE_ERROR = {
            //文件大小超过限制;
            FILE_EXCEEDS_SIZE_LIMIT : -110,

            //不是指定类型文件;
            INVALID_FILETYPE : -130
        };

    var ajaxUpload = Node.inherit({
        initialize: function(opts){
            this.mergeOptions(opts);
            this._adjustUrl();
            this.render();

            this._attachDragDrop();

            //检测文件大小及允许上传类型;
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

            var type = this.get('file_types').replace(/\*\./g, '').replace(/;\s*/g, '|').replace(/\*/g, '.*');
            type = new RegExp('(' + type + ')$', 'i');
            this.set('fileTypes', type, {silent: true});

        },

        //type: selector or container;
        addTrigger: function(ele, type){
            var node = this,
                input = this.$el.clone(true),
                loading = this.loading.clone(),
                type = type || 'selector';

            var $trigger = type === 'selector' ? ele : ele.addClass('lbf-fileUpload-container') && new Button({content: node.get('buttonText'), container: ele }).$el;

            node.update(input, ele);
            $trigger.addClass('lbf-fileUpload-trigger').append(input).after(loading);

            node.buttons.push($trigger);
        },

        render: function(){
            var node = this,
                $ = this.$;

            node.buttons = [];

            node.setElement($('<input type="file" class="lbf-fileUpload-input"  />'));

            !node.get('singleUpload') && node.$el.prop('multiple', 'multiple');
            node.$el.prop('name', node.get('name'));

            node.$el.bind('change', function(){
                node.upload(this.files, this);
            });

            node.loading = $('<span class="lbf-loading"></span>');

            var type = node.get('selector') ? 'selector' : 'container';
            $(node.get(type)).each(function(n){
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

        checkFileType: function(file, files) {
            var type = file.type,
                allowedType = this.get('fileTypes'),
                flag = allowedType.test(type);

            if(!flag){
                this.stat.queue_errors += 1;
                this.trigger('uploadError', [{r: QUEUE_ERROR.INVALID_FILETYPE}, this.stat]);
                files.length == 1 && this.resetFileInput();
            }

            return flag;
        },

        checkFileSize: function(file, files) {
            var size = file.size / 1024,
                allowedSize = this.get('fileSizeLimit'),
                flag = allowedSize == 0 || size <= allowedSize;

            if(!flag){
                this.stat.queue_errors += 1;
                this.trigger('uploadError', [{r: QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT}, this.stat]);
                files.length == 1 && this.resetFileInput();
            }

            return flag;
        },

        upload: function(files, trigger){
            var node = this,
                $ = node.$,
                file;
			
			//再次添加时合入新文件;
            if(!node.uploading) {
				node.queue = [];
				node.$trigger = $(trigger);
				node.$loading = node.$trigger.parent().siblings('.lbf-loading');
	
				//记录队列状态;
				node.stat = {
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
			}

            //addQueue;
            for(var i = 0; i < files.length; i++){
                file = files[i];
                if( node.checkFileType(file, files) && node.checkFileSize(file, files) ){
                    node.queue.push(file);
                    node.stat.files_queued += 1;
                }

                if( node.get('singleUpload') ) {
                    break;
                }
            }

            if(node.queue.length === 0){
                return false;
            }

            if(!node.uploading) {
				node._showLoading();
				node.uploading = true;
	
				node._sendFiles();
			}
			
			node.trigger('uploadStart', [node, node.stat]);

            return node;
        },

        resetFileInput: function(){
            $trigger = this.$trigger;

            if( !this.$.browser.msie ) {
                $trigger.val('');
            } else {
                //ie下不能清空file input;
                var input = $trigger.clone(true);
                $trigger.replaceWith(input);
            }
        },

        _sendFiles: function(){
            var node = this,
                formdata = new FormData(),
                $ = this.$,
				queue = node.queue;

            formdata.append( 'lbf-file-upload', queue[0] );
            formdata.append( 'file_size_limit', node.get('file_size_limit') );
            formdata.append( 'file_types', node.get('file_types') );
			
			var processData = node.get('processData'),
				data = node.get('data');
					
			isFunction(processData) && processData(data);

            //附加用户自定义参数;
            for(var name in data){
				if(data.hasOwnProperty(name)) {
                	formdata.append( name, data[name] );
				}
            }

            node.xhr = $.ajax({
                url: node.get('url'),
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                success: function (data) {
                    var json;
					
					if($.isPlainObject(data)) {
						json = data;	
					} else {
						try{
							json = $.parseJSON(data);
						} catch(e) {
							json = {};
						}
					}

                    if( $.isEmptyObject(json) || json.r ){
                        node.stat.upload_errors += 1;
                        node.trigger('uploadError', [json, node.stat]);
                    } else {
                        node.stat.successful_uploads += 1;
                        node.trigger('uploadSuccess', [json, node.stat]);
                    }

                },
                error: function(data){
                    node.stat.upload_errors += 1;
                    data.r = data.status;
                    node.trigger('uploadError', [data, node.stat]);
                },
                complete: function(data){
                    queue.shift();

                    //如果队列文件上传完成，或者是用户取消上传，那么触发uploadComplete;
                    if( queue.length === 0 || node.stat.status === 'cancel' ) {
                        node._hideLoading();
                        node.resetFileInput();
						
						node.uploading = false;
						node.trigger('uploadComplete', [data, node.stat]);
                    } else {
                        node._sendFiles();
                    }

                    formdata = null;
                }
            });

        },

        /**
         * Cancel uploading
         * @method cancel
         * @chainable
         */
        cancel: function(){
            this.stat && ( this.stat.status = 'cancel' );

            this.xhr && this.xhr.abort();

            /**
             * Fire when upload canceled
             * @event cancel
             * @param {Event} event JQuery event
             * @param {Node} node Node object
             */
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

        _showLoading: function(){
            this.$loading.show();
        },

        _hideLoading: function(){
            this.$loading.hide();
        },

        _adjustUrl: function(){
            var url = this.get('url');

            url += url.indexOf('?') === -1 ? '?type=upload' : '&type=upload';

            this.set('url', url, {silent: true});
        },

        _attachDragDrop: function(){
            var node = this,
                $ = this.$,
                dropbox = node.get('dropbox') && $( node.get('dropbox')) || $(document);

            dropbox.each(function(){
                var me = this;
                me.addEventListener("dragenter", function(e){
                    $(me).addClass('lbf-draghover');

                    e.stopPropagation();
                    e.preventDefault();
                }, false);

                me.addEventListener("dragover", function(e){
                    e.stopPropagation();
                    e.preventDefault();
                }, false);

                me.addEventListener("drop", function(e){
                    $(me).removeClass('lbf-draghover');

                    e.stopPropagation();
                    e.preventDefault();

                    var trigger = $(me).find('.lbf-fileUpload-input').get(0);
                    node.upload(e.dataTransfer.files, trigger);
                }, false);

                me.addEventListener("dragleave", function(e){
                    $(me).removeClass('lbf-draghover');
                }, false);
            });

        }
    });

    return ajaxUpload;

});