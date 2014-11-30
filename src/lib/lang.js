/**
 * @file 语言相关
 * @author ishenli
 */
define(function (require) {

    var util = require('./util');
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;

    var lang = {};

    lang.inherit = function (superClass, subClass) {
        function F() {
        }

        F.prototype = superClass.prototype;

        var selfPrototype = subClass.prototype;

        var proto = subClass.prototype = new F();

        for (var key in selfPrototype) {
            proto[key] = selfPrototype[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;

        return subClass;
    };

    /**
     * curry
     * @param {Function} fn
     * @returns {Function}
     */
    lang.curry = function (fn) {
        var args = slice.call(arguments, 1);
        return function () {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    };


    /**
     * 深度克隆一个对象
     * @param {Object} source
     * @returns {*}
     * http://www.cnblogs.com/rubylouvre/archive/2010/03/26/1696600.html
     */
    lang.deepClone = function (source) {
        if (!source || typeof source !== 'object') {
            return source;
        }

        var result = source;

        if (util.isArray(source)) {
            result = util.map(source, lang.deepClone); // 浅拷贝
        }
        // 如果每个成员是个对象，进行递归深度克隆
        else if (toString.call(source) === '[object Object]'
            // IE下，DOM和BOM对象上一个语句为true，
            // isPrototypeOf挂在`Object.prototype`上的，
            // 因此所有的字面量都应该会有这个属性
            // 对于在`window`上挂了`isPrototypeOf`属性的情况，直接忽略不考虑
            && ('isPrototypeOf' in source)
            ) {
            result = {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = lang.deepClone(source[key]);
                }
            }

        }

        return result;
    };

    return lang;
});
