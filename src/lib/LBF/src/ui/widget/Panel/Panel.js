/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-13 下午5:35
 */
LBF.define('ui.widget.Panel.Panel', function(require){
    var $ = require('lib.jQuery'),
        forEach = require('lang.forEach'),
        proxy = require('lang.proxy'),
        extend = require('lang.extend'),
        zIndexGenerator = require('util.zIndexGenerator'),
        Shortcuts = require('util.Shortcuts'),
        Node = require('ui.Nodes.Node'),
        Popup = require('ui.Nodes.Popup'),
        Button = require('ui.Nodes.Button'),
        Drag = require('ui.Plugins.Drag'),
        Overlay = require('ui.Plugins.Overlay');

    require('{theme}/lbfUI/css/Panel.css');

    /**
     * Base panel component
     * @class Panel
     * @namespace ui.widget.Panel
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Popup
     * @uses ui.Plugin.Drag
     * @uses ui.Plugin.Overlay
     * @constructor
     * @param {Object} opts Options of node
     * @param {String|jQuery|documentElement} [opts.container='body'] Panel's container
     * @param {String|jQuery|documentElement} [opts.title] Title text
     * @param {String|jQuery|documentElement} [opts.content] Panel's content
     * @param {Object[]} [opts.buttons] Panel button options, each one in array for a button.
     * @param {Object} [opts.events] Events to be bound to panel
     * @param {Object} [opts.events.close] Event when click close button
     * @param {Boolean|Object} [opts.modal=false] Whether to use modal(overlay/mask), and modal opts can be assigned to this option
     * @param {Boolean|Object} [opts.drag=false] Whether to make panel draggable, and drag opts can be assigned to this option
     * @param {Number} [opts.zIndex] The zIndex value of node
     * @param {Boolean} [opts.centered=false] If set node to be centered to it's container
     * @param {String} [opts.wrapTemplate] Node's wrapTemplate
     * @param {Boolean} [opts.disposable=true] Delete panel or not after use
     * @example
     *      // simple demo
     *      new Panel({
     *          container: 'someContainerSelector',
     *          title: 'hello',
     *          msg: 'hello LBF'
     *      });
     *
     * @example
     *      // full options demo
     *      new Panel({
     *          title: 'hello',
     *          content: 'hello LBF',
     *          modal: false,
     *          drag: false,
     *          zIndex: 10,
     *          centered: true,
     *          buttons: [
     *              // button option @see ui.Nodes.Button
     *              {
     *                  value: 'confirm',
     *                  type: 'strong',
     *                  events: {
     *                      click: function(){
     *                          // context here is panel itself
     *                          // feel free to use this
     *                          this.remove();
     *                      }
     *                  }
     *              }
     *          ],
     *          events: {
     *              close: function(){
     *                  alert('close');
     *              }
     *          }
     *      });
     */
    var Panel = Popup.inherit({
        /**
         * 快捷访问，this.$element
         * @property elements
         * @type Object
         * @protected
         */
        elements: {
            $header: '.lbf-panel-head',
            $content: '.lbf-panel-body',
            $footer: '.lbf-panel-foot',
            $buttons: '.lbf-panel-foot',
            $closeButton: '.lbf-panel-close'
        },

        initialize: function(opts){
            this.mergeOptions(opts);

            this.buttons = [];

            this.render();

            this.trigger('load', [this]);
        },

        /**
         * Render panel and initialize events and elements
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            var panel = this,
                header = this.get('title'),
                content = this.get('content'),
                buttons = this.get('buttons'),
                $container = this.$container = this.$(this.get('container')),
                $el = this.$( this.get('wrapTemplate')),
                $headerWrap = $el.find('.lbf-panel-head'),
                $contentWrap = $el.find('.lbf-panel-body');

            this.setElement($el);

            $headerWrap.html(header);
            $contentWrap.html(content);


            if(buttons && buttons.length > 0){
                forEach(buttons, function(button){
                    panel.addButton(button);
                });
            }

            // overlay should be added to DOM before $el
            if(this.get('modal')){
                var modalOpts = this.get('modal');
                modalOpts = modalOpts === true ? {} : modalOpts;
                modalOpts.container = this.get('container');

                // if panel's z-index is assigned, assign overlay's to ensure their layer relation correct
                this.get('zIndex') && (modalOpts.zIndex = this.get('zIndex') - 1);
                this.plug(Overlay, modalOpts);
            }

            this.get('drag') && this.plug(Drag, {
                handler: $headerWrap
            });

            this.$closeButton.click(proxy(function(){
                this.trigger('close', [this]);
				return false;
            }, this));

            // update z-index later than overlay plugin
            $container.append($el.css({
                zIndex: this.get('zIndex') || zIndexGenerator()
            }));

            //
            this.get('className') && this.addClass(this.get('className'));

            //基本认为宽度界面上是可控的
            if(this.get('width') !== 'auto'){
                this.width(this.get('width'));
            }

            //对高度进行处理
            if(this.get('height') !== 'auto'){
                var height = this.get('height') < $(window).outerHeight() ? this.get('height') : $(window).outerHeight();

                //对panel高度赋值
                this.height(height);

                //content区域的高度也要重新赋值
                //todo
                //这句话发现在企点编辑素材设置了高度的时候会出现按钮超出下边框的问题，应该删除掉
                this.$content.height(height - this.$header.outerHeight() - this.$footer.outerHeight());
            }

            // element should be in the DOM when set to center, otherwise will cause wrong position
            this.get('centered') && this.setToCenter();

            // todo marked by amos
            // bind esc globally may cause problems

            // add shorcut 'esc' for cancel operation
            Shortcuts.bind('esc', proxy(function(){
                /**
                 * Fired when esc is pressed as the panel is shown
                 * @event exit
                 */
                this.trigger('exit');
            }, panel));

            // if container is body, then auto reset to it's center when window resized
            if($container.is('body')){
                $(window).bind('resize', proxy(this.setToCenter, this));
            }

            return this;
        },

        /**
         * Add a button to panel's buttons
         * @method addButton
         * @param {Object} [opts] @see ui.Nodes.Button
         * @return {ui.Nodes.Button}
         * @example
         *      // button option @see ui.Nodes.Button
         *      node.addButton({
         *          text: 'confirm',
         *          type: 'strong',
         *          events: {
         *              click: function(){
         *                  // context here is panel itself
         *                  // feel free to use this
         *                  this.remove();
         *              }
         *          }
         *      });
         */
        addButton: function(opts){
            opts.delegate = this;

            // proxy all events' context to panel
            if(opts.events){
                var events = opts.events,
                    proxyEvents = {};
                for(var i in events){
                    if(events.hasOwnProperty(i)){
                        proxyEvents[i] = proxy(events[i], this);
                    }
                }

                opts.events = proxyEvents;
            }

            var button = new Button(opts);
            this.$buttons.append(button.$el);
            this.buttons.push(button);
            return button;
        },

        // add overlay controll
        show: function(){
            if(this.get('modal')){
                this._PLUGINS.Overlay.show();
            }

            return Popup.prototype.show.apply(this, arguments);
        },

        // add overlay controll
        hide: function(){
            if(this.get('modal')){
                this._PLUGINS.Overlay.hide();
            }

            return Popup.prototype.hide.apply(this, arguments);
        },

        /**
         * Remove node and it's buttons
         * @method remove
         * @chainable
         */
        remove: function(){
            forEach(this.buttons, function(button){
                button.remove();
            });

            return Popup.prototype.remove.apply(this, arguments);
        }
    });

    Panel.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Popup.settings, {
            wrapTemplate: [
                '<div class="lbf-panel">',
                    '<a href="javascript:;" class="lbf-panel-close"></a>',
                    '<div class="lbf-panel-head"></div>',
                    '<div class="lbf-panel-body"></div>',
                    '<div class="lbf-panel-foot"></div>',
                '</div>'
            ].join(''),

            width: 'auto',

            height: 'auto',

            minWidth: false,

            minHeight: false,

            title: '',

            centered: true,

            modal: true,

            drag: true,

            disposable: true,

            buttons: [],

            plugins: [],

            events: {
                'close.Panel': function(){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                },

                exit: function(){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                }
            }
        })
    });

    return Panel;
});