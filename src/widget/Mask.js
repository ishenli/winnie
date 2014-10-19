/**
 * @file Mask遮罩，可设定宽高和颜色
 * @author shenli (shenli03@baidu.com)
 */
define(function (require) {

    var Overlay = require('./Overlay');
    var ua = (window.navigator.userAgent || '').toLowerCase();
    var isIE6 = ua.indexOf('msie 6') !== -1;
    var $body = $(document.body);
    var $doc = $(document);

    /**
    * @constructor
    * @extends module:Overlay
    * @requires jQuery
    * @exports Mask
    */
    var Mask = Overlay.extend({
        type: 'Mask',
        /**
         * 控件配置项
         * @name options
         * @name module:Mask#options
         * @property {string} options.width  浮层宽度
         * @property {string} options.height  浮层高度
         * @property {number} options.opacity  透明度
         * @property {string} options.backgroundColor  背景色
         * @property {Object} options.align 默认定位信息,参照Position.pin接口
         */
        options: {
            //  统一样式前缀
            classPrefix: 'mp-mask',
            width: isIE6 ? $doc.outerWidth(true) : '100%',
            height: isIE6 ? $doc.outerHeight(true) : '100%',
            opacity: 0.8,
            backgroundColor: '#000',
            style: {
                position: isIE6 ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                zIndex: 30
            },
            // 默认定位
            align: {
                baseElement: isIE6 ? $body : undefined
            }
        },
        /**
         * 显示Mask
         */
        show: function () {
            Mask.superClass.show.call(this);
            var css = $.extend({
                    opacity: this.get('opacity'),
                    backgroundColor: this.get('backgroundColor')
                },
                this.get('style')
            );
            this.element.css(css);
        }
    });

    // export单例，基本一个页面一个mask就够了
    return new Mask();
});
