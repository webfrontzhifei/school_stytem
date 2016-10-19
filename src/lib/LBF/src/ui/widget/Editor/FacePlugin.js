/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-12 下午9:04
 */
LBF.define('ui.widget.Editor.FacePlugin', function(require){
    var Plugin = require('ui.Plugins.Plugin'),
        Popup = require('ui.Nodes.Popup');

    var wrapTemplate = '<div class="Editor-topPanel-btn Editor-FacePlugin-btn"><a class="btn" href="javascript:;">表情</a></div>';

    var faceTemplate = '<span class="cover"></span><a href="javascript:;" class="f14" title="/微笑"></a><a href="javascript:;" class="f1" title="/撇嘴"></a><a href="javascript:;" class="f2" title="/色"></a><a href="javascript:;" class="f3" title="/发呆"></a><a href="javascript:;" class="f4" title="/得意"></a><a href="javascript:;" class="f5" title="/流泪"></a><a href="javascript:;" class="f6" title="/害羞"></a><a href="javascript:;" class="f7" title="/闭嘴"></a><a href="javascript:;" class="f8" title="/睡"></a><a href="javascript:;" class="f9" title="/大哭"></a><a href="javascript:;" class="f10" title="/尴尬"></a><a href="javascript:;" class="f11" title="/发怒"></a><a href="javascript:;" class="f12" title="/调皮"></a><a href="javascript:;" class="f13" title="/呲牙"></a><a href="javascript:;" class="f0" title="/惊讶"></a><a href="javascript:;" class="f15" title="/难过"></a><a href="javascript:;" class="f16" title="/酷"></a><a href="javascript:;" class="f96" title="/冷汗"></a><a href="javascript:;" class="f18" title="/抓狂"></a><a href="javascript:;" class="f19" title="/吐"></a><a href="javascript:;" class="f20" title="/偷笑"></a><a href="javascript:;" class="f21" title="/可爱"></a><a href="javascript:;" class="f22" title="/白眼"></a><a href="javascript:;" class="f23" title="/傲慢"></a><a href="javascript:;" class="f24" title="/饥饿"></a><a href="javascript:;" class="f25" title="/困"></a><a href="javascript:;" class="f26" title="/惊恐"></a><a href="javascript:;" class="f27" title="/流汗"></a><a href="javascript:;" class="f28" title="/憨笑"></a><a href="javascript:;" class="f29" title="/大兵"></a><a href="javascript:;" class="f30" title="/奋斗"></a><a href="javascript:;" class="f31" title="/咒骂"></a><a href="javascript:;" class="f32" title="/疑问"></a><a href="javascript:;" class="f33" title="/嘘"></a><a href="javascript:;" class="f34" title="/晕"></a><a href="javascript:;" class="f35" title="/折磨"></a><a href="javascript:;" class="f36" title="/衰"></a><a href="javascript:;" class="f37" title="/骷髅"></a><a href="javascript:;" class="f38" title="/敲打"></a><a href="javascript:;" class="f39" title="/再见"></a><a href="javascript:;" class="f97" title="/擦汗"></a><a href="javascript:;" class="f98" title="/抠鼻"></a><a href="javascript:;" class="f99" title="/鼓掌"></a><a href="javascript:;" class="f100" title="/糗大了"></a><a href="javascript:;" class="f101" title="/坏笑"></a><a href="javascript:;" class="f102" title="/左哼哼"></a><a href="javascript:;" class="f103" title="/右哼哼"></a><a href="javascript:;" class="f104" title="/哈欠"></a><a href="javascript:;" class="f105" title="/鄙视"></a><a href="javascript:;" class="f106" title="/委屈"></a><a href="javascript:;" class="f107" title="/快哭了"></a><a href="javascript:;" class="f108" title="/阴险"></a><a href="javascript:;" class="f109" title="/亲亲"></a><a href="javascript:;" class="f110" title="/吓"></a><a href="javascript:;" class="f111" title="/可怜"></a><a href="javascript:;" class="f112" title="/菜刀"></a><a href="javascript:;" class="f89" title="/西瓜"></a><a href="javascript:;" class="f113" title="/啤酒"></a><a href="javascript:;" class="f114" title="/篮球"></a><a href="javascript:;" class="f115" title="/乒乓"></a><a href="javascript:;" class="f60" title="/咖啡"></a><a href="javascript:;" class="f61" title="/饭"></a><a href="javascript:;" class="f46" title="/猪头"></a><a href="javascript:;" class="f63" title="/玫瑰"></a><a href="javascript:;" class="f64" title="/凋谢"></a><a href="javascript:;" class="f116" title="/示爱"></a><a href="javascript:;" class="f66" title="/爱心"></a><a href="javascript:;" class="f67" title="/心碎"></a><a href="javascript:;" class="f53" title="/蛋糕"></a><a href="javascript:;" class="f54" title="/闪电"></a><a href="javascript:;" class="f55" title="/炸弹"></a><a href="javascript:;" class="f56" title="/刀"></a><a href="javascript:;" class="f57" title="/足球"></a><a href="javascript:;" class="f117" title="/瓢虫"></a><a href="javascript:;" class="f59" title="/便便"></a><a href="javascript:;" class="f75" title="/月亮"></a><a href="javascript:;" class="f74" title="/太阳"></a><a href="javascript:;" class="f69" title="/礼物"></a><a href="javascript:;" class="f49" title="/拥抱"></a><a href="javascript:;" class="f76" title="/强"></a><a href="javascript:;" class="f77" title="/弱"></a><a href="javascript:;" class="f78" title="/握手"></a><a href="javascript:;" class="f79" title="/胜利"></a><a href="javascript:;" class="f118" title="/抱拳"></a><a href="javascript:;" class="f119" title="/勾引"></a><a href="javascript:;" class="f120" title="/拳头"></a><a href="javascript:;" class="f121" title="/差劲"></a><a href="javascript:;" class="f122" title="/爱你"></a><a href="javascript:;" class="f123" title="/NO"></a><a href="javascript:;" class="f124" title="/OK"></a><a href="javascript:;" class="f42" title="/爱情"></a><a href="javascript:;" class="f85" title="/飞吻"></a><a href="javascript:;" class="f43" title="/跳跳"></a><a href="javascript:;" class="f41" title="/发抖"></a><a href="javascript:;" class="f86" title="/怄火"></a><a href="javascript:;" class="f125" title="/转圈"></a><a href="javascript:;" class="f126" title="/磕头"></a><a href="javascript:;" class="f127" title="/回头"></a><a href="javascript:;" class="f128" title="/跳绳"></a><a href="javascript:;" class="f129" title="/挥手"></a><a href="javascript:;" class="f130" title="/激动"></a><a href="javascript:;" class="f131" title="/街舞"></a><a href="javascript:;" class="f132" title="/献吻"></a><a href="javascript:;" class="f133" title="/左太极"></a><a href="javascript:;" class="f134" title="/右太极"></a>';

    /**
     * Face plugin for editor. Select a face icon and insert its code to content
     * @class FacePlugin
     * @namespace ui.widget.Editor
     * @module ui
     * @submodule ui-widget
     * @extends ui.Plugins.Plugin
     * @constructor
     * @example
     *      editor.plug(FacePlugin);
     */
    var FacePlugin = Plugin.inherit({
        initialize: function(){
            Plugin.prototype.initialize.apply(this, arguments);

            this.render();
        },

        /**
         * Render face display and add to editor's top panel
         * @method render
         * @protected
         * @chainable
         */
        render: function(){
            var $el = this.$el = this.$(wrapTemplate);

            this.$btn = this.find('a');

            this.facePanel = new Popup({
                container: this.node.$topPanel,
                content: faceTemplate
            }).addClass('Editor-Plugin-PopupPanel Editor-FacePlugin-facePanel clearfix');

            this.bindUI();

            this.node.$topPanel.append($el);

            return this;
        },

        /**
         * Bind UI events for face panel
         * @method bindUI
         * @protected
         * @chainable
         */
        bindUI: function(){
            var $ = this.$,
                self = this,
                $btn = this.$btn,
                facePanel = this.facePanel,
                switcher = false,
                $doc = $(document);

            $btn.click(function(){
                if(switcher){
                    return;
                }

                switcher = !switcher;

                // set button state before getting it's offset
                $btn.addClass('on');

                var offset = $btn.outerPosition();
                facePanel
                    .css({
                        top: offset.top + $btn.outerHeight() - 3,
                        left: offset.left
                    })
                    .show();

                setTimeout(function(){
                    $doc.one('click', function(){
                        switcher = !switcher;
                        facePanel.hide();
                        $btn.removeClass('on');
                    });
                }, 1);
            });

            facePanel.find('a').click(function(){
                self.addFace($(this).prop('title'));
            });

            return this;
        },

        /**
         * Add face code to content and trigger FacePlugin.addFace event
         * @method addFace
         * @param {String} face
         * @chainable
         */
        addFace: function(face){
            return this.node
                        .append(face)
                        /**
                         * Fire when a face code inserted, to editor, not plugin itself
                         * @event FacePlugin.addFace
                         * @bubbles Editor
                         * @param {Event} event JQuery event
                         * @param {String} face Face code
                         */
                        .trigger('FacePlugin.addFace', [face]);
        }
    });

    FacePlugin.include({
        /**
         * Plugin's namespace
         * @property ns
         * @type String
         * @static
         */
        ns: 'Face'
    });

    return FacePlugin;
});