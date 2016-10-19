/**
 * @fileOverview
 * @author amoschen
 * @version 1
 * Created: 13-3-28 下午8:14
 */
LBF.define('ui.widget.Pagination', function(require){
    var isNumber = require('lang.isNumber'),
        extend = require('lang.extend'),
        Node = require('ui.Nodes.Node');

    /**
     * Extensive pagination with plenty options, events and flexible template
     * @class Pagination
     * @namespace ui.widget
     * @module ui
     * @submodule ui-widget
     * @extends ui.Nodes.Node
     * @constructor
     * @param {Object} [opts] Options of node
     * @param {String|jQuery|documentElement} [opts.container] Container of node
     * @param {Number} [opts.total=opts.endPage - opts.startPage + 1] Total page count
     * @param {Number} [opts.maxDisplay=opts.total] Max num of pages to be displayed
     * @param {Number} [opts.page] Current page
     * @param {Number} [opts.startPage] Start of available pages. Caution: available pages is sub set of all pages.
     * @param {Number} [opts.endPage] End of available pages. Caution: available pages is sub set of all pages.
     * @param {Object} [opts.events] Events to be bound to the node
     * @param {Function} [opts.events.change] Callback when attribute changed
     * @param {Function} [opts.events.]
     * @param {String} [opts.tagName='div'] Tag name of pagination's wrap
     * @param {String} [opts.ellipsis='...'] Ellipsis string ( chars for replacing large page range)
     * @param {String} [opts.pageTemplate] Template for pagination. Caution: options are complex and no easy replacement.
     * @example
     *      new Pagination({
     *          container: 'someContainerSelector',
     *          page: 2,
     *          startPage: 1,
     *          endPage: 10
     *      });
     *
     * @example
     *      new Pagination({
     *          container: 'someContainerSelector',
     *          page: 2,
     *          startPage: 1,
     *          endPage: 10,
     *          headDisplay: 2,
     *          tailDisplay: 2,
     *          maxDisplay: 3,
     *          prevText: '&lt;上页',
     *          nextText: '下页&gt;',
     *          tagName: 'span',
     *          ellipsis: '--',
     *          events: {
     *              change: function(e, options){
     *                  alert('changed');
     *              }
     *          }
     *      });
     */
    var Pagination = Node.inherit({
        /**
         * Widget default UI events
         * @property events
         * @type Object
         * @protected
         */
        events: {
            'click .lbf-pagination-first': 'firstPage',
            'click .lbf-pagination-prev': 'prePage',
            'click .lbf-pagination-next': 'nextPage',
            'click .lbf-pagination-last': 'lastPage',
            'keypress .lbf-pagination-input': 'jumpBykeyboard',
            'click .lbf-pagination-input': 'focusInput',
            'click .lbf-pagination-go': 'jump',
            'click .lbf-pagination-page': 'page'
        },

        /**
         * Overwritten mergeOptions method
         * @method mergeOptions
         * @chainable
         */
        mergeOptions: function(opts){
            this.defaultValidate();

            this.set(extend({}, this.constructor.settings, opts));

            if(!this.get('total')){
                this.set('total', this.get('endPage') - this.get('startPage') + 1);
            }

            if(!this.get('maxDisplay') && this.get('maxDisplay') !== 0){
                this.set('maxDisplay', this.get('total'));
            }

            this.set('isInit', true);

            return this;
        },

        /**
         * Overwritten setElement method to bind default validator and event action before setting up attributes
         */
        setElement: function(){
            this.superclass.prototype.setElement.apply(this, arguments);

            this.defaultValidate();

            return this;
        },

        /**
         * Render pagination and append it to it's container if assigned
         * @method render
         * @chainable
         * @protected
         */
        render: function(){
            if(!this.get('isInit')){
                return this;
            }

            var html = this.pageTemplate(extend({
                Math: Math
            }, this.attributes()));

            this.setElement(html);

            if(this.get('selector') && this.$(this.get('selector')).is('.lbf-pagination')){
                this.$(this.get('selector')).replaceWith( this.$el );
            }else{
                this.$el.appendTo( this.get('container') );
            }

            return this;
        },

        /**
         *  Default validate for attribute
         *  @protected
         *  @chainable
         */
        defaultValidate: function(){
            this.addValidate(function(attrs){
                var page = attrs.page;

                if(!isNumber(page)){
                    this.trigger && this.trigger('error', [new TypeError('Pagination: page number should be numeric')]);
                    return false;
                }
            });

            return this;
        },

        /**
         * Default option change actions
         * @protected
         * @chainable
         */
        defaultActions: function(){
            var node = this;

            this
                .bind('change:page', function(){
                    node.render();
                })
                .bind('change:startPage', function(event, value){
                    if(value > node.get('page')){
                        node.set('page', value);
                    }
                    node.render();
                })
                .bind('change:endPage', function(event, value){
                    if(value < node.get('page')){
                        node.set('page', value);
                    }
                    node.render();
                })
                .bind('change:pageTemplate', function(){
                    node.pageTemplate = node.template(node.get('pageTemplate'));
                })
                .bind('change:container', function(){
                    node.appendTo(node.get('container'));
                });

            return this;
        },

        /**
         * Page redirection
         * @method page
         * @param {Number} page Target page
         * @chainable
         */
        page: function(page){
            if(page && page.currentTarget){                
                page = this.$(page.currentTarget).data('page');
            }

            if(page > this.get('endPage') || page < this.get('startPage')) {
                return this;
            }

            this.set('page', page);

            return this;
        },

        jump: function(e){
            var $input = this.$el.find('.lbf-pagination-input'),
                page = parseInt($input.val(), 10);

            if(page === '' || isNaN(page) || !isNumber(page) || page < this.get('startPage') || page > this.get('endPage')){
                $input.val('');
                $input.focus();
            }else{
                this.set('page', parseInt(page, 10));

                return this;
            }
        },

        /**
         * Select the input's value
         * @method focusInput
         * @chainable
         */
        focusInput: function(){
            this.$el.find('.lbf-pagination-input').select();
        },

        /**
         * Bind the keyboard events
         * @method jumpBykeyboard
         * @chainable
         */
        jumpBykeyboard: function(e){
            if(e.keyCode === 13){
                this.jump();
            };
        },

        /**
         * Redirect to first page
         * @method prePage
         * @chainable
         */
        firstPage: function(){
            return this.page(this.get('startPage'));
        },

        /**
         * Redirect to previous page
         * @method prePage
         * @chainable
         */
        prePage: function(){
            return this.page(this.get('page') - 1);
        },

        /**
         * Redirect to next page
         * @method nextPage
         * @chainable
         */
        nextPage: function(){
            return this.page(this.get('page') + 1);
        },

        /**
         * Redirect to last page
         * @method lastPage
         * @chainable
         */
        lastPage: function(){
            return this.page(this.get('endPage'));
        }
    });

    Pagination.include({
        /**
         * Default settings
         * @property settings
         * @type Object
         * @static
         * @protected
         */
        settings: {

            //是否初始化
            isInit: false,

            //是否显示跳转模块
            isShowJump: false,

            //是否显示首页按钮
            isShowFirst: false,

            //是否显示尾页按钮
            isShowLast: false,

            //当前页码，默认从第一页开始展示
            page: 1,

            //起始页码
            startPage: 1,

            //结尾页码
            endPage: 1,

            //头部显示按钮数
            headDisplay: 1,

            //尾部显示按钮数
            tailDisplay: 1,

            //分页分隔符
            ellipsis: '...',

            //默认最大显示分页数，不包括“首页 上一页 下一页 尾页”按钮
            maxDisplay: 5,

            //这个参数可以省略，@amos
            tagName: 'div',

            //首页按钮默认文案
            firstText: '首页',

            //上一页按钮默认文案
            prevText: '&lt;&lt;',

            //下一页按钮默认文案
            nextText: '&gt;&gt;',

            //尾页按钮默认文案
            lastText: '尾页',

            //默认结构模板
            pageTemplate: [
                '<% var ahead = Math.min(Math.round((maxDisplay - 1) / 2), page - 1);%>',
                '<% var after = Math.min(maxDisplay - 1 - ahead, total - page);%>',
                '<% ahead = Math.max(ahead, maxDisplay - 1 - after)%>',
                '<div class="lbf-pagination">',
					'<ul class="lbf-pagination-item-list">',

						//is show first button
                        '<% if(isShowFirst) { %>',
                            '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-first <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==firstText%></a></li>',
                        '<% } %>',

						//prev button
						'<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-prev <%==page <= startPage ? "lbf-pagination-disabled" : ""%>"><%==prevText%></a></li>',

						//headDisplay
						'<% for(var i=1; i<=headDisplay && i<=total; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
						'<% } %>',

						//prev ellipsis
						'<% if(page - ahead > i && maxDisplay > 0) { %>',
								'<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
						'<% } %>',

						//all pages
						'<% for(i = Math.max(page - ahead, i); i < page + after + 1 && i <= total && maxDisplay > 0; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a></li>',
						'<% } %>',

						//next ellipsis
						'<% if(page + after < total - tailDisplay && maxDisplay > 0) { %>',
							'<li class="lbf-pagination-item"><span class="lbf-pagination-ellipsis"><%==ellipsis%></span></li>',
						'<% } %>',

						//tailDisplay
						'<% for(i = Math.max(total - tailDisplay + 1, i); i<=total; i++){ %>',
							'<li class="lbf-pagination-item"><a data-page="<%==i%>" href="javascript:;" class="lbf-pagination-page <%==i < startPage || i > endPage ? "lbf-pagination-disabled" : ""%> <%==i === page ? "lbf-pagination-current" : ""%>"><%==i%></a>',
						'<% } %>',

						//next button
						'<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-next <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==nextText%></a></li>',

						//is show last button
                        '<% if(isShowLast) { %>',
                            '<li class="lbf-pagination-item"><a href="javascript:;" class="lbf-pagination-last <%==page >= endPage ? "lbf-pagination-disabled" : ""%>"><%==lastText%></a></li>',
                        '<% } %>',
                    '</ul>',

					//isShowJump
                    '<% if(isShowJump) { %>',
                        '<div class="lbf-pagination-jump"><input type="text" class="lbf-pagination-input" value="<%==page%>" /><a href="javascript:;" class="lbf-pagination-go">GO</a></div>',
                    '<% } %>',
				'</div>'
            ].join('')
        }
    });

    return Pagination;
});
