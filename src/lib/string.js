/**
 * @file string 辅助
 * @author shenli
 */
define(function (require) {

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
    lib.camelCase =function(source) {
        if(!source) {
            return '';
        }

        return String(source).replace(
            /-\D/g,
            function(alpha) {
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
            return !string || typeOf(string) !== 'string'
                ? null
                : eval('(' + string + ')');
        };


    /**
     * 去掉字符串两边的空白
     */
    lib.trim = (function () {
        var whitespace = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;

        return function (str, triment) {
            return str && String(str).replace(triment || whitespace, '') || '';
        };
    }());


    /**
     * 判断是否为一个字符串
     * @param val
     * @returns {boolean}
     */
    lib.isString=function(val) {
        return toString.call(val) === '[object String]';
    };
    return lib;
});