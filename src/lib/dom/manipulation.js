/**
 * @file dom 操作
 * @author shenli <meshenli@gmail.com>
 */
define(function (require) {

    var dom = require('./base');
    var util = require('../util');
    var R_SCRIPT_TYPE = /^$|\/(?:java|ecma)script/i;

    var exports = {};


    /**
     * 删除某个节点
     * @param element
     */
    exports.remove = function (element) {

        element = dom.query(element);

        var parent;
        var all;
        util.each(element, function (ele) {
            parent = ele.parentNode;
            if (ele.nodeType === 1) {
                all = util.makeArray(ele.getElementsByTagName('*'));
                all.push(ele);
                dom.deleteData(ele);
                // 同步在这里会跪
                require(['../event/dom/main'], function (event) {
                    if (event) {
                        event.off(all);
                    }
                });
            }
            parent && parent.removeChild(ele);

        });
    };


    /**
     * 将目标元素添加到基准元素之后
     * @param {HTMLElement} el 被添加的目标元素
     * @param {HTMLElement|String} stuff 添加的目标元素或字符串
     * @param {boolean} execScript 是否执行js
     * @return {HTMLElement} 被添加的目标元素
     */
    exports.append = function (el, stuff, execScript) {
        return insert(el, stuff, execScript, "beforeEnd");
    };

    exports.prepend = function (el, stuff, execScript) {
        return insert(el, stuff, execScript, "afterBegin");
    };

    exports.before = function (el, stuff, execScript) {
        return insert(el, stuff, execScript, "beforeBegin");
    };

    exports.after = function (el, stuff, execScript) {
        return insert(el, stuff, execScript, "afterEnd");
    };

    /**
     * 插入元素
     * @param {HTMLElement|HTMLElement[]|string} refNode
     * @param {HTMLElement|HTMLElement[]|string} newNode
     * @param {boolean} execScript
     * @param {string} where
     */
    function insert (refNode, newNode, execScript, where) {

        newNode = dom.query(newNode);

        if (execScript) {
            execScript = [];
        }
        newNode = filterScripts(newNode, execScript);

        refNode = dom.query(refNode);

        // 如果是script等一些节点或者refNode为空数组就不要插入了
        if((!newNode.length &&(!execScript || !execScript.length)) || !refNode.length){
            return;
        }

        // 接下来才可以进入插入的操作
        newNode = dom.nodeListToFragment(newNode);

        var cloneNode;
        var node;
        if (refNode.length > 1) { // 插入的节点多于一个，需要将newNode拷贝,fragment 一旦插入里面就空了，先复制下
            cloneNode = dom.clone(newNode, true);
        }

        refNode.each(function (el,i) {

            if (newNode) {
                node = i > 0 ? dom.clone(cloneNode, true) : newNode;
                insertAdjacentElement(el, node, where);
            }

            // 执行脚本
            if (execScript && execScript.length) {
                util.each(execScript, evalScript);
            }

        });

        return refNode
    }

    function insertAdjacentElement (el, node, where) {
        /*if (el.insertAdjacentElement) {
            return el.insertAdjacentElement(where, node);
        }*/
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
    }

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
     * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
     * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
     */
    exports.wrapAll = function (wrappedNodes, wrapperNode) {

        wrapperNode = dom.clone(dom.get(wrapperNode),true);
        wrappedNodes = dom.query(wrappedNodes);

        if (wrappedNodes[0].parentNode){
            // 先将包裹节点插入到被包裹节点的前面，之后再将被包裹的
            // 节点放入其中
            exports.insertBefore(wrapperNode, wrappedNodes[0]);
        }

        var c;

        // 取到包裹节点的最里面的节点, 因为被包裹的节点放在最里面那一层
        while ((c = wrapperNode.firstChild) && c.nodeType === 1) {
            wrapperNode = c;
        }

        exports.append(wrapperNode, wrappedNodes);
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

        wrapperNode = dom.get(wrapperNode);
        dom.query(wrappedNodes).each(function (w) {
            var contents = w.childNodes;
            if (contents.length) {
                exports.wrapAll(contents, wrapperNode);
            }
            else {
                w.appendChild(wrapperNode);
            }
        });
    };


    function filterScripts(nodes, scripts) {
        var ret = [], el, nodeName;
        for (var i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = nodes[i].nodeName.toLowerCase();
            if (el.nodeType === 11) { // 是一个fragment
                ret.push.apply(ret, filterScripts(util.makeArray(el.childNodes), scripts));
            }
            // 区分是否是script节点
            else if (nodeName === 'script' && isJs(el)) {
                // 先将script节点删除，避免ie9执行
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }

                if (scripts) {
                    scripts.push(el);
                }
            }
            else { // script节点被包含在其他节点里面
                if (el.nodeType === 1) {
                    var tmp = [], j, script;
                    var scriptNodes = el.getElementsByTagName('script');
                    for (j = 0; j < scriptNodes.length; j++) {
                        script = scriptNodes[j];
                        if (isJs(el)) {
                            tmp.push(script);
                        }
                    }
                    // 加入nodes节点中，这里是因为递归，所以要把tmp添加
                    Array.prototype.slice.apply(nodes, [i + 1, 0].concat(tmp));
                }

                ret.push(el);
            }
        }
        return ret;
    }

    function evalScript(el) {
        var code = util.trim(el.text || el.textContent || el.innerHTML || '');
        if (code) {
            util.globalEval(code);
        }
    }

    function isJs(el) {
        return !el.type || R_SCRIPT_TYPE.test(el.type);
    }

    return exports;
});