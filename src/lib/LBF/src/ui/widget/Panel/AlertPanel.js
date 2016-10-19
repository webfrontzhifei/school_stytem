/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 12-11-27 下午5:30
 */
LBF.define('ui.widget.Panel.AlertPanel', function(require){
    var extend = require('lang.extend'),
        Panel = require('ui.widget.Panel.Panel');

    /**
     * Alert component. Panel with only a button for confirmation.
     * @class AlertPanel
     * @namespace ui.widget.Panel
     * @module ui
     * @submodule ui-widget
     * @extends ui.widget.Panel.Panel
     * @constructor
     * @param {Object} opts Options of node
     * @param {String|jQuery|documentElement} [opts.title] Panel's title
     * @param {String|jQuery|documentElement} [opts.content] Panel's content
     * @param {Object[]} [opts.buttons] Panel buttons. In alert panel, defaults to be one button representing ok.
     * @param {Object} [opts.events] Events to be bound to panel
     * @param {Function} [opts.events.ok] Event when click ok button
     * @param {String} [opts.wrapTemplate] Node's wrapTemplate
     * @example
     *      new AlertPanel({
     *          container: 'someContainerSelector',
     *          title: 'hello',
     *          content: 'hello LBF'
     *      });
     *
     * @example
     *      new AlertPanel({
     *          title: 'hello',
     *          content: 'hello LBF',
     *          modal: false,
     *          drag: false,
     *          zIndex: 10,
     *          centered: true,
     *          events: {
     *              ok: function(){
     *                  alert('ok');
     *                  this.remove();
     *              },
     *              close: function(){
     *                  alert('close');
     *                  this.remove();
     *              }
     *          }
     *      });
     */
    var AlertPanel = Panel.inherit({
        initialize: function(opts){
            this.mergeOptions(opts);

            this.defaultSettings();

            this.render();

            this.trigger('onLoad', [this]);
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

            // ok callback
            this.get('buttons')[0].events = this.get('buttons')[0].events ? this.get('buttons')[0].events : {};
            this.get('buttons')[0].events.click = function(){
                /**
                 * Fire when confirm button is click
                 * @event ok
                 * @param {Event} event JQuery event
                 * @param {Node} node Node object
                 */
                node.trigger('ok', [node]);
            };

            return this;
        }
    });

    AlertPanel.include({
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
                }
            ],

            events: {
                ok: function(e, panel){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                },

                'close.AlertPanel': function(e, panel){
                    this[ this.get('disposable') ? 'remove' : 'hide' ]();
                }
            }
        })
    });

    return AlertPanel;
});