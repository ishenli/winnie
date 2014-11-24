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
        bind = function(fn,obj) {
            var extraArgs = [].slice.call(arguments, 2);
            return function() {
                var args = extraArgs.concat([].slice.call(arguments));
                return fn.apply(obj, args);
            };
        };
    }

    util.mix(util, {
        noop: function () {
            return function() {

            }
        },
        /**
         *
         */
        bind:bind
    });

    return util;
});
