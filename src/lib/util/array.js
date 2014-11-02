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
        inArray: function (item,arr) {
            return util.indexOf(item, arr) > -1;
        },

        contains: function (arr,item) {
            return util.indexOf(item, arr) > -1;
        },
        /**
         * 判断一个是否是真是的数组对象
         * @param {Object} obj
         */
        isArray:function (obj) {

        },
        /**
         * 将类数组对象转换为真实的数组
         * @param {Object|Array} obj
         */
        makeArray:function(obj) {
            if (obj == null) {
                return [];
            }

            if (util.isArray(obj)) {
                return obj;
            }

            var ret = [];

            for (var i = 0, l = obj.length; i < l; i++) {
                ret[i] = obj[i];
            }
            return ret;
        }
    });

    return util;
});
