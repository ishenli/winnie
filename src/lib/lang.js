/**
 * @file 语言相关
 * @author ishenli
 */
define(function (require) {

    var u = require('underscore');
    var lib = {};
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;

    lib.now = u.now;

    lib.inherit = function (superClass, subClass) {
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
    lib.curry = function (fn) {
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
    lib.deepClone = function (source) {
        if (!source || typeof source !== 'object') {
            return source;
        }

        var result = source;

        if ($.isArray(source)) {
            result = u.map(source, lib.deepClone); // 浅拷贝
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
                    result[key] = lib.deepClone(source[key]);
                }
            }

        }

        return result;
    };


    /**
     * 从数组中删除对应元素
     * @param {Object} target
     * @param {Array}array
     * @returns {*}
     */
    lib.erase = function (target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                break;
            }
        }
        return array;
    };


    /**
     * from underscore throttle
     * @param {Function}func
     * @param {Number} wait
     * @param {Object} scope
     * @param {Object} options
     * @returns {Function}
     */

    lib.throttle = u.throttle;
    /**
     * 返回func的debounce版本，将延迟函数的执行在函数最后一次调用时刻的wait毫秒之后
     * @param {Function}func
     * @param {Number} wait
     * @param {Object} scope
     * @param {Boolean} immediate
     * @returns {Function}
     */
    lib.debounce = u.debounce;

    /**
     * 简单的延迟
     * @param {function} func
     * @param {number} wait 时间秒
     * @returns {*|number}
     */
    lib.delay = function (func, wait) {
        var args = Array.prototype.slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    };

    lib.isEmpty = function (obj) {
        if (obj == null) {
            return true;
        }
        if (u.isArray(obj) || typeof (obj) === 'string') {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    };

    /**
     * object.keys 封装
     * @type {Function}
     */
    lib.keys = Object.keys ? Object.keys : function (o) {
        var result = [];
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                result.push(name);
            }
        }

        return result;
    };

    /**
     * Detect the JScript [[DontEnum]] bug:
     * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
     * made non-enumerable as well.
     * https://github.com/bestiejs/lodash/blob/7520066fc916e205ef84cb97fbfe630d7c154158/lodash.js#L134-L144
     */
    /** Detect if own properties are iterated after inherited properties (IE < 9) */
    var iteratesOwnLast;
    (function() {
        var props = [];
        function Ctor() { this.x = 1; }
        Ctor.prototype = { 'valueOf': 1, 'y': 1 };
        for (var prop in new Ctor()) { props.push(prop); }
        iteratesOwnLast = props[0] !== 'x';
    }());

    lib.isWindow = function (o) {
        return o != null && o == o.window;
    };

    lib.isPlainObject = function (o) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor
        // property. Make sure that DOM nodes and window objects don't
        // pass through, as well
        if (!o || toString.call(o) !== "[object Object]" ||
            o.nodeType || lib.isWindow(o)) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        var key;

        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        // http://bugs.jquery.com/ticket/12199
        if (iteratesOwnLast) {
            for (key in o) {
                return hasOwn.call(o, key);
            }
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in o) {
        }

        return key === undefined || hasOwn.call(o, key);
    };

    return lib;
});
