/**
 * @file string
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var util = require('./base');
    var trim = String.prototype.trim;
    var RE_TRIM = /^[\s\xa0]+|[\sxa0]]+$/g;

    util.mix(util, {
        trim: trim
            ? function (str) {
            return str == null ? '' : trim.call(str);
        }
            : function (str) {
            return str == null ? '' : (str + '').replace(RE_TRIM,'');
        },
        /**
         * 将字符串转换成`camelCase`格式
         *
         * 该方法将横线`-`视为单词的 **唯一分隔符**
         *
         * @param {string} source 源字符串
         * @return {string}
         */
        camelCase: function (source) {
            if (!source) {
                return '';
            }
            if (source.indexOf('-') === -1) {
                return source;
            }

            return String(source).replace(
                /-([a-z])/ig,
                function (alpha) {
                    return alpha.charAt(1).toUpperCase();
                }
            );
        },
        /**
         * 获取字符串字节长度
         * @param {string} target
         * @returns {*}
         */
        byteLen: function (target) {
            var len = target.length;
            var i = 0;
            for (; i < target.length; i++) {
                if (target.charCodeAt(i) > 255) {
                    return len;
                }
            }

            return len;
        },
        /**
         * 去掉标签
         * @param {string} target 传入的文本
         * @returns {string}
         */
        stripTag: function (target) {
            return String(target || '').replace(/<[^>]+>/g, '');
        },

        /**
         * 字符串转数组
         * @param {string} str
         * @param {string} d
         * @returns {Array|*}
         */
        strToArray: function(str, d) {
            return str.split(d || ' ');
        }
    })
});