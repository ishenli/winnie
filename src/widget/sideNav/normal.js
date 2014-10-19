/**
 * @file sideNav normal动画效果
 * @author ishenli （shenli03@baidu.com）
 */
define(function () {

    var resetCss = {
        'display': 'block'
    };

    var hideCss = {
        'display': 'none'
    };

    var showCss = {
        'display': 'block'

    };
    var Normal = {
        show: function (ctx) {

            ctx.navNodeWrap.css(showCss);

        },
        reset: function (ctx) {
            ctx.navNodeWrap.css(resetCss);

        },
        hide: function (ctx) {
            ctx.navNodeWrap.css(hideCss);

        }
    };

    return Normal;
});
