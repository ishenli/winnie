/**
 * @file create
 * @author ishenli <meshenli@gmail.com>
 */
define(function (require) {

    var exports = {};
    var UA = require('../ua');
    var util = require('../util');
    var dom = require('./base');
    var doc = document;
    var DEFAULT_DIV = doc && doc.createElement('div');

    var isOldIE = (UA.ie && UA.ie < 9);
    var lostLeadingTailWhitespace = isOldIE;
    var creator = exports._creator = {
        div: defaultCreator
    };

    // 各种正则
    var R_LEADING_WHITESPACE = /^\s+/; // 开头空白符
    var R_TAIL_WHITESPACE = /\s+$/; // 末尾空白符
    var R_SCRIPT_TYPE = /^$|\/(?:java|ecma)script/i;
    var REG_HTML = /<|&#?\w+;/;
    var REG_SIMPLE_HTML = /^<(\w+)\s*\/?>(?:<\/\1>)?$/; // exec('<p>') => ['<p'>,'p']
    var REG_TAG = /<([\w:]+)/; // exec('<p>') => ['<p','p']


    var creatorsMap = {
        area: 'map',
        thead: 'table',
        td: 'tr',
        th: 'tr',
        tr: 'tbody',
        tbody: 'table',
        tfoot: 'table',
        caption: 'table',
        colgroup: 'table',
        col: 'colgroup',
        legend: 'fieldset'
    };

    var tagTpl = '<{tag}>{html}</{tag}>';
    var p;

    for (p in creatorsMap) {
        /*jshint loopfunc: true*/
        (function (tag) {
            creator[p] = function (html, ownerDoc) {
                return creator.create(util.substitute(tagTpl, {
                    tag: tag,
                    html: html
                }), ownerDoc);
            };
        })(creatorsMap[p]);
    }

    function getHolderDiv(ownerDoc, clear) {
        var holder = ownerDoc && ownerDoc !== doc ?
            ownerDoc.createElement('div') :
            DEFAULT_DIV;
        if (clear && holder === DEFAULT_DIV) {
            holder.innerHTML = '';
        }
        return holder;
    }

    function defaultCreator(html, htmlDoc) {
        var holder = getHolderDiv(htmlDoc);
        holder.innerHTML = 'm<div>' + html + '</div>';
        return holder.lastChild;
    }

    /**
     * 创建dom节点
     * @param {string|HTMLElement|HTMLElement[]} html
     * @param  {HTMLDocument} doc
     * @returns {*}
     */
    exports.domify = exports.create = function (html, doc) {
        var ret = null;
        var context = doc || document;

        if (!html) {
            return ret;
        }

        if (typeof html !== 'string') {
            return ret;
        }

        var match;
        var k;
        var tagName;
        var holder;
        var whiteSpaceMatch;
        var nodes;
        // 已经是dom节点
        if (html.nodeType) {
            return exports.clone(html);
        }

        // 判断是html字符串还是普通字符串
        if (!REG_HTML.test(html)) {
            ret = context.createTextNode(html);
        }

        // 传入<p>,不完整的tag
        else if ((match = REG_SIMPLE_HTML.exec(html))) {
            ret = context.createElement(match[1]);
        }
        else {

            if ((match = REG_TAG.exec(html)) && (k = match[1])) {
                tagName = k.toLowerCase();
            }

            /**
             * 1.html不含有style和script标签，因为通过innerHTML的标签不会执行，插入的style在ie9下的浏览器不会生效
             * 2.浏览器不会忽略前导空白符，或者html代码不以空白符开头。因为IE9一下的浏览器会自动剔除html中的html代码中的
             * 前导空白符
             * 3.html可能需要包裹父标签才能正确的序列化（option需要在多选的select中）
             * 基本思路通过一个holder节点（默认是div）来插入html内容,holder处理#3的问题
             */
            holder = (creator[tagName] || defaultCreator)(html, context);

            if (lostLeadingTailWhitespace && (whiteSpaceMatch = html.match(R_LEADING_WHITESPACE))) {
                // 将空白符先存起来，然后创建文本节点后，在插入元素前面
                holder.insertBefore(context.createTextNode(whiteSpaceMatch[0]), holder.firstChild);
            }

            if (lostLeadingTailWhitespace && /\S/.test(html) &&
                (whiteSpaceMatch = html.match(R_TAIL_WHITESPACE))) {
                holder.appendChild(context.createTextNode(whiteSpaceMatch[0]));
            }

            nodes = holder.childNodes;

            if (nodes.length === 1) {
                // 这时候所需的节点是在Node中的
                ret = nodes[0].parentNode.removeChild(nodes[0]);
            }
            else if (nodes.length) {
                ret = exports.nodeListToFragment(nodes);
            }
            else {
                console.error('dom create error:', html);
            }

        }
        return ret;

    };

    /**
     * 对第一个元素进行深度clone
     * @param {HTMLElement|String|HTMLElement[]}  selector
     * @param {boolean} deep
     */
    exports.clone = function (selector, deep) {
        var el = dom.get(selector);
        if (!el) {
            return null;
        }
        var cloneNode;
        var nodeType = el.nodeType;

        cloneNode = el.cloneNode(deep);

        // fix ie bug
        // https://github.com/jquery/jquery/blob/master/src/manipulation.js#L157
        if (nodeType === 1 || nodeType === 11 ) {
            if (exports._fixCloneAttributes && nodeType === 1) {
                exports._fixCloneAttributes(el, cloneNode);
            }

            if (deep && exports._fixCloneAttributes) {
                handleDeep(cloneNode, el, exports._fixCloneAttributes);
            }
        }

        // 其实还有克隆节点的事件处理，如克隆节点的click事件
        return cloneNode;
    };

    exports._fixCloneAttributes = function (src, dest) {
        var nodeName = src.nodeName.toLowerCase();
        var type = (src.type || '').toLowerCase();
        var srcChecked, srcValue;
        // https://github.com/jquery/jquery/blob/master/src/manipulation.js#L137
        if (nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
            dest.value = src.value;
        }
        else if(nodeName === 'input' && (type === 'checkbox' || type === 'radio')) {
            srcChecked = src.checked;
            if (srcChecked) {
                dest.defaultChecked = dest.checked = srcChecked;
            }
            srcValue = src.value;

            if (dest.value !== srcValue) {
                dest.value = srcValue;
            }
        }
    };
    /**
     *
     * @param {HTMLElement|String|HTMLElement[]}  selector
     * @param {String|HTMLElement}   html
     * @param {boolean} [execScript=false] True to look for and process scripts execScript
     */
    exports.html = function (selector, html, execScript) {
        var els = dom.query(selector);
        var el = els[0];
        var item;
        var success;
        var valNode;
        if (!el) {
            return null;
        }

        // 直接返回html内容
        if (html === undefined) {
            if (el.nodeType === 1) {
                return el.innerHTML;
            }
            return null;
        }
        else {
            // see https://github.com/jquery/jquery/blob/master/src/manipulation.js#L418

            html += '';
            if (!/<(?:script|style|link)/i.test(html)
                && !creatorsMap[( REG_TAG.exec(html) || ["", ""] )[1].toLowerCase()]
            ) {
                try {
                    for (var i = 0, len = els.length; i < len; i++) {
                        item = els[i];
                        if (item.nodeType === 1) {
                            dom.cleanData(getAll(item, '*'));
                            item.innerHTML = html
                        }
                    }
                    success = true;
                } catch (e) {

                }
            }

            if (!success) {
                valNode = exports.create(html, el.ownerDocument);
                exports.empty(els);
                dom.append(els, valNode, execScript);
            }
        }


    };

    /**
     * 将节点占位fragment
     * @param {HTMLElement[]} nodes
     * @returns {fragment} ret
     * https://developer.mozilla.org/en-US/docs/Web/API/document.createDocumentFragment
     */
    exports.nodeListToFragment = function (nodes) {
        var ownerDoc;
        var ret = null;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = util.makeArray(nodes);

            for (var i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            console.error('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;
    };


    /**
     * @param {HTMLElement|String|HTMLElement[]} selector matched elements
     */
    exports.empty = function (selector) {
        var els = dom.query(selector),
            el, i;
        for (i = els.length - 1; i >= 0; i--) {
            el = els[i];
            dom.remove(el.childNodes);
        }
    };

    function getAll(el, tag) {
        return el.getElementsByTagName(tag);
    }

    /**
     * 对深度克隆节点进行处理
     * @param {HTMLElement} el
     * @param {HTMLElement} cloneNode
     * @param {Function} fn
     */
    function handleDeep(el,cloneNode,fn) {

        var eleNodeType = el.nodeType;

        if (eleNodeType === 11) {
            var child = el.childNodes;
            var cloneChild = cloneNode.childNodes;
            var findex = 0;
            while(child[findex]) {
                if (cloneChild[findex]) {
                    handleDeep(child[findex], cloneChild[findex], fn);
                }
                findex++;
            }
        }
        else if (eleNodeType === 1) {
            var elChildren = getAll(el, '*');
            var cloneCs = getAll(cloneNode, '*');
            var cIndex = 0;
            // 将所有的dom节点全部取出，避免每次查询遍历
            while (elChildren[cIndex]){
                if (cloneCs[cIndex]) {
                    fn(elChildren[cIndex], cloneCs[cIndex]);
                }
                cIndex++;
            }
        }

    }

    return exports;

});