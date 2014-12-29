/**
 * @file matches-selector
 * @author ishenli
 */
define(function () {
    var proto = Element.prototype;

    var vendor = proto.matches
        || proto.webkitMatchesSelector
        || proto.mozMatchesSelector
        || proto.msMatchesSelector
        || proto.oMatchesSelector;


    /**
     * Match `el` to `selector`.
     *
     * @param {Element} el
     * @param {String} selector
     * @return {Boolean}
     * @api public
     */

    function match(el, selector) {
        if (vendor) return vendor.call(el, selector);

        el =  el || document;

        var nodes = el.parentNode.querySelectorAll(selector);

        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] == el) {
                return true;
            }
        }

        return false;
    }

    return match;
});