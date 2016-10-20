/**
 * Created by amos on 14-4-24.
 */
LBF.define('qidian.comp.TabView', function(require, exports, module){
    var TabView = require('ui.widget.Switchable.TabView'),
    	extend = require('lang.extend');

    var tabView = TabView.inherit({

    	initialize: function(opts) {
    		this.mergeOptions(opts);
    		this.render();
    	},

        _switchTab: function(index){

            //如果当前选中，返回
            if(index === this.get("selected")){
                return this;
            }

            var items = this.items,
                selected = this.get("selected"),
                $tab,
                $content;

            //切换当前项
            if(items[selected]){
                $tab = items[selected].$tab;
                $tab && $tab.removeClass('lbf-tabview-tab-selected');

                if( $content = items[selected].$content ){
                    $content
                        .removeClass('lbf-tabview-content-selected')
                        /**
                         * Fired when current tab is switched in
                         * @event switchIn
                         * @param {jQuery.Event} event
                         * @param {TabView} tabView
                         */
                        .trigger('switchOut', this);
                }
            }

            //高亮选中项
            if(items[index]){
                $tab = items[index].$tab;
                $tab && $tab.addClass('lbf-tabview-tab-selected');
                if(this.get('autoChangeTitle')) {
                	document.title = $tab.text() + this.get('postfix');
                }
                if( $content = items[index].$content ){
                    $content
                        .addClass('lbf-tabview-content-selected')
                        /**
                         * Fired when current tab is switched in
                         * @event switchIn
                         * @param {jQuery.Event} event
                         * @param {TabView} tabView
                         */
                        .trigger('switchIn', this);
                }
            }

            if (this.get('history') && history.replaceState) {
                history.replaceState(null, document.title, this._queryString('targetTab', index));
            }

            return this;
        }
    });

	tabView.include({
        settings: extend(true, {}, TabView.settings, {
        	autoChangeTitle: true,
        	postfix: ' - 腾讯企点'
        })
	});
    return tabView;
});
