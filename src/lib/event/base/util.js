/**
 * @file event util
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var util = require('../../util');

    var exports = {};


    /**
     * 获取命名空间数组
     * @param {string} type
     * @returns {Array.<string>} ret
     */
    exports.getTypeNamespace = function (type) {
        // 没有命名空间
        if (type.indexOf('.') < 0) {
            return [type, ''];
        }
        var m = type.match(/([^.]+)?(\..+)?$/),
            t = m[1],
            ret = [t],
            ns = m[2];
        if (ns) {
            // 这个sort是为了进行namespace通过正则匹配
            // 如'.a.b.c' 和 '.a.c.d.b'
            // off('.b.c') 和 off('.a.b'）
            // 通过同一个正则 /.*\.a.*\.b(?:\.|$)/ 匹配
            ns = ns.split('.').sort();
            ret.push(ns.join('.'));
        } else {
            ret.push('');
        }
        return ret;

    };

    /**
     * 将参数的进行normalize，兼容多重参数形式，
     * 参考http://api.jquery.com/on/ 的传参方式
     * @param type
     * @param selector
     * @param fn
     * @param data
     * @param context
     */
    exports.normalizeParams = function (type, selector, fn, data, context) {

        if (util.isFunction(fn) && util.isString(selector)) {
            options = {
                selector: selector,
                fn: fn,
                context: context,
                data: data
            };
        }
        else if (util.isFunction(selector)) {
            options = {
                fn: selector,
                data: fn,
                context: data
            };
        }
        else  if (util.isObject(fn)){
            options = util.merge({
                selector:selector,
                data:fn
            })
        }

        var typeNamespace = exports.getTypeNamespace(type);

        options.type = typeNamespace[0];

        options.namespace = typeNamespace[1];

        return options;
    };
    /**
     * 根据类型的不同格式处理
     * @param {Function} callback
     * @param {number} index
     */
    exports.batchByType = function (callback, index) {
        var args = util.makeArray(arguments);
        var types = args[2 + index];

        if (types && util.isObject(types)) {
            /**
             * on(element, {
                  click: function (e) {},
                  mouseover: function (e) {},
                  'focus blur': function (e) {}
                });
             */
            util.each(types, function (value, type) {
                var args2 = [].concat(args); // 引用
                args2.splice(0, 2);
                args2[index] = type; // type 是click
                args2[index + 1] = value;
                // args = [target, click, fun, context]
                callback.apply(null, args2);
            });
        }
        else {
            /**
             * on(target,'click focus',func)
             */
            splitAndRun(types, function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 2); // // [target,'click focus',func]
                args2[index] = type; // [target,click,func]
                callback.apply(null, args2);
            });
        }
    };

    /**
     *
     * @param {string} namespace
     * @returns {RegExp}
     */
    exports.getNamespaceReg = function(namespace) {
        // 分组捕获
        // http://msdn.microsoft.com/zh-cn/library/az24scfc(v=vs.110).aspx
        return new RegExp(namespace.split('.').join('.*\\.') + '(?:\\.|$)');
    };

    /**
     *
     * @param {Array.<string>|string} type
     * @param {Function} fn
     */
    function splitAndRun(type, fn) {
        if (util.isArray(type)) {
            util.each(type, fn);
            return;
        }
        type = util.trim(type);
        if (type.indexOf(' ') === -1) {
            fn(type);
        }
        else {
            util.each(type.split(/\s+/), fn);
        }
    }

    exports.splitAndRun = splitAndRun;
    return exports;
});
