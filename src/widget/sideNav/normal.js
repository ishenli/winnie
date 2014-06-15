/**
 * @file sideNav normal动画效果
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var lib = require('winnie/lib');

    var resetCss = {
        'display' : 'block'
    };

    var hideCss ={
        'display' : 'none'
    };

    var showCss = {
        'display' : 'block'

    };
    var Normal = {
        show: function (ctx) {

            lib.setStyle(ctx.navNodeWrap, showCss);

        },
        reset:function(ctx) {
            lib.setStyle(ctx.navNodeWrap, resetCss);

        },
        hide:function(ctx) {
            lib.setStyle(ctx.navNodeWrap, hideCss);

        }
    };

    return Normal;
});