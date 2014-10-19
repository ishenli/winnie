/**
 * @file sideNav blink动画效果
 * @author ishenli （shenli03@baidu.com）
 */
define(function (require) {

    var $ = require('jquery');
    var lib = require('../lib');

    var isAnimRunning = false;

    var resetCss = {
        'opacity': '0',
        'display': 'block',
        'transform': 'scale(1.2)'
    };

    var hideCss = {
        opacity: '0',
        transform: 'scale(1.2)'
    };

    var showCss = {
        'opacity': 1,
        transform: 'scale(1)'

    };
    var Blink = {
        show: function (ctx) {

            // 首先显示节点
            ctx.element.show();

            // 再运行 navNodeWrap 的动画, 必须在 element 出现后隔段时间执行
            lib.delay(function () {
                isAnimRunning = true;
                ctx.navNodeWrap.css(showCss);
            }, 10);

            // 表明动画结束
            lib.delay(function () {
                isAnimRunning = false;
            }, 10);

        },
        reset: function (ctx) {


            resetCss = $.extend(resetCss, {
                'transition': 'all ' + ctx.get('duration') + ' ' + ctx.get('easing')
            });

            ctx.navNodeWrap.css(resetCss);

        },
        hide: function (ctx) {

            ctx.navNodeWrap.css(hideCss);

            // 再隐藏 rootNode , 必须在 navNodeWrap 消失后隔段时间执行
            lib.delay(function () {
                if (!isAnimRunning) {
                    ctx.element.hide();
                }
            });

        }
    };

    return Blink;
});
