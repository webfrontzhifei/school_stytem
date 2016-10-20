/**
 * Created by sqchen on 12/2/14.
 */

// 这是一棵组织架构树
// 使用方法
// var orgTree = require('hrtx2.comp.OrgTree');
// 1. 最简单的初始化方式
// var tree = new orgTree(); // 这样就可以了。
// $('...').html(tree.render())// tree.render()就是返回的html片段
// tree.on('onCreateSuccess', function() {}); // 还可以监听事件，详细看代码吧

// 2. 自定义参数方式
// var tree = new orgTree({
//    //因为是借用backbone.view，所以backbone.view的初始化方式这里都支持,比如自定义tagName, className, 设置$el之类的
//    //也可以不在初始化的时候绑定view.$el. 像1中一样，实例化之后再html($el)
//    tree: {} //这个是给真正的zTree初始化用的, 详细看zTree初始化参数吧
// });
//
LBF.define('qidian.comp.OrgTree', function(require, exports, module) {
    var Controller = require('qidian.comp.Controller'),
        TreeController = require('qidian.comp.testTree'),
        logger = require('qidian.comp.logger');

    exports = module.exports = Controller.extend({

        /**
         * options = {
         *    tree: // 对tree的一些设置
         * }
         * @param options
         */
        initialize: function(options) {
            logger.log('[orgTree][initialize] Tree Controller begin to initialize');
            var controller = this;

            // init the treeController
            var treeController = this.treeController = new TreeController((options && options.tree) ? options.tree : {});

            /**
             * pass the tree events below
             */
            // bind onCreateFailure events
            treeController.on('onCreateFailure', function() {
                logger.warn('[orgTree][initialize] Tree Controller initialized failed!!!');
                controller.trigger('onCreateFailure');
            });

            // bind onCreate events
            treeController.on('onCreateSuccess', function() {
                logger.log('[orgTree][initialize] Tree Controller initialized success.');

                // save the treeController.tree to this.tree
                controller.tree = treeController.tree;

                controller.$el.html(treeController.$el);

                // when tree is ready, set the html to $el
                // for view uses dom to propagate the events
                // onCreateSuccess and onCreateFailure is triggered before $el.html() function
                // so we have to trigger it manually
                controller.trigger('onCreateSuccess');

            });

            logger.log('[orgTree][initialize] Tree Controller initialize end');
        },

        // 透传至tree
        expandNodeAncestors: function() {
            var controller = this,
                tree = controller.treeController;
            return tree.expandNodeAncestors.apply(tree, [].slice.apply(arguments));
        },

        // 透传至tree
        expandOrgChain: function() {
            var controller = this,
                tree = controller.treeController;
            return tree.expandOrgChain.apply(tree, [].slice.apply(arguments));
        },

        // 透传至tree
        // expandFirst
        expandFirst: function() {
            var controller = this,
                tree = controller.treeController;

            return tree.expandFirst.apply(tree, [].slice.apply(arguments));
        },

        render: function() {
            logger.log('[orgTree][render] Tree Controller begin render');
            var controller = this;

            logger.log('[orgTree][render] Tree Controller end render');
            return this.$el;
        }
    });
});
