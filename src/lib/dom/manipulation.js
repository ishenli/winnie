/**
 * @file dom 操作
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var dom = require('./base');
    var util = require('../util');

    var exports = {};


    /**
     * 删除某个节点
     * @param element
     */
    exports.remove = function (element) {

        element = dom.query(element);


        var parent;

        util.each(element, function (ele) {
            parent = ele.parentNode;
            parent && parent.removeChild(ele);
        });
    };


    /**
     * 将目标元素添加到基准元素之后
     * @param {HTMLElement} el 被添加的目标元素
     * @param {HTMLElement|String} stuff 添加的目标元素或字符串
     * @return {HTMLElement} 被添加的目标元素
     */
    exports.append = function (el, stuff) {
        return exports._insert(el, stuff, "beforeEnd");
    };

    exports.prepend = function (el, stuff) {
        return exports._insert(el, stuff, "afterBegin");
    };

    exports.before = function (el, stuff) {
        return exports._insert(el, stuff, "beforeBegin");
    };

    exports.after = function (el, stuff) {
        return exports._insert(el, stuff, "afterEnd");
    };

    /**
     * 插入元素
     * @param {HTMLElement} el
     * @param {HTMLElement} stuff
     * @param {string} where
     * @returns {*}
     * 以下元素的innerHTML在IE中是只读的，调用insertAdjacentElement进行插入就会出错
     * col, colgroup, frameset, html, head, style,
     * title,table, tbody, tfoot, thead, 与tr;
     * http://www.cnblogs.com/rubylouvre/archive/2009/12/14/1622631.html
     */
    exports._insert = function (el, stuff, where) {
        var doc = el.ownerElement || document;
        var frag = document.createDocumentFragment();

        if (stuff.version) { // 如果是dom节点,则把它里面的元素节点移到文档碎片中
            util.each(stuff ,function (el) {
                frag.appendChild(el);
            });
            stuff = frag;
        }

        // 供火狐与IE部分元素调用
        exports._insertAdjacentElement = function (el, node, where) {
            switch (where) {
                case 'beforeBegin':
                    el.parentNode.insertBefore(node, el);
                    break;
                case 'afterBegin':
                    el.insertBefore(node, el.firstChild);
                    break;
                case 'beforeEnd':
                    el.appendChild(node);
                    break;
                case 'afterEnd':
                    if (el.nextSibling) {
                        el.parentNode.insertBefore(node, el.nextSibling);
                    }
                    else {
                        el.parentNode.appendChild(node);
                    }
                    break;
            }
        };

        exports._insertAdjacentHTML = function (el, htmlStr, where) {
            var range = doc.createRange();
            switch (where) {
                case "beforeBegin":// before
                    range.setStartBefore(el);
                    break;
                case "afterBegin":// after
                    range.selectNodeContents(el);
                    range.collapse(true);
                    break;
                case "beforeEnd":// append
                    range.selectNodeContents(el);
                    range.collapse(false);
                    break;
                case "afterEnd":// prepend
                    range.setStartsAfter(el);
                    break;
            }
            var parsedHTML = range.createContextualFragment(htmlStr);
            exports._insertAdjacentElement(el, parsedHTML, where);
        };

        //如果是节点则复制一份,fragment 一旦插入里面就空了，先复制下
        //stuff = stuff.nodeType ? stuff.cloneNode(true) : stuff;
        if (el.insertAdjacentHTML) {// ie,chrome,opera,safari都已实现insertAdjacentXXX家族
            el['insertAdjacent' + (stuff.nodeType ? 'Element' : 'HTML')](where, stuff);
        }
        else {
            // 火狐专用
            exports['_insertAdjacent' + (stuff.nodeType ? 'Element' : 'HTML')](el, stuff, where);
        }

        return el;
    };
    /**
     * 在某个节点之前插入节点
     * @param {HTMLElement} newElement
     * @param {HTMLElement} referenceElement
     */
    exports.insertBefore = function (newElement, referenceElement) {
        referenceElement.parentNode.insertBefore(newElement, referenceElement);
    };

    /**
     * 在某个节点之后买插入节点
     * @param {HTMLElement} newElement
     * @param {HTMLElement} referenceElement
     */
    exports.insertAfter = function (newElement, referenceElement) {
        referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
    };


    /**
     * 给节点包裹另一个节点
     * wrapAll('<p>1</p>','<div></div>') == > <div><p>1</p></div>
     * @param {HTMLElement|HTMLElement[]|String} wrappedNode set of matched elements
     * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
     */
    exports.wrapAll = function(wrappedNode,wrapperNode) {
        wrapperNode = wrapperNode.cloneNode(true);
        if (wrappedNode.parentNode){
            exports.insertBefore(wrapperNode, wrappedNode);
        }

        var c;

        // 取到包裹节点的最里面的节点
        while ((c = wrapperNode.firstChild) && c.nodeType === 1) {
            wrapperNode = c;
        }

        exports.append(wrapperNode,wrappedNode);
    };

    /**
     * 给所有被选中包裹一个节点
     * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
     * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
     */
    exports.wrap = function (wrappedNodes, wrapperNode) {
        wrappedNodes = dom.queryAll(wrappedNodes);
        util.each(wrappedNodes, function (w) {
            exports.wrapAll(w, wrapperNode);
        });
    };


    /**
     * 给元素的所有子借点wrap一个节点
     * @param {HTMLElement|HTMLElement[]} wrappedNodes set of matched elements
     * @param {HTMLElement} wrapperNode html node or selector to get the node wrapper
     */
    exports.wrapInner = function (wrappedNodes, wrapperNode) {
        util.each(wrappedNodes, function (w) {
            var contents = w.childNodes;
            if (contents.length) {
                exports.wrapAll(contents, wrapperNode);
            }
            else {
                w.appendChild(wrapperNode);
            }
        });
    };

    return exports;
});