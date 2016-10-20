/**
 * Created by patrickliu on 11/28/14.
 */
LBF.define('qidian.comp.commonInit', function (require, exports, module) {
    var $ = require('lib.jQuery'),
        Tip = require('ui.Nodes.Tip'),
        PTLogin = require('qidian.comp.PTLogin'),
        Cookie = require('util.Cookie'),
        DataReport = require('qidian.comp.DataReport');

    require('qidian.comp.nav');
    require('qidian.comp.AvatarInfo');
    require('qidian.comp.PageTop');

    //开放到全局变量，以便所有继承自PageController的页面都可以不必再require引用
    window.DataReport = window.DataReport || DataReport;

    return function () {
        // 初始化header action
        var headerOverlay = null;

        var slide = document.getElementById('slide');
        //onclick="jQuery(this).parent().removeClass('slide-unopen')"
        //$('.')
        // console.log(slide);
        if (slide) {
            //不使用js轮循，太费资源，使用下面的替代解决方法
            /*setInterval(function () {
                var height = Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight);

                slide.style.height = height - 90  + 'px';
            }, 200);*/

            /*
             * 以下代码用于设置左导航栏最小高度
             * 解决 slide高度>content高度时 分隔边框延伸不到底部问题
             */
            slide.style.bottom = 'auto';//临时设置为auto，即可获得实际offsetHeight
            slide.style.minHeight = slide.offsetHeight - 20 + 'px'; //20为slide上、下padding之和
            slide.style.bottom = '0';//恢复bottom值
            //将body设置为relative，实现slide顶天立场效果
            $('body').addClass('rel');

            // 点击任意区域收起
            $(document).on('click', function(event) {
                var target = event && event.target;
                if (target && slide.contains(target) == false && /unopen/.test(slide.className) == false) {
                    slide.className += ' slide-unopen';
                }
            });            
        }
        $('#slide').find('.slide-toggle').bind('click', function (event) {
            $(this).parent().removeClass('slide-unopen');
        });

        $(document).bind("mouseup.navBox", function (event) {
            if ($(event.target).hasClass("header-nav-box") == false && $(event.target).parents(".header-nav-box").size() == 0) {
                $(".header-nav-box").animate({
                    top: -420
                }, 150);
                headerOverlay && headerOverlay.fadeOut("fast");
            }
        });

        // ie6-ie8
        if (!window.addEventListener) {
            $(window).resize(function () {
                var width = $(this).width();
                $(document.body)[width > 1325 ? "removeClass" : "addClass"]("page-small");
            }).trigger("resize");
        }
        if ($(window).width() < 1325) {
            setTimeout(function () {
                $('.sync-mask').css('left', '70px');
            }, 500);
        }

        $('.header-logout').bind('click', function () {
            PTLogin.logout();
        });


        // 给.slide .nav-a 绑定上hover事件，如果发现页面宽度小于1280，则显示出tips
        $('.slide .nav .nav-a').each(function (key, nav_a) {
            var $nav_a = $(nav_a);
            var tip = new Tip({
                //触发元素
                trigger: $nav_a,
                content: $nav_a.data('title'),
                direction: 'right',
                show: {
                    mode: 'manual',
                    delay: 200
                }
            });

            $nav_a.mouseenter(function () {
                    if ($(window).width() < 1325) {
                        tip.open();
                    } else {
                        tip.close();
                    }
                })
                .mouseleave(function () {
                    tip.close();
                });
        });

        //检测浏览器缩放
        (function(){
            // listenZoom();
            // $(document).bind("keydown", function (c) {
            //     var d = c;
            //     // console.log(c);
            //     if (c.keyCode == 189 && c.ctrlKey || c.keyCode == 187 && c.ctrlKey || c.keyCode == 107 && c.ctrlKey || c.keyCode == 109 && c.ctrlKey) {
            //        listenZoom(d);
            //         window.scrollTo(0, 0)
            //     }
            // })
            // $(window).resize(function () {
            //     listenZoom(d);
            //     window.scrollTo(0, 0)
            // })
            if (Cookie.get("zoomDetect") != 1) {
                adjustTopHintBar();
                window.onresize = function () {
                    //
                    if (Cookie.get("zoomDetect") != 1) {//此次用于判断禁止掉之后没刷新页面之前的缩放
                    adjustTopHintBar();
                    }

                }
            }
            function detectBrowserScale(){
                var ratio = 1,
                    screen = window.screen,
                    ua = navigator.userAgent.toLowerCase();

                // if ( (ua.indexOf('msie') + 1) && screen.deviceXDPI && screen.logicalXDPI) {
                //     ratio = screen.deviceXDPI / screen.logicalXDPI;
                // }else {
                //     // ratio = $("body").get(0).offsetHeight / $("body").get(0).getBoundingClientRect().height;
                //     if(window.outerWidth==window.innerWidth||window.outerWidth==window.innerWidth+10){
                //         ratio=1;
                //     }else if(window.outerWidth>window.innerWidth){
                //         ratio=2;
                //     }else{
                //         ratio = 0.5
                //     }
                // }
                if (window.devicePixelRatio !== undefined && ua.indexOf('macintosh') < 1 ) {
                    ratio = window.devicePixelRatio;
                }
                else if (~ua.indexOf('msie')) {
                    if (screen.deviceXDPI && screen.logicalXDPI) {
                        ratio = screen.deviceXDPI / screen.logicalXDPI;
                    }
                }
                else if (window.outerWidth !== undefined && window.innerWidth !== undefined ) {
                    ratio = window.outerWidth / window.innerWidth;
                }
                if ( ua.indexOf('macintosh') > 0 ) {
                    ratio = 1;
                }
                if (ratio){
                    ratio = Math.round(ratio * 100);
                }

                return ratio;

            }
            function  adjustTopHintBar() {
                var r = detectBrowserScale();
                var strRet = '';
                if (r > 100) {
                    strRet = '放大' + strRet;
                } else if (r < 100) {
                    strRet = '缩小' + strRet;
                } else {
                    // strRet = '一切正常，ohYeah' ;
                    // hideDetect()
                    if ($("#gb-hintbar").length > 0) {
                        // $("#gb-hintbar").addClass("dis")
                        $("#gb-hintbar").hide();
                        if($('#slide').length!=0){
                            $('#slide').removeClass('slide-adjust-90');
                        }
                    }
                    return;
                }
                // elRet.innerHTML = strRet;

                if ($("#gb-hintbar").length == 0) {
                    var h = "", f = [];
                    f.push('<div class="gb-hintbar" id="gb-hintbar">');
                    f.push('	<div class="inner">');
                    f.push('		<div class="hintbar-txt">您的浏览器目前处于<span id="hintbar-txt">' + strRet + '</span>状态，会导致页面显示不正常，您可以键盘按"ctrl+数字0"组合键恢复初始状态。<a href="javascript:;" id="stop-remind-nav" >不再提示</a></div>');
                    f.push("	</div>");
                    f.push("</div>");
                    h = f.join("");
                    $(h).insertBefore(".header")[0];
                    $("#gb-hintbar").find('#stop-remind-nav').on('click',function(){
                        Cookie.set("zoomDetect", 1);
                        $("#gb-hintbar").remove();
                        if($('#slide').length!=0){
                            $('#slide').removeClass('slide-adjust-90');
                        }

                    })
                } else {
                    $("#hintbar-txt").text(strRet);
                    $("#gb-hintbar").show();
                }
                if ($('#slide').length != 0) {
                    $('#slide').addClass('slide-adjust-90');
                }
            }

        })();


        //为ie8以以下版本footer安排位置顶部和底部高度131, 有些页面顶部有已绑定公众号列表栏高度81
        (function() {
            //!+'\v1' && $('.content-full').css('min-height', $(window).height() - 131);
            if(!+'\v1'){
                var win = $(window),
                    contentFull = $('.content-full'),
                    accountManageBarHeight  = $('.account-manage').length ? 81 : 0;//81是顶部已绑定公众号列表栏高度
                //绽放浏览器时，min-height也要变化，这样footer才能时实沉底
                $(window).on('resize',function() {
                    window.setContentFullMinHeightTimer && clearTimeout(window.setContentFullMinHeightTimer);
                    window.setContentFullMinHeightTimer = setTimeout(function(){
                        contentFull.css('min-height', win.height() - 131 - accountManageBarHeight);
                    },16);
                }).trigger('resize');
            }
        })();
        //如果当前页面不是“一键开号子页面”，则清掉hideQCode这个cookie
        if (typeof isOpenQQPage == 'undefined') {
            Cookie.del('hideQCode', '', '/');
        }
    };
});
