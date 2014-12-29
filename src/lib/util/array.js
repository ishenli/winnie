/**
 * @file array
 * array utilities of lang
 * @ignore
 * @author shenli （meshenli@gmail.com）
 * http://www.w3schools.com/jsref/jsref_obj_array.asp
 */
define(function (require) {

    var util = require('./base');
    var AP = Array.prototype;
    var indexOf = AP.indexOf;

    util.mix(util, {
        /**
         * indexOf
         * @method
         * @member util
         * @param {number} item individual item to be searched
         * @param {Array} arr the array of items where item will be search
         * @param {number=} from  where to start the search
         * @return {number} item's index in array
         */
        indexOf: indexOf
            ? function (item, arr, from) {
            return from === undefined
                ? indexOf.call(arr, item)
                : indexOf.call(arr, item, from);
        }
            : function (item, arr, from) {
            for (var i = from || 0, len = arr.length; i < len; ++i) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * 判断一个是否是真是的数组对象
         * @param {*} item
         * @param {Object} arr
         */
        inArray: function (item, arr) {
            return util.indexOf(item, arr) > -1;
        },

        contains: function (arr, item) {
            return util.indexOf(item, arr) > -1;
        },

        /**
         * 将类数组对象转换为真实的数组
         * @param {Object|Array} obj
         */
        makeArray: function (obj) {
            if (obj == null) {
                return [];
            }

            if (util.isArray(obj)) {
                return obj;
            }

            var lengthType = typeof obj.length,
                oType = typeof obj;
            // The strings and functions also have 'length'
            if (lengthType !== 'number' ||
                    // select element
                typeof obj.nodeName === 'string' ||
                    // window
                    /*jshint eqeqeq:false*/
                (obj != null && obj == obj.window) ||
                oType === 'string' ||
                    // https://github.com/ariya/phantomjs/issues/11478
                (oType === 'function' && !('item' in obj && lengthType === 'number'))) {
                return [obj];
            }

            // 类数组，如nodeList
            var ret = [];

            for (var i = 0, l = obj.length; i < l; i++) {
                ret[i] = obj[i];
            }
            return ret;
        }
        ,
        /**
         * 从数组中删除对应元素
         * @param {Object} target
         * @param {Array}array
         * @returns {*}
         */
        erase: function (target, array) {
            for (var i = 0; i < array.length; i++) {
                if (target === array[i]) {
                    array.splice(i, 1);
                    break;
                }
            }
            return array;
        }
        ,
        map: AP.map ?
            function (arr, fn, context) {
                return AP.map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                    if (el ||
                            //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },
        filter: AP.filter ?
            function (arr, fn, context) {
                return AP.filter.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var ret = [];
                util.each(arr, function (item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
        }
    });

    return util;
})
;
