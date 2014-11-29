/**
 * @file function
 * @ignore
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    var nativeBind = Function.prototype.bind;

    var bind;

    /**
     * 固定函数的this和若干参数
     * @params {Function} fn 操作的目标函数
     * @params {Mixed} this
     * @params {Mixed...} 若干参数
     */
    if (typeof nativeBind === 'function') {
        bind = function (fn) {
            return nativeBind.apply(fn, [].slice.call(arguments, 1));
        };

    }
    else {
        bind = function (fn, obj) {
            var extraArgs = [].slice.call(arguments, 2);
            return function () {
                var args = extraArgs.concat([].slice.call(arguments));
                return fn.apply(obj, args);
            };
        };
    }

    util.mix(util, {
        noop: function () {
            return function () {

            }
        },
        /**
         *
         */
        bind: bind,
        /**
         * from underscore throttle
         * @param {Function}func
         * @param {Number} wait
         * @param {Object} scope
         * @param {Object} options
         * @returns {Function}
         */

        throttle: function (func, wait, scope, options) {
            var context;
            var args;
            var result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function () {
                previous = options.leading === false ? 0 : $.now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };

            return function () {
                var now = $.now();
                if (!previous && options.leading === false) {
                    previous = now;
                }
                var remaining = wait - (now - previous);
                context = scope || this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                }
                else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        /**
         * 返回func的debounce版本，将延迟函数的执行在函数最后一次调用时刻的wait毫秒之后
         * @param {Function}func
         * @param {Number} wait
         * @param {Object} scope
         * @param {Boolean} immediate
         * @returns {Function}
         */
        debounce: function (func, wait, scope, immediate) {
            var timeout;
            var args;
            var context;
            var timestamp;
            var result;
            var later = function () {
                var last = $.now() - timestamp;
                if (last < wait && last > 0) {
                    timeout = setTimeout(later, wait - last);
                }
                else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        context = args = null;
                    }
                }
            };

            return function () {
                context = scope || this;
                args = arguments;
                timestamp = $.now();
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };
        },
        /**
         * 简单的延迟
         * @param {function} func
         * @param {number} wait 时间秒
         * @returns {*|number}
         */
        delay: function (func, wait) {
            var args = Array.prototype.slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        }
    });

    return util;
});
