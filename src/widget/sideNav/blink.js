/**
 * @file sideNav blink动画效果
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {

    var lib = require('../../lib');
    var util = require('../../lib/util');

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
            lib.show(ctx.element);

            // 再运行 navNodeWrap 的动画, 必须在 element 出现后隔段时间执行
            util.delay(function () {
                isAnimRunning = true;
                lib.css(ctx.navNodeWrap, showCss);
            }, 10);

            // 表明动画结束
            util.delay(function () {
                isAnimRunning = false;
            }, 10);

        },
        reset: function (ctx) {

            lib.css(ctx.navNodeWrap, resetCss);

            util.delay(function () {
                var anim = {
                    'transition': 'all ' + ctx.get('duration') + ' ' + ctx.get('easing')
                };

                lib.css(ctx.navNodeWrap, anim);
            }, 10);

        },
        hide: function (ctx) {

            lib.css(ctx.navNodeWrap, hideCss);

            // 再隐藏 rootNode , 必须在 navNodeWrap 消失后隔段时间执行
            util.delay(function () {
                if (!isAnimRunning) {
                    lib.hide(ctx.element);
                }
            }, ctx.get('duration'));

        }
    };

    return Blink;
});
