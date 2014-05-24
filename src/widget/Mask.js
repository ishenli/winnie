/**
 * @file Mask遮罩
 * @author ishenli
 */
define(function (require) {

    var Overlay = require('./Overlay');

    var lib = require('winnie/lib');

    var Mask = Overlay.extend({
        type:'Mask',
        options: {
            // 统一样式前缀
            classPrefix: 'ui-mask',
            width: '100%',
            height: '100%',
            opacity: 0.8,
            backgroundColor: '#000',
            //默认定位
            align: {
                baseElement:undefined
            }
        },
        show: function () {

            Mask.superClass.show.call(this);

            lib.setStyle(this.element, {
                opacity: this.get('opacity'),
                backgroundColor:this.get('backgroundColor')
            });
        }
    });

    //export单例，基本一个页面一个mask就够了
    return new Mask();
});