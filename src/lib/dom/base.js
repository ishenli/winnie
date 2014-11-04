/**
 * @file dom
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var dom;
    var WINDOW = window;
    var DOCUMENT = WINDOW.document;
    var util = require('../util');

    // https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType

    var NodeType = {
        ELEMENT_NODE: 1,
        DOCUMENT_NODE: 9
    };

    dom = {
        NodeType: NodeType,
        isDomNodeList: function (o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },
        /**
         * Return corresponding window if elem is document or window.
         * Return global window if elem is undefined
         * Else return false.
         * @param {undefined|Window|HTMLDocument} [elem]
         * @return {Window|Boolean}
         */
        getWindow: function (elem) {
            if (!elem) {
                return WINDOW;
            }

            elem = dom.get(elem);

            if (util.isWindow(elem)) {
                return elem;
            }

            var doc = elem;

            if (doc.nodeType !== NodeType.DOCUMENT_NODE) {
                doc = elem.ownerDocument;
            }

            return doc.defaultView || doc.parentWindow;
        }
    };

    return dom;
});
