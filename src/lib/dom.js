/**
 * @file dom
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var u = require('underscore');
    var matches = require('./matches-selector');


    var lib = {};

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
        if (!selector) {
            return null;
        }
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

        if (!selector) {
            return null;
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
     * 将目标元素添加
     * @param {HTMLElement} el 被添加的目标元素
     * @param {HTMLElement|String} stuff 添加的目标元素或字符串
     * @return {HTMLElement} 被添加的目标元素
     */

    //插入到元素内部
    lib.append = function (el,stuff) {
        return lib.insert(el, stuff, "beforeEnd");
    };

    lib.prepend = function (el,stuff) {
        return lib.insert(el, stuff, "afterBegin");
    };

    lib.before = function (el,stuff) {
        return lib.insert(el, stuff, "beforeBegin");
    };

    //插入到元素同级
    lib.after = function (el,stuff) {
        return lib.insert(el, stuff, "afterEnd");
    };

    /**
     * 插入元素
     * @param el
     * @param stuff
     * @param where
     * @returns {*}
     * 以下元素的innerHTML在IE中是只读的，调用insertAdjacentElement进行插入就会出错
     * col, colgroup, frameset, html, head, style,
     * title,table, tbody, tfoot, thead, 与tr;
     * http://www.cnblogs.com/rubylouvre/archive/2009/12/14/1622631.html
     * https://developer.mozilla.org/zh-CN/docs/Web/API/Element.insertAdjacentHTML
     */
    lib.insert = function (el, stuff, where) {
        var doc = el.ownerElement || document;
        var frag = document.createDocumentFragment();

        if (stuff.version) { //如果是dom节点,则把它里面的元素节点移到文档碎片中
            stuff.forEach(function (el) {
                frag.appendChild(el);
            });
            stuff = frag;
        }

        //供火狐与IE部分元素调用
        lib._insertAdjacentElement = function (el, node, where) {
            switch (where) {
                case 'beforeBegin':
                    el.parentNode.insertBefore(node, el)
                    break;
                case 'afterBegin':
                    el.insertBefore(node, el.firstChild);
                    break;
                case 'beforeEnd':
                    el.appendChild(node);
                    break;
                case 'afterEnd':
                    if (el.nextSibling) el.parentNode.insertBefore(node, el.nextSibling);
                    else el.parentNode.appendChild(node);
                    break;
            }
        };

        lib._insertAdjacentHTML = function (el, htmlStr, where) {
            var range = doc.createRange();
            switch (where) {
                case "beforeBegin"://before
                    range.setStartBefore(el);
                    break;
                case "afterBegin"://after
                    range.selectNodeContents(el);
                    range.collapse(true);
                    break;
                case "beforeEnd"://append
                    range.selectNodeContents(el);
                    range.collapse(false);
                    break;
                case "afterEnd"://prepend
                    range.setStartsAfter(el);
                    break;
            }
            var parsedHTML = range.createContextualFragment(htmlStr);
            lib._insertAdjacentElement(el, parsedHTML, where);
        };

        //如果是节点则复制一份
//        stuff = stuff.nodeType ? stuff.cloneNode(true) : stuff;

        if (el.insertAdjacentHTML) {//ie,chrome,opera,safari都已实现insertAdjactentXXX家族
            el['insertAdjacent' + (stuff.nodeType ? 'Element' : 'HTML')](where, stuff);
        } else {
            //火狐专用
            lib['_insertAdjacent' + (stuff.nodeType ? 'Element' : 'HTML')](el, stuff, where);
        }

        return el;
    };

    /**
     * 包裹dom节点
     * @param wrapEle
     * @param innerEles
     */
    lib.wrap = function(wrapEle,innerEles) {
        if(!innerEles.length) { //是一个元素
            innerEles = [innerEles];
        }

        for(var i =0;i<innerEles.length;i++) {
            var item = innerEles[i].cloneNode(true);
            wrapEle.appendChild(item);
        }

        var parentNode = innerEles[0].parentNode;
        parentNode.innerHTML = '';
        parentNode.appendChild(wrapEle);
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
     * @method module:lib.getAncestorBy
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
     * @method module:lib.getAncestorByClass
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


    /**
     * 元素是否在文档结构中
     * @param element
     * @returns {boolean|*|Boolean}
     */
    lib.isInDocument = function(element) {
        return lib.contains(document.documentElement,element);
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