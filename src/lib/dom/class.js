/**
 * @file class 操作
 * @author shenli （meshenli@gmail.com）
 * https://developer.mozilla.org/zh-CN/docs/DOM/element.classList
 */
define(function (require) {

    var util = require('../util');
    var dom = require('./base');
    var slice = Array.prototype.slice;
    var RE_SPLIT = /[\.\s]\s*\.?/;

    var exports = {};

    exports.hasClass = function (selector, className) {

        var ret = false;
        className = str2Array(className);

        dom.query(selector).each(function (element) {
            if (element.nodeType === dom.NodeType.ELEMENT_NODE && exports._hasClass(element, className)) {
                ret = true;
                return false;
            }

            return undefined;
        });

        return ret;
    };

    exports._hasClass = function (element, classNames) {
        var i;
        var l;
        var className;
        var classList = element.classList;

        if (classList.length) {
            for (i = 0, l = classNames.length; i < l; i++) {
                className = classNames[i];
                if (className && !classList.contains(className)) {
                    return false;
                }
            }
            return true;
        }

        return false;
    };

    exports._addClass = createClassList('add');

    /**
     * 添加class
     * @param {HTMLElement|string} element
     * @param {string} className
     * @returns {*}
     */
    exports.addClass = createClassMethod('_addClass');


    exports._removeClass = createClassList('remove');

    exports.removeClass = createClassMethod('_removeClass');

    exports._toggleClass = createClassList('toggle');

    exports.toggleClass = createClassMethod('_toggleClass');

    /**
     * 替换class
     * @param {HTMLElement} element
     * @param {string} oldClassName
     * @param {string} newClassName
     */
    exports.replaceClass = function (element, oldClassName, newClassName) {
        exports.removeClass(element,oldClassName);
        exports.addClass(element, newClassName);
    };


    /**
     * 将'.class1 class2 .class3’ 转为[class1,class2,class3]
     * @param {string} str
     * @returns {Array} newArr
     */
    function str2Array(str) {
        str = util.trim(str || '');
        var arr = str.split(RE_SPLIT);

        var newArr = [];
        var v;
        var len = arr.length;
        var i = 0;
        for (; i < len; i++) {
            if ((v = arr[i])) {
                newArr.push(v);
            }
        }
        return newArr;
    }

    /**
     * 创建各种classList
     * @param {string} method
     * @returns {Function}
     */
    function createClassList(method) {
        return function (element, classNames) {
            var classList = element.classList;
            var extraArgs = slice.call(arguments, 2);
            var className;
            for (var i = 0, len = classNames.length; i < len; i++) {
                if (className = classNames[i]) {
                    element.classList[method].apply(classList, [className].concat(extraArgs));

                }
            }
            return element;
        };
    }

    function createClassMethod (method) {
        return function (element,classNames) {
            element = dom.g(element);
            if (classNames === '') {
                throw new Error('className must not be empty');
            }


            if (!element || !classNames) {
                return element;
            }

            classNames = str2Array(classNames);

            var extArgs = slice.call(arguments, 2);
            // 因为exports的方法会拓展到dom上
            exports[method].apply(exports, [element, classNames].concat(extArgs));
        };
    }

    return exports;
});