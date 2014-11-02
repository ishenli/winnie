/**
 * @file style
 * @author shenli
 */
define(function (require) {

    var util = require('../util');
    var dom = require('./base');
    var cssProps = {};
    var exports = {};
    var doc = window.document || {};
    cssProps['float'] = 'cssFloat';

    var defaultDisplayList = {};
    /**
     * 设置样式
     * @param ele
     * @param {Object|string} styles
     * @param {?string} value
     */
    exports.setStyle = function (ele, styles, value) {

        if (util.isObject(styles)) {
            var name;
            for (name in styles) {
                if (styles.hasOwnProperty(name)) {
                    ele.style[normalizeCssProp(util.camelCase(name))] = styles[name];
                }
            }
        }
        else {
            ele.style[normalizeCssProp(util.camelCase(styles))] = value;
        }


    };
    /**
     * 获取元素样式
     * @param {HTMLElement} ele dom元素
     * @param {string} key 样式key
     * @returns {string}
     */
    exports.getStyle = function (ele, key) {
        if (!ele) {
            return '';
        }

        key = util.camelCase(key);

        if (ele.style[key]) { // 行内样式
            return ele.style[key];
        }

        return exports._getComputedStyle(ele, key);

    };

    /**
     * 显示元素
     * 考虑在行内样式和css样式表的影响
     * @param {HTMLElement|string} el
     */
    exports.show = function (el) {

        el.style.display = defaultDisplayList[el.tagName] || '';

        //  样式表中写了display: none,就设置元素的默认display的值
        if (exports.getStyle(el, 'display') === 'none') {
            var defaultDisplay = getDefaultDisplay(el.tagName.toLowerCase());
            // 将defaultDisplay存储一下，便于同类元素的使用
            defaultDisplayList[el.tagName] = defaultDisplay;
            el.style.display = defaultDisplay;
        }
    };

    exports.hide = function (el) {
        el.style.display = 'none';
    };


    /*
     * 给页面中添加样式
     * @param {Window} refWin 添加样式表的窗口
     * @param {string} cssText
     * @param {string} id
     */
    exports.addStyleSheet = function (win, cssText, id) {
        if (typeof win === 'string') {
            id = cssText;
            cssText = win;
            win = window;
        }

        var doc = dom.getDocument(win);
        var ele;

        if (id && (id.replace('#',''))) {
            ele = dom.query('#' + id, doc);
        }

        if (ele) {
            return;
        }

        var styleNode = dom.create('<style id' + id + '></style');

        doc.getElementsByTagName('head')[0].appendChild(styleNode);

        if (styleNode.styleSheet) { // ie
            styleNode.styleSheet.cssText = cssText
        }
        else { // w3c
            styleNode.appendChild(doc.createTextNode(cssText));
        }

    };
    /**
     * 获取css的计算值
     * @param {HTMLElement} ele
     * @param {string} key
     * @returns {Object|string}
     * @private
     * https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle
     */
    exports._getComputedStyle = function (ele, key) {

        var doc = ele.nodeType === 9
            ? ele
            : ele.ownerDocument || ele.document; // 文档兼容

        key = normalizeCssProp(key);


        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            var styles = doc.defaultView.getComputedStyle(ele, null);
            if (styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        }
        else if (ele.currentStyle) { // ie
            return ele.currentStyle[key] || ele.currentStyle.getAttribute(key);
        }

        return '';
    };


    /**
     * 获取元素的默认display的值
     * @param {string} tagName
     * @returns {string} defaultDisplay
     */
    function getDefaultDisplay(tagName) {
        var defaultDisplay = defaultDisplayList[tagName];
        if (!defaultDisplay) {
            var body = doc.body || doc.documentElement;
            var ele = doc.createElement(tagName);
            dom.prepend(body, ele);
            defaultDisplay = exports.getStyle(ele, 'display');
            dom.remove(ele);
            defaultDisplayList[tagName] = defaultDisplay;
        }
        return defaultDisplay;
    }


    /**
     * 归一化css的属性值
     * @param {string} key
     * @returns {string} key 归一后的
     */
    function normalizeCssProp(key) {
        if (cssProps[key]) {
            return cssProps[key];
        }

        return key;
    }

    return exports;
});