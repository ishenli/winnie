/**
 * @file attribute
 * @author shenli
 */
define(function (require) {

    var util = require('../util');

    var lib = {};

    var ATTRIBTE_NAME_MAPPING = (function () {
        var result = {
            cellpadding: 'cellPadding',
            cellspacing: 'cellSpacing'
        };
        return result;
    }());

    lib.setAttribute = function (element, key, value) {
        element = dom.g(element);

        if (key === 'style') {
            element.style.cssText = value;
        }
        else {
            key = ATTRIBTE_NAME_MAPPING[key] || key;
            element.setAttribute(key, value);
        }

        return element;
    };

    lib.getAttribute = function (element, key) {
        element = dom.g(element);
        if (key === 'style') {
            return element.style.cssText;
        }
        else {
            key = ATTRIBTE_NAME_MAPPING[key] || key;
            return element.getAttribute(key);
        }

    };

    lib.removeAttribute = function (element, key) {
        element = dom.g(element);

        key = ATTRIBTE_NAME_MAPPING[key] || key;

        element.removeAttribute(key);
    };

    return lib;
});