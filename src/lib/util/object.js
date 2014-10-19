/**
 * @file array
 * array utilities of lang
 * @ignore
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    util.mix(util,{

        equals: function(a,b) {
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
        isEmptyObject: function(obj) {
            for (var p in obj) {
                if (p !== undefined) {
                    return false
                }
            }
            return true;
        }
    });

    function compareObjects(a,b) {

    }
    return util;
});
