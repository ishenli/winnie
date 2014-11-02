/**
 * @file create
 * Turn HTML into DOM elements x-browser.
 */
define(function (require) {

    var util = require('../util');
    /**
     * Tests for browser support.
     */

    var div = document.createElement('div');
// Setup
    div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
    var innerHTMLBug = !div.getElementsByTagName('link').length;
    div = undefined;

    /**
     * Wrap map from jquery.
     */

    var map = {
        legend: [1, '<fieldset>', '</fieldset>'],
        tr: [2, '<table><tbody>', '</tbody></table>'],
        col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
        // for script/link/style tags to work in IE6-8, you have to wrap
        // in a div with a non-whitespace character in front, ha!
        _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
    };

    map.td =
        map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

    map.option =
        map.optgroup = [1, '<select multiple="multiple">', '</select>'];

    map.thead =
        map.tbody =
            map.colgroup =
                map.caption =
                    map.tfoot = [1, '<table>', '</table>'];

    map.text =
        map.circle =
            map.ellipse =
                map.line =
                    map.path =
                        map.polygon =
                            map.polyline =
                                map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">', '</svg>'];

    /**
     * Parse `html` and return a DOM Node instance, which could be a TextNode,
     * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
     * instance, depending on the contents of the `html` string.
     *
     * @param {String} html - HTML string to "create"
     * @param {Document} doc - The `document` instance to create the Node for
     * @return {Node} the TextNode, DOM Node, or DocumentFragment instance
     * @api private
     */

    function create(html, doc) {
        if ('string' != typeof html) throw new TypeError('String expected');

        // default to the global `document` object
        if (!doc) doc = document;

        // tag name
        var m = /<([\w:]+)/.exec(html);
        if (!m) return doc.createTextNode(html);

        html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

        var tag = m[1];

        var el;
        // body support
        if (tag == 'body') {
             el = doc.createElement('html');
            el.innerHTML = html;
            return el.removeChild(el.lastChild);
        }

        // wrap map
        var wrap = map[tag] || map._default;
        var depth = wrap[0];
        var prefix = wrap[1];
        var suffix = wrap[2];
         el = doc.createElement('div');
        el.innerHTML = prefix + html + suffix;
        while (depth--) el = el.lastChild;

        // one element
        if (el.firstChild == el.lastChild) {
            return el.removeChild(el.firstChild);
        }

        // several elements
        var fragment = doc.createDocumentFragment();
        while (el.firstChild) {
            fragment.appendChild(el.removeChild(el.firstChild));
        }

        return fragment;
    }


    /**
     * 将节点占位fragment
     * @param {HTMLElement} nodes
     * @returns {fragment} ret
     */
    function nodeLitToFragment(nodes) {
        var ownerDoc;
        var ret = null;

        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = util.makeArray(nodes);

            for (var i= 0,len = nodes.length;i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        }
        else {
            console.error('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;

    }
    return {
        create:create,
        domify:create,
        nodeLitToFragment:nodeLitToFragment
    }

});