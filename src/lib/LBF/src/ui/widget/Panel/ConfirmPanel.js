/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-27 下午5:30
 */
LBF.define('ui.widget.Panel.ConfirmPanel', function(require){
    var extend = require('lang.extend'),
        Panel = require('ui.widget.Panel.Panel');

    /**
     * Confirm component. Panel with two buttons, one for confirmation and the other for cancel
     * @class ConfirmPanel
     * @namespace ui.widget.Panel
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.Panel.Panel
     * @constructor
     * @param {Object} opts Options of node
     * @param {String|jQuery|documentElement} [opts.title] Panel's title
     * @param {String|jQuery|documentElement} [opts.content] Panel's content
     * @param {Object[]} [opts.buttons] Panel buttons. In confirm panel, defaults to be two buttons representing ok and cancel.
     * @param {Object} [opts.events] Events to be bound to panel
     * @param {Function} [opts.events.ok] Event when click ok button
     * @param {Function} [opts.events.cancel] Event when click cancel button
     * @param {String} [opts.wrapTemplate] Node's wrapTemplate
     * @example
     *      new ConfirmPanel({
     *          container: 'someContainerSelector',
     *          title: 'hello'
     *      });
     *
     * @example
     *      new ConfirmPanel({
     *          title: 'hello',
     *          modal: false,
     *          drag: false,
     *          zIndex: 10,
     *          centered: true,
     *          events: {
     *              ok: function(){
     *                  alert('ok');
     *                  this.remove();
     *              },
     *              cancel: function(){
     *                  alert('cancel');
     *                  this.remove();
     *              },
     *              close: function(){
     *                  alert('close');
     *                  this.remove();
     *              }
     *          }
     *      });
     */
    var ConfirmPanel = Panel.inherit({
        initialize: function(opts){
            this.mergeOptions(opts);

            this.defaultSettings();

            this.render();

            this.trigger('load', [this]);
        },

        /**
         * Default settings for alert panel
         * @protected
         * @chainable
         */
        defaultSettings: function(){
            var node = this;

            this.wrapTemplate = this.template(this.get('wrapTemplate'));
            this.buttons = [];

            var buttnsOption = this.get('buttons');
            // ok callback
            buttnsOption[0].events = buttnsOption[0].events ? buttnsOption[0].events : {};
            buttnsOption[0].events.click = function(){
                node.trigger('ok', [node]);
            };
            // cancel callback
            buttnsOption[1].events = buttnsOption[1].events ? buttnsOption[1].events : {};
            buttnsOption[1].events.click = function(){
                node.trigger('cancel', [node]);
            };

            return this;
        }
    });

    ConfirmPanel.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: extend(true, {}, Panel.settings, {
            buttons: [
                {
                    className: 'lbf-button-primary',
                    content: '确定',
                    events: {}
                },

                {
                    className: 'lbf-button-link',
                    content: '取消',
                    events: {}
                }
            ],

            events: {
                ok: function(e, panel){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                },

                cancel: function(e, panel){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                },

                'close.ConfirmPanel': function(e, panel){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                }
            }
        })
    });

    return ConfirmPanel;
});