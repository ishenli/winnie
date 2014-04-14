/**
 * @file dom
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var u = require('underscore');
    var matches = require('./matches-selector');


    var lib = {};

    lib.dom = {};
    /**
     * 获取元素
     * @param id 元素ID || dom元素
     */
    lib.g = function (id) {
        if (!id) {
            return null;
        }
        return typeof id === 'string' ? document.getElementById(id) : id;
    };

    /**
     * 查询元素，不兼容ie6/7
     * @param selector
     * @param el
     * @returns {Node}
     */
    lib.query = function (selector, el) {
        el = el || document;
        return el.querySelector(selector);
    };

    /**
     * 查询元素集合
     * @param selector
     * @param el
     * @returns {NodeList}
     */
    lib.queryAll = function (selector, el) {
        el = el || document;
        return el.querySelectorAll(selector);
    };

    /**
     * 类似 jquery closest
     * @param element
     * @param selector
     * @param checkYoSelf
     * @param root
     * @returns {{parentNode: *}}
     * 因为依赖querySelectorAll，该方法不支持ie6/7
     */
    lib.closest = function (element, selector, checkYoSelf, root) {
        element = checkYoSelf ? {parentNode: element} : element;

        root = root || document;

        // Make sure `element !== document` and `element != null`
        // otherwise we get an illegal invocation
        while ((element = element.parentNode) && element !== document) {
            if (matches(element, selector)) {
                return element;
            }
            // After `matches` on the edge case that
            // the selector matches the root
            // (when the root is not the document)
            if (element === root) {
                return;
            }
        }
    };
    /**
     * 删除某个节点
     * @param element
     */
    lib.removeNode = function (element) {
        if (typeof element === 'string') {
            element = lib.g(element);
        }

        if (!element) {
            return;
        }
        var parent = element.parentNode;

        parent && parent.removeChild(element);

    };

    /**
     * 将目标元素添加到基准元素之后
     *
     * @param {HTMLElement} element 被添加的目标元素
     * @param {HTMLElement} reference 基准元素
     * @return {HTMLElement} 被添加的目标元素
     */
    lib.insertAfter = function (element, reference) {
        var parent = reference.parentNode;

        if (parent) {
            parent.insertBefore(element, reference.nextSibling);
        }
        return element;
    };

    /**
     * 将目标元素添加到基准元素之前
     *
     * @param {HTMLElement} element 被添加的目标元素
     * @param {HTMLElement} reference 基准元素
     * @return {HTMLElement} 被添加的目标元素
     */
    lib.insertBefore = function (element, reference) {
        var parent = reference.parentNode;

        if (parent) {
            parent.insertBefore(element, reference);
        }

        return element;
    };
    /**
     * 判断是否表单元素
     * @param element
     * @returns {boolean}
     */
    lib.isInput = function (element) {
        var nodeName = element.nodeName.toLowerCase();

        return nodeName === 'input'
            || nodeName === 'select'
            || nodeName === 'textarea';
    };

    /**
     * 判断元素时候为某个标签元素
     * @param element
     * @param tagName
     * @returns {boolean}
     */
    lib.isTagElement = function (element, tagName) {
        return element.tagName.toLowerCase() === tagName;
    };

    /**
     * 判断一个元素是否包含另一个元素
     * @param container 包含的元素
     * @param contained 被包含的元素
     * @returns {boolean|*|Boolean}
     */
    lib.contains = function (container, contained) {
        container = lib.g(container);
        contained = lib.g(contained);

        return container.contains
            ? container !== contained && container.contains(contained)
            : !!(container.computePosition(contained) & 16);
    };

    lib.hasClass = function (element, className) {

        element = lib.g(element);

        if (element.classList) {
            return element.classList.contains(className);
        }
        var classes = getClassList(element);

        return u.contains(classes, className);

    };

    /**
     * 添加class
     * @param element
     * @param className
     * @returns {*}
     */
    lib.addClass = function (element, className) {
        element = lib.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }

        if (!element || !className) {
            return element;
        }

        //https://developer.mozilla.org/zh-CN/docs/DOM/element.classList
        if (element.classList) {
            element.classList.add(className);
            return element;
        }

        var classes = getClassList(element);

        if (u.contains(classes, className)) {
            return element;
        }

        classes.push(className);

        element.className = className.join(' ');

        return element;
    };

    /**
     * 批量添加class
     * @param element
     * @param {string[]} classes
     * @returns element
     */
    lib.addClasses = function (element, classes) {
        element = lib.g(element);
        if (classes === '') {
            throw new Error('className must not be empty');
        }

        if (!element || !classes) {
            return element;
        }

        if (element.classList) {
            u.each(classes, function (className) {
                element.classList.add(className);
            });
            return element;
        }

        var originClasses = getClassList(element);

        var newClasses = u.union(originClasses, classes);

        if (newClasses.length > originClasses.length) {
            element.className = newClasses.join(' ');
        }

        return element;
    };

    lib.removeClass = function (element, className) {
        element = lib.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }

        if (!element || !className) {
            return element;
        }

        if (element.classList) {
            element.classList.remove(className);
            return element;
        }

        var classes = getClassList(element);
        var changed = false;
        for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                i--;
                changed = true;
            }
        }
        if (changed) {
            element.className = classes.join(' ');
        }

        return element;
    };

    /**
     * 获取目标元素符合条件的最近的祖先元素
     *
     * @method module:lib.dom.getAncestorBy
     * @param {(HTMLElement | string)} element 目标元素
     * @param {Function} condition 判断祖先元素条件的函数，function (element)
     * @param {?string} arg
     * @return {?HTMLElement} 符合条件的最近的祖先元素，查找不到时返回 null
     */
    lib.getAncestorBy = function (element, condition, arg) {

        while ((element = element.parentNode) && element.nodeType === 1) {
            if (condition(element, arg)) {
                return element;
            }
        }

        return null;
    };

    /**
     * 获取目标元素指定元素className最近的祖先元素
     *
     * @method module:lib.dom.getAncestorByClass
     * @param {(HTMLElement | string)} element 目标元素或目标元素的id
     * @param {string} className 祖先元素的class，只支持单个class
     *
     * @return {?HTMLElement} 指定元素className最近的祖先元素，
     * 查找不到时返回null
     */
    lib.getAncestorByClass = function (element, className) {
        return lib.getAncestorBy(element, lib.hasClass, className);
    };

    /**
     * 根据className 查找元素的子节点
     * @param element
     * @param className
     * @param all
     * @returns {HTMLElement|Array.<HTMLElement>|null}
     */
    lib.getChildrenByClass = function (element, className, all) {
        function hasClass(element) {
            return lib.hasClass(element, className);
        }

        return walk(element, 'nextSibling', 'firstChild', hasClass, all);
    };


    //helpers
    function getClassList(element) {
        return element.className
            ? element.className.split(/\s+/)
            : [];
    }

    /**
     * DOM 步进遍历
     *
     * @inner
     * @param {HTMLElement} element 当前元素
     * @param {string} walk 步进方式，如 previousSibling
     * @param {?string} start 开始元素节点选择
     * @param {?Function} match 对元素匹配的回调函数
     * @param {boolean} all 是否查找所有符合的元素
     * @return {(HTMLElement | Array.<HTMLElement> | null)} 匹配结果
     */
    function walk(element, walk, start, match, all) {
        var el = lib.g(element)[start || walk];
        var elements = [];
        while (el) {
            if (el.nodeType === 1 && (!match || match(el))) {
                if (!all) {
                    return el;
                }
                elements.push(el);
            }

            el = el[walk];
        }
        return (all) ? elements : null;
    }

    return lib;
});