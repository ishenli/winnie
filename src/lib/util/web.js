/**
 * @file string
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    util.mix(util, {

        /**
         * 判断是否是窗口对象
         * @member util
         */
        isWindow: function (obj) {
            return obj !== null && obj == obj.window;
        }
    })
});