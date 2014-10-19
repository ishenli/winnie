/**
 * @file array
 * array utilities of lang
 * @ignore
 * @author shenli （meshenli@gmail.com）
 * http://www.w3schools.com/jsref/jsref_obj_array.asp
 */
define(function (require) {

    var util = require('./base');
    var OP = Object.prototype;
    var toString = OP.toString;
    var class2type = {};

    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }

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

        function Ctor() {
            this.x = 1;
        }
        Ctor.prototype = {
            'valueOf': 1, 'y': 1
        };

        for (var prop in new Ctor()) {
            props.push(prop);
        }

        iteratesOwnLast = props[0] !== 'x';
    }());

    util.mix(util, {

        /**
         * 获取对象的类型
         * @param {*} o
         * @returns {string}
         */
        type: function (o) {
            return o == null ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },
        /**
         * 判断是否是一个纯粹对象
         * created using '{}' or 'new Object()' but not 'new FunctionClass()').
         * @member util
         * @param {*} obj
         */
        isPlainObject: function (obj) {
            if (!obj || util.type(obj) !== 'object' || obj.nodeType || obj.window === obj) {
                return false;
            }

            var key;
            var objConstructor;

            // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/isPrototypeOf
            try {
                if ((objConstructor = obj.constructor)
                    && !hasOwnProperty(obj , 'constructor')
                    && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')
                ) {
                    return false;
                }
            }
            catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return false;
            }

            // Support: IE<9
            // Handle iteration over inherited properties before own properties.
            // http://bugs.jquery.com/ticket/12199
            if (iteratesOwnLast) {
                for (key in obj) {
                    return hasOwnProperty(obj, key);
                }
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            /*jshint ignore:start*/
            for (key in obj) {

            }
            /*jshint ignore:end*/

            return key === undefined || hasOwnProperty(obj, key);
        }
    });

    var types = 'Boolean Number String Function Date RegExp Object Array'.split(' ');
    for (var i = 0; i < types.length; i++) {
        /*jshint loopfunc:true*/
        (function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            util['is' + name] = function (o) {
                return util.type(o) === lc;
            };
        })(types[i], i);
    }

    util.isArray = Array.isArray || util.isArray;

    return util;
});
