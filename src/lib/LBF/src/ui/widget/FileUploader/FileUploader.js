/**
 * @fileOverview
 * @author seanxphuang
 * @version 1
 * Created: 13-9-23  上午11:00
 */

LBF.define('ui.widget.FileUploader.FileUploader', function(require){
    var $ = require('lib.jQuery'),
        Node = require('ui.Nodes.Node');

    require('{theme}/lbfUI/css/FileUploader.css');

    if ( window.FormData ) {
        require.async(['ui.widget.FileUploader.ajaxUpload.ajaxUpload']);
    }

    /**
     * 文件上传组件，会根据浏览器不同选用ajax、iframe、flash等三种上传方式.
     * @class FileUploader
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} opts Options for initialization
     * @param {String} opts.url url地址，必需，指定后台cgi
     * @param {String|Dom|$} [opts.selector] 对象或选择符，指定触发按钮的初始化对象，一个实例可以有多个触发按钮
     * @param {String|Dom|$} [opts.container] 对象或选择符，指定生成触发按钮的容器，一个实例可以有多个触发按钮
     * @param {String} [opts.flashUrl] 字符串，指定swfupload文件路径，默认跟url参数指定路径同目录
     * @param {Boolean} [opts.singleUpload] 布尔值，单文件还是多文件上传
     * @param {String} [opts.dropbox] 选择符，文件拖拽上传时的感应容器
     * @param {Number} [opts.triggerWidth] 数值，指定触发按钮的宽度
     * @param {Number} [opts.triggerHeight] 数值，指定触发按钮的高度
     * @param {String} [opts.file_size_limit] 字符串，限定文件大小，'0' | '20 b/kb/mb/gb'，默认为0表示不限制大小，默认单位KB
     * @param {String} [opts.file_types] 字符串，限定文件类型，默认为 "*.jpg;*.gif;*.jpeg;*.png;*.bmp"
     * @param {String} [opts.buttonText] 字符串，指定触发按钮上显示的文字
     * @param {Object} [opts.data] 对象，附加自定义参数
     * @example
     *      new FileUploader({
	 *	        url: 'demo.php',
	 *	        flashUrl: 'swfupload.swf',
	 *	        dropbox: '.dragdrop',
	 *	        selector: '.lbf-ImageCrop',
     *          data: {
     *               user: 'sean',
     *               age: 18
     *          },
     *          container: '.lbf-ImageCrop',
     *          singleUpload: true,
     *          file_size_limit: '200kb'
	 *     })
     */
    var FileUploader = Node.inherit({
        initialize: function(opts){
            var node = this;
            node.mergeOptions(opts);

            var settings = node.attributes();

            if ( window.FormData ) {
                require.async(['ui.widget.FileUploader.ajaxUpload.ajaxUpload'], function(ajaxUpload){
                    var instance = new ajaxUpload(settings);
                    node['instance'] = instance;
                    node._attachEvent();
                    node.trigger('loaded');
                });

            } else if( !settings.singleUpload ) {
                require.async(['ui.widget.FileUploader.swfUpload.init'], function(swfUpload){
                    var instance = new swfUpload(settings);
                    node['instance'] = instance;
                    node._attachEvent();
                    node.trigger('loaded');
                });

            } else {
                require.async(['ui.widget.FileUploader.iframeUpload.iframeUpload'], function(iframeUpload){
                    var instance = new iframeUpload(settings);
                    node['instance'] = instance;
                    node._attachEvent();
                    node.trigger('loaded');
                });

            }

        },

        /**
         * 取消上传
         * @method cancel
         */
        cancel: function(){
            var node = this;
            if( !node['instance']){
                node.bind('loaded', function(){
                    node['instance'].cancel();
                });
            } else {
                node['instance'].cancel();
                node.cancel = function(){
                    var node = this;
                    node['instance'].cancel();
                };
            }
        },

        /**
         * 禁用上传
         * @method disable
         * @param {Number} [index] 指定第几个按钮被禁用, 不传入会禁用所有按钮
         */
        disable: function(index){
            var node = this;
            if( !node['instance']){
                node.bind('loaded', function(){
                    node['instance'].disable(index);
                });
            } else {
                node['instance'].disable(index);
                node.disable = function(index){
                    var node = this;
                    node['instance'].disable(index);
                };
            }
        },

        /**
         * 启用上传
         * @method enable
         * @param {Number} [index] 指定第几个按钮被启用，不传入会启用所有按钮
         */
        enable: function(index){
            var node = this;
            if( !node['instance']){
                node.bind('loaded', function(){
                    node['instance'].enable(index);
                });
            } else {
                node['instance'].enable(index);
                node.enable = function(index){
                    var node = this;
                    node['instance'].enable(index);
                };
            }
        },
        _attachEvent: function(){
            var node = this;

            this['instance'].bind('uploadStart', function(){
                var args = Array.prototype.slice.call(arguments, 1);

                /**
                 * Fire when upload start
                 * @event uploadStart
                 * @param {Event} event JQuery event
                 * @param {Node} node Node object
                 * @param {Object} stats uploaded files stats
                 */
                node.trigger('uploadStart', args);
            });

            this['instance'].bind('uploadCancel', function(){
                var args = Array.prototype.slice.call(arguments, 1);

                /**
                 * Fire when upload canceled
                 * @event cancel
                 * @param {Event} event JQuery event
                 * @param {Node} node Node object
                 */
                node.trigger('uploadCancel', args);
            });

            this['instance'].bind('uploadError', function(){
                var args = Array.prototype.slice.call(arguments, 1);

                /**
                 * Fire when upload error
                 * @event uploadError
                 * @param {Event} event JQuery event
                 * @param {Object} opts server response data
                 * @param {Object} stats uploaded files stats
                 */
                node.trigger('uploadError', args);
            });

            this['instance'].bind('uploadSuccess', function(){
                var args = Array.prototype.slice.call(arguments, 1);

                /**
                 * Fire when upload successed
                 * @event uploadSuccess
                 * @param {Event} event JQuery event
                 * @param {Object} opts server response data
                 * @param {Object} opts.r status code
                 * @param {Object} opts.msg message
                 * @param {Object} opts.data {url: '', show_url:''}
                 * @param {Object} stats uploaded files stats
                 */
                node.trigger('uploadSuccess', args);
            });

            this['instance'].bind('uploadComplete', function(){
                var args = Array.prototype.slice.call(arguments, 1);

                /**
                 * Fire when upload complete
                 * @event uploadComplete
                 * @param {Event} event JQuery event
                 * @param {Object} opts server response data
                 * @param {Object} stats uploaded files stats
                 */
                node.trigger('uploadComplete', args);
            });
        }
    });

    FileUploader.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
            //单文件还是多文件上传;
            singleUpload: true,

            buttonText: '选择文件',
            //container: '.lbf-FileUploader',
            name: 'lbf-file-upload',

            //用户附加自定义参数;
            data: {},
			
			//对即将发送的数据进行预处理;
			processData: function(data){
				//data是上面用户附加的参数;
			},
			
            file_size_limit : 0,
            file_types : "*.jpg;*.gif;*.jpeg;*.png;*.bmp"
        }
    });

    return FileUploader;
});