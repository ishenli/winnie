/**
 * @file 语言相关
 * @author ishenli
 */
define(function (require) {

    var u = require('underscore');

    var lib = {};

    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    lib.inherit = function (superClass,subClass) {
        function F() {}

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
     * @param fn
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
     * @param source
     * @returns {*}
     * http://www.cnblogs.com/rubylouvre/archive/2010/03/26/1696600.html
     */
    lib.deepClone = function (source) {
        if (!source || typeof source !== 'object') {
            return source;
        }

        var result = source;

        if (u.isArray(source)) {
            result = u.clone(source); //浅拷贝
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

    //各种辅助函数
    var iteratesOwnLast;
    (function() {
        var props = [];
        function Ctor() { this.x = 1; }
        Ctor.prototype = { 'valueOf': 1, 'y': 1 };
        for (var prop in new Ctor()) { props.push(prop); }
        iteratesOwnLast = props[0] !== 'x';
    }());

    lib.isWindow=function(o) {
        return o != null && o === o.window;
    };



    lib.isPlainObject=function(o) {
        if (!o || toString.call(o) !== '[object Object]'||
            o.nodeType || lib.isWindow(o)) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (o.constructor &&
                !hasOwnProperty.call(o, 'constructor') &&
                !hasOwnProperty.call(o.constructor.prototype, 'isPrototypeOf')) {
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
                return hasOwnProperty.call(o, key);
            }
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        /* jshint ignore:start */
        for (key in o) {}
        return key === undefined || hasOwnProperty.call(o, key);
        /* jshint ignore:end */
    };


    /**
     * 从数组中删除对应元素
     * @param target
     * @param array
     * @returns {*}
     */
    lib.erase = function(target, array) {
        for (var i = 0; i < array.length; i++) {
            if (target === array[i]) {
                array.splice(i, 1);
                break;
            }
        }
        return array;
    };


    lib.guid =  (function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return function() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })();
    return lib;
});