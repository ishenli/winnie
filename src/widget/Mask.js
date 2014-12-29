/**
 * @file Mask遮罩，可设定宽高和颜色
 * @author shenli (shenli03@baidu.com)
 */
define(function (require) {

    var Overlay = require('./Overlay');
    var lib = require('../lib');
    var util = require('../lib/util');
    /**
    * @constructor
    * @extends module:Overlay
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
            width:  '100%',
            height:  '100%',
            opacity: 0.8,
            backgroundColor: '#000',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 30
            },
            // 默认定位
            align: {
                baseElement: undefined
            }
        },
        /**
         * 显示Mask
         */
        show: function () {
            Mask.superClass.show.call(this);
            var css = util.extend({
                    opacity: this.get('opacity'),
                    backgroundColor: this.get('backgroundColor')
                },
                this.get('style')
            );
            lib.css(this.element, css);
        }
    });

    // export单例，基本一个页面一个mask就够了
    return new Mask();
});
