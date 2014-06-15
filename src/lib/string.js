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
        //正则可以参考 https://www.imququ.com/post/bom-and-javascript-trim.html
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


    /**
     * 重复字符串，n为重复次数，该方法在n特别大的情况有性能损失
     * @param target
     * @param n
     * @returns {string}
     */
    lib.repeat = function(target,n) {
        return (n <= 0) ? '' : target.concat(repeat(target, --n));
    };

    /**
     * 获取字符串长度，unicode编码大于255，len补加1
     * @param target
     * @returns {*}
     */
    lib.byteLen = function(target) {
        var len = target.length, i = 0;
        for(;i<target.length;i++) {
            if(target.charCodeAt(i) > 255) {
                return len;
            }
        }

        return len;
    };

    /**
     * 截断，默认30个字符
     * @param target
     * @param length
     * @param truncation
     * @returns {string}
     */
    lib.truncate = function(target,length,truncation) {
        length = length || 30;
        truncation = truncation === void(0) ? '...' : truncation;
        return target > length
            ? target.slice(0, length - truncation.length) + truncation
            : String(target);

    };

    lib.stripTags = function(target) {
        return String(target || '').replace(/<[^>]+>/g, '');
    };

    lib.escapeHTML = function(target) {
        return target.replace(/&/g, '&amp;')
            .replace(/</g, '&lt')
            .replace(/>/g, '&gt')
            .replace(/"/g, '&quot')
            .replace(/'/g, '&#39;');
    };

    lib.unescapeHTML = function(target) {
        return target.replace(/&amp;/, '&')
            .replace(/&lt/g, '<')
            .replace(/&gt/g, '>')
            .replace(/&quot/g, '"')
            .replace(/&#39;/g, "'");
    };
    return lib;
});