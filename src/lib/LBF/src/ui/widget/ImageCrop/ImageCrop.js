/**
 * @fileOverview
 * @author seanxphuang
 * @version 1
 * Created: 13-9-25  上午10:00
 */

LBF.define('ui.widget.ImageCrop.ImageCrop', function(require){
    var Node = require('ui.Nodes.Node'),
        $ = require('lib.jQuery'),
		isFunction = require('lang.isFunction'),
        ConfirmPanel = require('ui.widget.Panel.ConfirmPanel'),
        extend = require('lang.extend'),
        FileUploader = require('ui.widget.FileUploader.FileUploader'),
        imageLoader = require('util.imageLoader');

    require('{theme}/lbfUI/css/ImageCrop.css');

    //需要加载mouseWheel插件;
    require('ui.widget.ImageCrop.mouseWheel');

    var KEY = {
            RIGHT: 39,
            LEFT: 37,
            TOP: 38,
            DOWN: 40
        };

    /**
     * 图片裁切组件
     * @class ImageCrop
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
     * @param {Number} [opts.cropWidth] 数值，指定裁切宽度
     * @param {Number} [opts.cropHeight] 数值，指定裁切高度
     * @param {Boolean} [opts.resizable] 布尔值，需不需要动态变更裁切尺寸
     * @param {String} [opts.cropRange] 字符串，限定裁切的最小、最大宽高，默认值 '0|0|0|0' 表示不限制，前面的'0|0'分别表示宽度的最小和最大值，后面的'0|0'分别表示高度的最小和最大值
     * @param {Boolean} [opts.onUploadSilence] 布尔值，图片上传完成后裁切窗口不自动显示图片，默认false
     * @param {Object} [opts.panelText] 对象，设定裁切窗口的显示文字，panelText:{title:'图片裁切',size:'裁切尺寸：',width:'宽',height:'高'}
     * @example
     *      new ImageCrop({
     *           url: 'demo.php',
     *           cropWidth: 300,
     *           cropHeight: 200,
     *           dropbox: '.dragdrop',
     *           container: '.lbf-ImageCrop',
     *           resizable: true,
     *           cropRange: '100|600|100|600',
     *           panelText: {
     *               title:'头像裁切',
     *               size:'头像尺寸：'
     *           },
	 *			 data: {},
	 *			 processData: function(data){}
     *       });
     */
    var ImageCrop = Node.inherit({
        initialize: function(opts){
            //单文件上传;
            opts.singleUpload = true;

            this.mergeOptions(opts);
            this.render();
            this.initEvents();
            this.initElements();
        },

        render: function(){
            var node = this;

            //窗口尺寸比率;
            node.set( 'areaRatio', node.get('cropAreaWidth') / node.get('cropAreaHeight') );

            node.panel = new ConfirmPanel({
                title: node.get('panelText').title,
                content: node.get('contentTemplate'),
                width: 560,
                disposable: false,
                //drag: false,
                centered: true,
                events: {
                    ok: function(){
                        node.crop();
                    },
                    cancel: function(){
                        this.hide();
                        node.cancelCrop();
                    },
                    close: function(){
                        this.hide();
                        node.cancelCrop();
                    }
                }
            }).hide();
            node.panel.$el.addClass('lbf-winCrop');
            node.$msgTip = $('<span class="lbf-crop-msgTip"></span>').appendTo(node.panel.$el.find('.lbf-panel-foot'));
            if (node.get('resizable')) {
                node.$resize = $('<div class="lbf-crop-resize"><label>' + node.get('panelText').size + ' </label><input type="text" /> ' + node.get('panelText').width + ' - <input type="text" /> ' + node.get('panelText').height + '</div>').appendTo( node.panel.$el.find('.lbf-panel-foot') );
            }

            node.$cropArea = node.panel.$el.find('.lbf-crop-area');
            node.$cropTop = node.panel.$el.find('.lbf-crop-top');
            node.$cropRight = node.panel.$el.find('.lbf-crop-right');
            node.$cropBottom = node.panel.$el.find('.lbf-crop-bottom');
            node.$cropLeft = node.panel.$el.find('.lbf-crop-left');
            node.$cropBox = node.panel.$el.find('.lbf-crop-cropBox');
            node.$img = $('<img src="' + node.get('img').show_url + '">').appendTo(node.$cropArea);
            node.$zoomBar = node.panel.$el.find('.lbf-crop-zoombar');
            node.$zoomBarHandler = node.$zoomBar.find('.lbf-crop-handler');
            node.$zoomTip = node.$zoomBarHandler.find('.lbf-crop-zoomTip');

            node.get('useFileUploader') && node._createUpload( node.attributes() );

            node._attachEvents();

            node.init();
        },

        init: function(){
            this.$cropArea.css({
                width: this.get('cropAreaWidth'),
                height: this.get('cropAreaHeight')
            });

            this.setCropSize();
            this._refresh();
        },

        /**
         * 显示裁切窗口
         * @method showPanel
         * @param {String|Object} 裁切图片的地址 | [imgobj] 裁切图片的一些参数值
         * @param {String} [imgobj.url] 图片地址
         * @param {String} [imgobj.show_url] 用作显示的图片地址（针对https的情况）
         * @param {Number} [imgobj.width] 图片宽度
         * @param {Number} [imgobj.height] 图片高度
         * @param {Boolean} [silence] 显示裁切窗口时是否显示裁切图片
         */
        showPanel: function(imgobj, silence){
			var node = this;
			
            node.panel.show();

            if($.type(imgobj) === 'object'){
				extend(node.get('img'), imgobj);
                !silence && node.loadImg(imgobj.show_url || imgobj.url);
            } else if($.type(imgobj) === 'string') {
                extend(node.get('img'), {
                    url: imgobj
                });
				!silence && node.loadImg(imgobj);
			}
        },

        /**
         * 加载需要裁切的图片
         * @method loadImg
         * @param {String} src 图片地址
         */
        loadImg: function(src, callback){
            var node = this;

            node.$cropArea.addClass('lbf-cropArea-loading');
            imageLoader(src, function(img){
				var imgObj = node.get('img');
				imgObj.width = img.width || imgObj.width || 500; //某些情况下img对象获取的宽高为0
				imgObj.height = img.height || imgObj.height || 500;
				
				node.set( 'maxZoom', Math.max(5, Math.floor( 5 * imgObj.width / node.get('cropWidth') ) ) );
				node.set( 'minZoom', Math.max(0.001, node.get('minZoom') || 1 / node.get('maxZoom') ) );
				
				node.init();
                
				node.$img.prop('src', src).fadeIn(200);
                node.$cropArea.removeClass('lbf-cropArea-loading');
				
				callback && callback(img);
            });
        },

        /**
         * 设置图片裁切尺寸
         * @method setCropSize
         * @param {Object} opts 需要设置的宽高值
         * @param {Number} [opts.width] 需要设置的宽度
         * @param {Number} [opts.height] 需要设置的高度
         */
        setCropSize: function(dimention){
            if(dimention){
                dimention.width && ( this.set('cropWidth', dimention.width) );
                dimention.height && ( this.set('cropHeight', dimention.height) );
            }

            //裁切尺寸宽高比：
            var ratio = this.get('cropWidth') / this.get('cropHeight');

            if( this.get('cropWidth') >= this.get('cropAreaWidth') - 20 || this.get('cropHeight') >= this.get('cropAreaHeight') - 20 ) {
                if( ratio > this.get('areaRatio') ){
                    this.set('cropBoxWidth', this.get('cropAreaWidth') - 20);
                    this.set( 'cropBoxHeight', this.get('cropHeight') * this.get('cropBoxWidth') / this.get('cropWidth') );
                }else{
                    this.set( 'cropBoxHeight', this.get('cropAreaHeight') - 20 );
                    this.set('cropBoxWidth', this.get('cropWidth') * this.get('cropBoxHeight') / this.get('cropHeight') );
                }
            } else {
                this.set( 'cropBoxWidth', this.get('cropWidth') );
                this.set( 'cropBoxHeight', this.get('cropHeight') );
            }

            var cropBoxLeft = ( this.get('cropAreaWidth') - this.get('cropBoxWidth') ) / 2,
                cropBoxTop = ( this.get('cropAreaHeight') - this.get('cropBoxHeight') ) / 2;

            this.$cropBox.css({
                width: this.get('cropBoxWidth'),
                height: this.get('cropBoxHeight'),
                left: cropBoxLeft,
                top: cropBoxTop
            });

            this.$cropTop.css({
                width: this.get('cropAreaWidth'),
                height: cropBoxTop,
                left: 0,
                top: 0
            });

            this.$cropRight.css({
                width: this.get('cropAreaWidth') - cropBoxLeft - this.$cropBox.outerWidth(),
                height: this.$cropBox.outerHeight(),
                left: cropBoxLeft + this.$cropBox.outerWidth(),
                top: cropBoxTop
            });

            this.$cropBottom.css({
                width: this.get('cropAreaWidth'),
                height: this.get('cropAreaHeight') - cropBoxTop - this.$cropBox.outerHeight(),
                left: 0,
                top: cropBoxTop + this.$cropBox.outerHeight()
            });

            this.$cropLeft.css({
                width: cropBoxLeft,
                height: this.$cropBox.outerHeight(),
                left: 0,
                top: cropBoxTop
            });

        },

        /*
         * 移动被裁切图片
         * delataX, deltaY 是相对位置
         * 如 moveTo(1, -1) 表示右移1px，上移1px
         */
        moveTo: function(deltaX, deltaY){
            this.$img.css({
                left: '+=' + deltaX,
                top: '+=' + deltaY
            });

        },

        /*
         * 缩放被裁切图片
         * n 是缩放倍数
         * n 会被限制在minZoom和maxZoom之间
         */
        zoom: function(n){
            var num = this._checkZoom(n);

            this.get('img').zoom = num;

            var imgWidth = this.$img.width() || this.get('img').width,
                imgHeight = this.$img.height() || this.get('img').height,
                width = Math.round( this.get('img').width * this.get('img').zoom ),
                height = Math.round( this.get('img').height * this.get('img').zoom ),
                deltaX = -( width - imgWidth ) / 2,
                deltaY = -( height - imgHeight ) / 2;

            this.$img.css({
                width: width,
                height: height
            });

            this.moveTo(deltaX, deltaY);

            this._setZoomBar(num);
        },

        crop: function(){
            if(this.xhr) {
                return;
            }

            var node = this,
                data = {
                    //show_url:显示使用，针对https的情况，url:图片源地址;
                    src: node.get('img').url,
                    width: node.get('img').width,
                    height: node.get('img').height,
                    cropWidth: node.get('cropWidth'),
                    cropHeight: node.get('cropHeight')
                };

            var originX = Math.round( (node.$cropBox.position().left - node.$img.position().left) / node.get('img').zoom ),
                originY = Math.round( (node.$cropBox.position().top - node.$img.position().top) / node.get('img').zoom);

            data.originX = originX + 1;
            data.originY = originY + 1;
            data.originWidth = Math.round( node.get('cropBoxWidth') / node.get('img').zoom );
            data.originHeight = Math.round( node.get('cropBoxHeight') / node.get('img').zoom);
			
			var processData = node.get('processData'),
				userData = node.get('data') || {};
				
			isFunction(processData) && processData(userData);
			data = extend({}, userData, data);
			
            node._adjustUrl();

            node._showLoading();
            
            node.trigger('cropStart', [data]);
            
            node.xhr = $.ajax({
                type: 'POST',
                url: node.get('url'),
                data: data,
                dataType: 'json',
                success: function(data){
                    node.panel.hide();

                    /**
                     * Fire when crop success
                     * @event cropSuccess
                     * @param {Event} event JQuery event
                     * @param {Object} opts server response data
                     */
                    node.trigger('cropSuccess', [data]);
                },
                error: function(data){
                    /**
                     * Fire when crop error
                     * @event cropError
                     * @param {Event} event JQuery event
                     * @param {Object} opts server response data
                     */
                    node.trigger('cropError', [data]);
                },
                complete: function(data){
                    /**
                     * Fire when crop complete
                     * @event cropComplete
                     * @param {Event} event JQuery event
                     * @param {Object} opts server response data
                     */
                    node.trigger('cropComplete', [data]);
                    node._hideLoading();
                    node.$img.prop('src', '').hide();

                    delete node.xhr;
                }
            });
        },

        cancelCrop: function(){
            if(this.xhr) {
                this.xhr.abort();
                delete this.xhr;
            }

            /**
             * Fire when crop canceled
             * @event cropCancel
             * @param {Event} event JQuery event
             * @param {Object} node Node object
             */
            this.trigger('cropCancel', [this]);
            this.$img.prop('src', '').hide();
        },

        _attachEvents: function(){
            var node = this,
                cropMove = false,
                pos = {};

            node.$cropArea.bind('mousedown', function(e){
                pos = {
                    x: e.pageX,
                    y: e.pageY
                };

                cropMove = true;

            }).bind('mousemove', function(e){
                if(!cropMove){
                    return;
                }

                var x = e.pageX - pos.x,
                    y = e.pageY - pos.y;

                node.moveTo(x, y);

                pos.x = e.pageX;
                pos.y = e.pageY;
            }).bind('mouseup mouseleave', function(){
                cropMove = false;
            }).bind('mousewheel', function(e, delta){
                var num = delta === 1 ? node.get('img').zoom + 0.05 : node.get('img').zoom - 0.05;
                num = node._checkZoom(num);
                node.zoom(num);
                return false;
            }).bind('dblclick', function(){
                node.zoom(1);
            });

            var zoomBarHeight = node.$zoomBar.height(),
                originY,
                mdownY,
                move = false,
                catchArrowKey = true;

            node.$zoomBarHandler.bind('mousedown', function(e){
                originY = $(this).position().top,
                    mdownY = e.pageY;
                move = true;

                node.$zoomTip.show();
            });

            $(document).bind('mousemove.lbfImageCrop', function(e){
                if(!move){
                    return;
                }

                var delta = e.pageY - mdownY;

                var moveTo = originY + delta < 0 ?
                    0 :
                    originY + delta > zoomBarHeight ? zoomBarHeight : originY + delta;

                node.$zoomBarHandler.css({
                    top: moveTo
                });

                node._delay(function(){
                    //ratio = (moveTo - zoomBarHeight / 2) / (zoomBarHeight / 2);
                    var ratio = 1 - 2 * moveTo / zoomBarHeight,
                        zoom;

                    if(ratio >= 0){
                        zoom = 1 + (node.get('maxZoom') - 1) * ratio;
                    } else {
                        zoom = 1 + ( 1 - node.get('minZoom') ) * ratio;
                    }

                    node.zoom(zoom);

                    node.$zoomTip.text('x ' + zoom.toFixed(2));

                }, 20);

            }).bind('mouseup.lbfImageCrop', function(){
                move = false;
                node.$zoomTip.hide();
            }).bind('keydown.lbfImageCrop', function(e){
                if(!catchArrowKey){
                    return;
                }

                var code = e.keyCode;

                if(e.ctrlKey){
                    switch(code) {
                        case KEY.TOP:
                            node.zoom( node.get('img').zoom + 0.01 );
                            break;
                        case KEY.RIGHT:
                            node.zoom( node.get('img').zoom + 0.01 );
                            break;
                        case KEY.LEFT:
                            node.zoom( node.get('img').zoom - 0.01 );
                            break;
                        case KEY.DOWN:
                            node.zoom( node.get('img').zoom - 0.01 );
                    }
                } else if(e.shiftKey) {
                    switch(code) {
                        case KEY.LEFT:
                            node.moveTo(-10, 0);
                            break;
                        case KEY.RIGHT:
                            node.moveTo(10, 0);
                            break;
                        case KEY.TOP:
                            node.moveTo(0, -10);
                            break;
                        case KEY.DOWN:
                            node.moveTo(0, 10);
                    }
                } else {
                    switch(code) {
                        case KEY.LEFT:
                            node.moveTo(-1, 0);
                            break;
                        case KEY.RIGHT:
                            node.moveTo(1, 0);
                            break;
                        case KEY.TOP:
                            node.moveTo(0, -1);
                            break;
                        case KEY.DOWN:
                            node.moveTo(0, 1);
                    }
                }

                //裁切窗口显示时，阻止浏览器默认事件,如窗口的上翻下翻;
                if( !node.panel.$el.is(':hidden') && ( code === KEY.LEFT || code === KEY.RIGHT || code === KEY.TOP || code === KEY.DOWN ) ) {
                    return false;
                }

            });

            if (node.get('resizable')) {
                var cropRange = this.get('cropRange').split('|'),
                    cropW = ~~node.get('cropWidth'),
                    cropH = ~~node.get('cropHeight'),
                    val = 0,
                    input;

                node.$resize.find('input').bind('focusin', function(){
                    catchArrowKey = false;
                }).bind('focusout', function(){
                    catchArrowKey = true;
                });

                node.$resize.find('input:eq(0)').bind('keyup', function(){
                    input = $(this);
                    val = ~~input.val();

                    node._delay(function(){
                        if( cropRange[1] != 0 && val > cropRange[1] || cropRange[0] != 0 && val < cropRange[0]) {
                            input.val(cropW);
                        } else {
                            node.setCropSize({
                                width: val
                            });
                            cropW = val;
                        }
                    }, 500, this);

                }).val(cropW);
                node.$resize.find('input:eq(1)').bind('keyup', function(){
                    input = $(this);
                    val = ~~input.val();

                    node._delay(function(){
                        if( cropRange[3] != 0 && val > cropRange[3] || cropRange[2] != 0 && val < cropRange[2]) {
                            input.val(cropH);
                        } else {
                            node.setCropSize({
                                height: val
                            });
                            cropH = val;
                        }
                    }, 500, this);

                }).val(cropH);
            }

        },

        /*
         * 延时函数
         * fn 是要延时的函数
         * times 是需要延时的时间
         * obj 指定当前对象
         */
        _delay: function (fn, times, obj) {
            obj = obj || this;

            if (obj.sleepid) {
                clearTimeout(obj.sleepid);
            }
            obj.sleepid = setTimeout(fn, times);
        },

        _checkZoom: function(num) {
            if( num > this.get('maxZoom') ){
                num = this.get('maxZoom');
            } else if ( num < this.get('minZoom') ) {
                num = this.get('minZoom');
            }

            return num;
        },

        _setZoomBar: function(num) {
            var zoomBarHeight = this.$zoomBar.height(),
                moveTo;

            if(num >= 1){
                moveTo = ( 1 - (num - 1) / ( this.get('maxZoom') - 1) ) * zoomBarHeight / 2;
            } else {
                moveTo = ( 1 - (num - 1) / ( 1 - this.get('minZoom') ) ) * zoomBarHeight / 2;
            }

            this.$zoomBarHandler.css({
                top: moveTo
            });

            this.$zoomTip.text('x ' + num.toFixed(2));
        },

        _refresh: function(){
            var imgObj = this.get('img');

            this.$img.css({
                width: imgObj.width,
                height: imgObj.height,
                left: ( this.get('cropAreaWidth') - imgObj.width ) / 2,
                top: ( this.get('cropAreaHeight') - imgObj.height ) / 2
            });

            //自动缩放到适应裁切窗口;
            if( imgObj.width > this.get('cropAreaWidth') ) {
                this.zoom( this.get('cropAreaWidth') / imgObj.width );
            } else {
				this.zoom(1);	
			}

        },

        _showLoading: function(){
            this.panel.buttons[0].addClass('lbf-button-loading');
        },

        _hideLoading: function(){
            this.panel.buttons[0].removeClass('lbf-button-loading');
        },

        _createUpload: function(settings){
            var node = this;
            node.uploader = new FileUploader(settings);
            node.uploader.bind('uploadSuccess', function(e, res){
            	//设置图片宽和高
            	node.get('img').width = res.data && res.data.width;
            	node.get('img').height = res.data && res.data.height;
            	
                node.showPanel( res.data, node.get('onUploadSilence') );

                /**
                 * Fire when upload successed
                 * @event uploadSuccess
                 * @param {Event} event JQuery event
                 * @param {Object} opts server response data
                 * @param {Object} opts.r status code
                 * @param {Object} opts.msg message
                 * @param {Object} opts.data {url: '', show_url:''}
                 */
                node.trigger('uploadSuccess', [res]);
            });
            node.uploader.bind('uploadError', function(e, res){
                /**
                 * Fire when upload error
                 * @event uploadError
                 * @param {Event} event JQuery event
                 * @param {Object} opts server response data
                 */
                node.trigger('uploadError', [res]);
            });
            node.disable = function(index){
                node.uploader.disable(index);
            }
            node.enable = function(index){
                node.uploader.enable(index);
            }
        },

        _adjustUrl: function(){
            var url = this.get('url');

            if( url.indexOf('type=crop') != -1 ) {
                return;
            }

            //给地址加上type=crop表示当前是裁切操作, type=upload是文件上传;
            url += url.indexOf('?') === -1 ? '?type=crop' : '&type=crop';

            this.set('url', url);
        }
    });

    ImageCrop.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {
			useFileUploader: true,
            contentTemplate: [
                '<div class="lbf-crop" onselectstart="return false">',
                '<div class="lbf-crop-area">',
                '<div class="lbf-crop-top"></div>',
                '<div class="lbf-crop-right"></div>',
                '<div class="lbf-crop-bottom"></div>',
                '<div class="lbf-crop-left"></div>',
                '<div class="lbf-crop-cropBox"></div>',
                '</div>',
                '<div class="lbf-crop-zoombar"><div class="lbf-crop-handler"><div class="lbf-crop-zoomTip">x 1.00</div></div></div>',
                '</div>'
            ].join(''),
            resizable: false,
            cropAreaWidth: 500,
            cropAreaHeight: 300,
            cropBoxWidth: 0,
            cropBoxHeight: 0,
            maxZoom: 5,
            //minZoom: 1, // 1 / maxZoom,
            img: {
                url: '',
                show_url: '',
                zoom: 1,
                width: 0,
                height: 0
            },

            panelText: {
                title: '图片裁切',
                size: '裁切尺寸：',
                width: '宽',
                height: '高'
            },

            cropWidth: 300,
            cropHeight: 200,
            cropRange: '0|0|0|0',

            onUploadSilence: false,
			
			//用户附加自定义参数;
            data: {},
			
			//对即将发送的数据进行预处理;
			processData: function(data){
				//data是上面用户附加的参数;
			}
        }
    });

    return ImageCrop;

});