/**
 * @file string 辅助
 * @author shenli
 */
define(function () {

    var toString = Object.prototype.toString;

    var lib = {};

    /**
     * 将字符串转换成`camelCase`格式
     *
     * 该方法将横线`-`视为单词的 **唯一分隔符**
     *
     * @param {string} source 源字符串
     * @return {string}
     */
    lib.camelCase = function (source) {
        if (!source) {
            return '';
        }

        return String(source).replace(
            /-\D/g,
            function (alpha) {
                return alpha.charAt(1).toUpperCase();
            }
        );
    };

    /**
     * 将字符串解析成 JSON 对象。
     *
     * @method module:lib.object.parse
     * @param {string} source 需要解析的字符串
     *
     * @return {JSON} 解析结果 JSON 对象
     */
    lib.parse = window.JSON
        && JSON.parse
        || function (string) {
            return !string || typeof(string) !== 'string'
                ? null
                : eval('(' + string + ')');
        };

    /**
     * 判断是否为一个字符串
     * @param {string} val
     * @returns {boolean}
     */
    lib.isString = function (val) {
        return toString.call(val) === '[object String]';
    };


    /**
     * 获取字符串长度，unicode编码大于255，len补加1
     * @param {string} target
     * @returns {*}
     */
    lib.byteLen = function (target) {
        var len = target.length;
        var i = 0;
        for (; i < target.length; i++) {
            if (target.charCodeAt(i) > 255) {
                return len;
            }
        }

        return len;
    };


    /**
     * 去掉标签
     * @param {string} target 传入的文本
     * @returns {string}
     */
    lib.stripTags = function (target) {
        return String(target || '').replace(/<[^>]+>/g, '');
    };

    return lib;
});
