/**
 * @file sideNav blink动画效果
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var lib = require('winnie/lib');
    var u = require('underscore');

    var isAnimRunning = false;

    var resetCss = {
        'opacity' : '0',
        'display' : 'block',
        'transform' : 'scale(1.2)'
    };

    var hideCss ={
        opacity:'0',
        transform:'scale(1.2)'
    };

    var showCss = {
        'opacity':1,
        transform:'scale(1)'

    };
    var Blink = {
        show: function (ctx) {

            //首先显示节点
            lib.setStyle(ctx.element,{
                display:'block'
            });

            // 再运行 navNodeWrap 的动画, 必须在 element 出现后隔段时间执行
            u.delay(function() {
                isAnimRunning = true;
                lib.setStyle(ctx.navNodeWrap, showCss);
            },10);

            //表明动画结束
            u.delay(function() {
                isAnimRunning = false;
            },10);

        },
        reset:function(ctx) {


            resetCss = u.extend(resetCss,{
                'transition':'all '+ctx.get('duration')+' '+ctx.get('easing')
            });

            lib.setStyle(ctx.navNodeWrap, resetCss);

        },
        hide:function(ctx) {

            lib.setStyle(ctx.navNodeWrap, hideCss);

            // 再隐藏 rootNode , 必须在 navNodeWrap 消失后隔段时间执行
            u.delay(function() {
                if(!isAnimRunning) {
                    lib.setStyle(ctx.element,{
                        display:'none'
                    });
                }
            })

        }
    };

    return Blink;
});