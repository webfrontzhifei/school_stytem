/*
 * Dropdown插件
 * @author: oliverbi
 * @date: 2015/08/17
 *
 */
LBF.define('qidian.comp.Dropdown', function (require, exports, module) {
  var extend = require('lang.extend'),
    Dropdown = require('ui.widget.Dropdown.Dropdown');

  module.exports = exports = Dropdown.inherit({
    adjust: function () {
      this._adjustPos();
    },

    /**
     * override _adjustPos
     * @method _adjustPos
     */
    _adjustPos: function () {
      var $ = this.$,
        container = this.get('container'),
        pos = {},
        triggerPos,
        $trigger = this.$trigger,
        popupHeight = this.outerHeight(),
        offsetParent = $trigger.offsetParent(),
        outerPosition = $trigger.outerPosition(),
        offset = $trigger.offset();

      Dropdown.prototype._adjustPos.apply(this, arguments);

      // container = $trigger.parent()
      if (container[0] !== $('body')[0] && container !== 'body') {
        triggerPos = {
          top: outerPosition.top + offsetParent.scrollTop()
        };
      } else {
        /**
         * container = body
         */
        triggerPos = {
          top: offset.top
        }
      }

      pos.top = parseInt(this.css('top'));


      if (pos.top < triggerPos.top) {
        pos.top = triggerPos.top + $trigger.outerHeight();
      }

      // 根据设计的要求，dropdonwn的上下边框要与对应的input的上下边框重合
      pos.top--;

      this.css(pos);
    }
  });

  exports.include({
    settings: extend({}, Dropdown.settings)
  });
});
