/**
 * @file selector
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var matches = require('./matches-selector');
    var util = require('../util');
    var dom = require('./base');

    var exports = {};

    var WINDOW = window;

    /**
     * 获取元素
     * @param {string|HTMLElement} id 元素ID || dom元素
     * @return {HTMLElement|null} 获取的元素，找不到时返回null
     */
    exports.get = exports.g = function (id) {
        if (!id) {
            return null;
        }

        if (typeof id === 'string') {
            if (id.indexOf('#') === 0) {
                id = id.substr(1);

            }
            return document.getElementById(id);
        }
        else {
            return id;
        }

    };

    /**
     * 查询元素，不兼容ie6/7
     * @param selector
     * @param el
     * @returns {Node}
     */
    exports.query = function (selector, el) {
        el = el || document;
        return el.querySelector(selector);
    };

    /**
     * 查询元素集合
     * @param selector
     * @param el
     * @returns {NodeList}
     */
    exports.queryAll = function (selector, el) {

        if (util.isArray(selector) && selector[0].nodeType) { // 传入一个dom元素的数组
            return selector;
        }
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
    exports.closest = function (element, selector, root, checkYoSelf) {
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
            // (when the root is not the document)`
            if (element === root) {
                return;
            }
        }
    };

    /**
     * 获取document
     * @param {undefined|HTMLElement|window} ele
     * @returns {HTMLDocument}
     */
    exports.getDocument = function(ele) {
        if (!ele) {
            return Window.document;
        }

        ele = exports.g(ele);

        return util.isWindow(ele)
            ? ele.document
            : (ele.nodeType === dom.NodeType.DOCUMENT_NODE ? ele : ele.ownerDocument);
    };

    /**
     * Return corresponding window if elem is document or window.
     * Return global window if elem is undefined
     * Else return false.
     * @param {undefined|Window|HTMLDocument} [elem]
     * @return {Window|Boolean}
     */
    exports.getWindow = function (elem) {
        if (!elem) {
            return WINDOW;
        }

        elem = dom.g(elem);

        if (util.isWindow(elem)) {
            return elem;
        }

        var doc = elem;

        if (doc.nodeType !== NodeType.DOCUMENT_NODE) {
            doc = elem.ownerDocument;
        }

        return doc.defaultView || doc.parentWindow;
    };


    /**
     * 判断一个元素是否包含另一个元素
     * @param container 包含的元素
     * @param contained 被包含的元素
     * @returns {boolean|*|Boolean}
     */
    exports.contains = function (container, contained) {
        container = exports.g(container);
        contained = exports.g(contained);

        return container.contains
            ? container !== contained && container.contains(contained)
            : !!(container.computePosition(contained) & 16);
    };

    /**
     * 获取目标元素符合条件的最近的祖先元素
     *
     * @method module:lib.getAncestorBy
     * @param {(HTMLElement | string)} element 目标元素
     * @param {Function} condition 判断祖先元素条件的函数，function (element)
     * @param {?string} arg
     * @return {?HTMLElement} 符合条件的最近的祖先元素，查找不到时返回 null
     */
    exports.getAncestorBy = function (element, condition, arg) {

        while ((element = element.parentNode) && element.nodeType === 1) {
            if (condition(element, arg)) {
                return element;
            }
        }

        return null;
    };

    /**
     * 获取元素的子节点
     *
     * @public
     * @param {HTMLElement} element DOM元素
     * @return {Array.<HTMLElement>} 子节点
     */
    exports.children = function ( element ) {
        var res = [];

        var items = element.children;
        for ( var i = 0, item; item = items[ i ]; i++ ) {
            if ( item.nodeType == 1 ) {
                res.push( item );
            }
        }

        return res;
    };

    /**
     * 获取目标元素指定元素className最近的祖先元素
     *
     * @method module:lib.getAncestorByClass
     * @param {(HTMLElement | string)} element 目标元素或目标元素的id
     * @param {string} className 祖先元素的class，只支持单个class
     *
     * @return {?HTMLElement} 指定元素className最近的祖先元素，
     * 查找不到时返回null
     */
    exports.getAncestorByClass = function (element, className) {
        return exports.getAncestorBy(element, exports.hasClass, className);
    };

    /**
     * 根据className 查找元素的子节点
     * @param element
     * @param className
     * @param all
     * @returns {HTMLElement|Array.<HTMLElement>|null}
     */
    exports.getChildrenByClass = function (element, className, all) {
        function hasClass(element) {
            return exports.hasClass(element, className);
        }

        return walk(element, 'nextSibling', 'firstChild', hasClass, all);
    };

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
        var el = exports.g(element)[start || walk];
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

    return exports;
});