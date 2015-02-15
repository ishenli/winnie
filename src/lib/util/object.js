/**
 * @file object
 * @ignore
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    var toString = Object.prototype.toString;

    util.mix(util, {

        equals: function (a, b) {
            if (a === b) {
                return true;
            }

            // 为undefined 和 null
            if (a === undefined || a === null || b === undefined || b === null) {
                // need type coercion
                return a == null && b == null;
            }

            if (typeof a === 'object' && typeof b === 'object') {
                return compareObjects(a, b);
            }

            return (a === b);
        },
        /**
         * Gets current date in milliseconds.
         * @method
         * refer:  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         * @member util
         * @return {Number} current time
         */
        now: Date.now || function () {
            return +new Date();
        },
        /**
         * 是否是一个空对象
         * @param {*} obj
         * @returns {boolean}
         */
        isEmptyObject: function (obj) {
            for (var p in obj) {
                if (p !== undefined) {
                    return false
                }
            }
            return true;
        },
        /**
         * 获取对象的keys
         * @param {Object} obj
         */
        keys: Object.keys || function(obj) {
            var result = [];
            var pro;
//            var i;

            for (pro in obj) {
                if(obj.hasOwnProperty(pro)) {
                    result.push(pro);
                }
            }

            // ie有个枚举的bug
            return result;
        },
        /**
         * 遍历
         * @param {Object} obj
         * @param {Function} fn
         * @param {*=} context
         */
        each: function (obj, fn, context) {
            var length = obj && obj.length; // array含有length属性
            var isObj = length === undefined || toString.call(obj) === '[object Function]';
            context = context || null;
            var keys;
            var key;
            var i = 0;
            var val;
            if (isObj) {
                keys = util.keys(obj);
                for (; i < keys.length; i++) {
                    key = keys[i];
                    if (fn.call(context, obj[key], key, obj) === false) {
                        break;
                    }
                }
            }
            else {
                for (val = obj[0];i < length;val = obj[++i]) {
                    if (fn.call(context,val,i,obj) === false) {
                        break;
                    }
                }
            }

            return obj;
        },
        /**
         * 对象属性拷贝
         *
         * @param {Object} target 目标对象
         * @param {...Object} source 源对象
         * @return {Object}
         */
        extend: function (target, source) {
            for ( var i = 1, len = arguments.length; i < len; i++ ) {
                source = arguments[ i ];

                if ( !source ) {
                    continue;
                }

                for ( var key in source ) {
                    if ( source.hasOwnProperty( key ) ) {
                        target[ key ] = source[ key ];
                    }
                }

            }

            return target;
        },
        merge: function (varArgs) {
            varArgs = util.makeArray(arguments);
            var o = {},
                i,
                l = varArgs.length;
            for (i = 0; i < l; i++) {
                util.mix(o, varArgs[i]);
            }
            return o;
        },
        /**
         * 获取对象类型
         *
         * @param {Object} target 目标对象
         * @return string
         */
        type: function (target) {
            return toString.call(target).replace(/\[object (\w+)\]/, '$1').toLowerCase();
        }
    });

    function compareObjects(a, b) {

    }

    return util;
});
