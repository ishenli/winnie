/**
 * @file selector
 * @author shenli <meshenli@gmail.com>
 */
define(function (require) {

    var matches = require('./matches-selector');
    var util = require('../util');
    var dom = require('./base');

    var exports = {};

    var WINDOW = window;
    var doc = document;

    var docElem = doc.documentElement;
    var push = Array.prototype.push;


    // http://msdn.microsoft.com/en-us/library/ie/ms534635(v=vs.85).aspx
    // https://developer.mozilla.org/en-US/docs/Web/API/Node.compareDocumentPosition
    var compareNodeOrder = ('sourceIndex' in docElem) ? function (a, b) {
        return a.sourceIndex - b.sourceIndex;
    } : function (a, b) {
        if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
            return a.compareDocumentPosition ? -1 : 1;
        }
        var bit = a.compareDocumentPosition(b) & 4;
        return bit ? -1 : 1;
    };


    /**
     * 返回单个元素
     * @param {String|HTMLElement[]} selector
     * @param {String|HTMLElement[]|HTMLDocument|HTMLElement|Window} [context] 查找的context
     * @return {HTMLElement} 查找到的元素数组的首个元素
     */
    exports.get = function (selector, context) {
        return exports.query(selector, context)[0] || null;
    };

    /**
     * 获取元素
     * @param {string|HTMLElement} id 元素ID || dom元素
     * @return {HTMLElement|null} 获取的元素，找不到时返回null
     */
    exports.g = function (id) {
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
     * 查询元素
     * @param {string|HTMLElement=} selector
     * @param {HTMLElement|string} context
     * @returns {Node}
     */
    exports.query = function (selector, context) {
        var i;
        var ret;
        var simpleContext;
        var isSelectorString = typeof selector === 'string';
        var contexts = context !== undefined
            ? exports.query(context)
            : (simpleContext = 1) && [doc];

        var contextsLen = contexts.length;

        if (!selector) {
            ret = [];
        }
        else if (isSelectorString){

            selector = util.trim(selector);

            if (simpleContext) { // context为空
                if (selector === 'body') {
                    ret = [doc.body];
                }else {

                    // https://developer.mozilla.org/en-US/docs/Web/API/NodeList
                    ret = util.makeArray(document.querySelectorAll(selector));
                }
            }

            if (!ret) {
                ret = [];
                for (i= 0; i <contextsLen;i++) {
                    // 利用apply的querySelectorAll返回的类数组插入到ret
                    push.apply(ret, util.makeArray(contexts[i].querySelectorAll(selector)));
                }

                // 去重
                if (contextsLen > 1 && ret.length > 1){
                    exports.unique(ret);
                }
            }
        }
        else { // 传入dom元素

            // query(document.getElementById('xx'))
            if (selector.nodeType || util.isWindow(selector)) {
                ret = [selector];
            }
            // var x=query('.l');
            else if (util.isArray(selector)) {
                ret = selector;
            }
            // query(document.getElementsByTagName('a');
            else if (dom.isDomNodeList(selector)) {
                ret = util.makeArray(selector);
            }
            else {
                ret = [selector];
            }

            if (!simpleContext) {
                var tmp = ret,
                    ci,
                    len = tmp.length;
                ret = [];
                for (i = 0; i < len; i++) {
                    for (ci = 0; ci < contextsLen; ci++) {
                        if (exports.contains(contexts[ci], tmp[i])) {
                            ret.push(tmp[i]);
                            break;
                        }
                    }
                }
            }

        }

        ret.each = queryEach;

        return ret;
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
        container = exports.get(container);
        contained = exports.get(contained);

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
     * 获取某个元素在元素集合中的位置
     * @method module:lib.index
     * @param {(HTMLElement | string)} selector 目标元素
     * @param {string} list 元素集合
     * @return {?number} 位置
     */
    exports.index = function(selector,list) {
        var els = exports.query(selector),
            prev,
            n = 0,
            parent,
            els2,
            el = els[0];

        if (!list) {
            parent = el && el.parentNode;
            if (!parent) {
                return -1;
            }
            prev = el;
            while ((prev = prev.previousSibling)) {
                if (prev.nodeType === 1) {
                    n++;
                }
            }
            return n;
        }

        els2 = dom.query(list);

        return util.indexOf(el, els2);
    };


    /**
     * Sorts an array of Dom elements, in place, with the duplicates removed.
     * Note that this only works on arrays of Dom elements, not strings or numbers.
     * @param {HTMLElement[]} elements
     * @method
     * @return {HTMLElement[]}
     * @member dom
     */
    exports.unique = (function () {
        var hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
        // optimization where it does not always call our comparison
        // function. If that is the case, discard the hasDuplicate value.
        // Thus far that includes Google Chrome.
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0;
        });

        function sortOrder(a, b) {
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }

            return compareNodeOrder(a, b);
        }

        // 排序去重
        return function (elements) {

            hasDuplicate = baseHasDuplicate;
            elements.sort(sortOrder);

            if (hasDuplicate) {
                var i = 1, len = elements.length;
                while (i < len) {
                    if (elements[i] === elements[i - 1]) {
                        elements.splice(i, 1);
                        --len;
                    }
                    else {
                        i++;
                    }
                }
            }

            return elements;
        };
    })();


    /**
     * dom节点是否相等
     * @param {HTMLElement|HTMLElement[]} aNode
     * @param {HTMLElement|HTMLElement[]} bNode
     * @returns {boolean}
     */
    exports.equals = function(aNode, bNode) {

        aNode = exports.query(aNode);
        bNode = exports.query(bNode);

        if (aNode.length !== bNode.length) {
            return false;
        }

        for (var i = aNode.length; i >= 0; i--) {
            if (aNode[i] !== aNode[i]) {
                return false;
            }
        }
        return true;


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


    function queryEach(f) {
        var self = this,
            l = self.length,
            i;
        for (i = 0; i < l; i++) {
            if (f(self[i], i) === false) {
                break;
            }
        }
    }
    return exports;
});