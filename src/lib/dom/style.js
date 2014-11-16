/**
 * @file style
 * @author shenli
 */
define(
    function (require) {

        var util = require('../util');
        var dom = require('./base');
        var cssProps = {};
        var exports = {};
        var doc = window.document || {};
        var WIDTH = 'width';
        var DEFAULT_UNIT = 'px';
        var defaultDisplayList = {};
        var OLD_DISPLAY = 'display' + util.now();

        var BOX_MODELS = ['margin', 'border', 'padding'];
        var CONTENT_BOX = -1;
        var PADDING_BOX = 2;
        var BORDER_BOX = 1;
        var MARGIN_BOX = 0;

        // 不需要单位的css属性
        var cssNumber = {
            fillOpacity: 1,
            fontWeight: 1,
            lineHeight: 1,
            opacity: 1,
            orphans: 1,
            widows: 1,
            zIndex: 1,
            zoom: 1
        };

        cssProps['float'] = 'cssFloat';

        /**
         * 设置样式
         * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
         * @param {Object|string} styles 样式名字或者样式值map
         * @param {?string} value 样式值
         */
        exports.setStyle = function (selector, styles, value) {

            var els = dom.query(selector);
            var i;
            if (util.isObject(styles)) {
                var name;
                for (name in styles) {
                    if (styles.hasOwnProperty(name)) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], name, styles[name]);
                        }
                    }
                }
            }
            else {
                for (i = els.length - 1; i >= 0; i--) {
                    style(els[i], styles, value);
                }
            }


        };

        /**
         * 属性值的操作
         * @inner
         * @param {HTMLElement} ele 操作的元素
         * @param {string} name 属性名字
         * @param {string|number} val 属性值
         * @return {undefined} 没有style属性的时候返回undefined
         */
        function style(ele, name, val) {

            var elStyle;
            name = normalizeCssProp(util.camelCase(name));

            if (!(elStyle = ele.style)) {
                return undefined;
            }

            if (val !== undefined) {
                if (val === null || val === '') {
                    val = '';
                }
                // 数字且需要的单位的属性
                else if (!isNaN(Number(val)) && !cssNumber[name]) {
                    val += DEFAULT_UNIT;
                }

                try {
                    elStyle[name] = val;
                }
                catch (e) {
                }
                if (val === '' && elStyle.removeAttribute) {
                    elStyle.removeAttribute(name);
                }
            }

        }

        /**
         * 获取元素样式
         * @param {HTMLElement} ele dom元素
         * @param {string} key 样式key
         * @return {string} 样式值
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
         * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
         */
        exports.show = function (selector) {

            var els = dom.query(selector);

            var i;
            var el;
            for (i = els.length - 1; i >= 0; i--) {
                el = els[i];
                // 现将元素设定为hide之前的display值
                el.style.display = dom.data(el, OLD_DISPLAY);

                //  样式表中写了display: none,就设置元素的默认display的值
                if (exports.getStyle(el, 'display') === 'none') {
                    var defaultDisplay = getDefaultDisplay(el.tagName.toLowerCase());
                    // 将defaultDisplay存储一下，便于同类元素的使用
                    defaultDisplayList[el.tagName] = defaultDisplay;
                    el.style.display = defaultDisplay;
                }
            }
        };

        /**
         * 隐藏元素
         * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
         */
        exports.hide = function (selector) {
            var els = dom.query(selector);
            var i;
            var elem;
            for (i = els.length - 1; i >= 0; i--) {
                elem = els[i];
                var style = elem.style;
                var old = style.display;

                if (old !== 'none') {
                    if (old) {
                        dom.data(elem, OLD_DISPLAY, old);
                    }
                    style.display = 'none';
                }
            }
        };


        /*
         * 给页面中添加样式
         * @param {Window} refWin 添加样式表的窗口
         * @param {string} cssText 样式内容
         * @param {string} id style标签id
         */
        exports.addStyleSheet = function (win, cssText, id) {
            if (typeof win === 'string') {
                id = cssText;
                cssText = win;
                win = window;
            }

            var doc = dom.getDocument(win);
            var ele;

            if (id && (id.replace('#', ''))) {
                ele = dom.query('#' + id, doc);
            }

            if (ele) {
                return;
            }

            var styleNode = dom.create('<style id' + id + '></style');

            doc.getElementsByTagName('head')[0].appendChild(styleNode);

            if (styleNode.styleSheet) { // ie
                styleNode.styleSheet.cssText = cssText;
            }
            else { // w3c
                styleNode.appendChild(doc.createTextNode(cssText));
            }

        };

        /**
         * 获取或者设置元素的内容宽度
         * @param {HTMLElement} ele dom元素
         * @param {string|number} cssValue 样式值
         */
        exports.width = function (ele, cssValue) {
            if (!cssValue) {
                getWidthAndHeight(ele, 'width');
            }
            else {
                exports.setStyle({
                    width: cssValue
                });
            }
        };

        util.each(['width', 'height'], function (name) {
            exports['outer' + util.ucFirst(name)] = function (selector, includeMargin) {
                var el = dom.get(selector);
                return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_BOX : BORDER_BOX);
            };

            exports['inner' + util.ucFirst(name)] = function (selector) {
                var el = dom.get(selector);
                return el && getWHIgnoreDisplay(el, name, PADDING_BOX);
            };
        });
        /**
         * 获取css的计算值
         * @param {HTMLElement} ele 元素
         * @param {string} key 样式名
         * @return {Object|string} 样式值
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
         * 获取元素的宽高且忽略display属性
         * @param {HTMLElement} el 元素
         * @param {string} name width 或 height
         * @param {string} extra 盒子模型（padding，border，margin）
         * @return {string} 返回宽和高的值
         */
        function getWHIgnoreDisplay(el, name, extra) {
            return getWidthAndHeight.apply({}, arguments);
        }


        /*
         得到元素的宽高信息
         @param {HTMLElement} ele 元素
         @param {string} name width 或 height
         @param {String} [extra]  'padding' : (css width) + padding
         'border' : (css width) + padding + border
         'margin' : (css width) + padding + border + margin
         */
        function getWidthAndHeight(ele, name, extra) {

            // 特殊处理window和document

            if (util.isWindow(ele)) {
                return name === WIDTH ? dom.getViewWidth(ele) : dom.getViewHeight(ele);
            }
            else if (ele.nodeType === 9) {
                return name === WIDTH ? dom.getDocWidth(ele) : dom.getDocHeight(ele);
            }

            var which = (name === WIDTH ? ['left', 'right'] : ['top', 'bottom']);

            var borderBoxValue = name === WIDTH ? ele.offsetWidth : ele.offsetHeight;

            var cssBoxValue = 0;

            var isBorderBox = isBorderBoxFn(ele);

            if (borderBoxValue == null || borderBoxValue <= 0) {
                borderBoxValue = undefined;
                cssBoxValue = exports._getComputedStyle(ele);

                if (cssBoxValue == null || (Number(cssBoxValue)) < 0) {
                    cssBoxValue = ele.style[name] || 0;
                }
                // Normalize '', auto, and prepare for extra
                cssBoxValue = parseFloat(cssBoxValue) || 0;
            }

            var borderBoxValueOrIsBorderBox = borderBoxValue !== undefined || isBorderBox;

            if (extra === undefined) {
                extra = isBorderBox ? BORDER_BOX : CONTENT_BOX;
            }

            var val = borderBoxValue || cssBoxValue;

            if (extra === CONTENT_BOX) {

                // 传入带有border/padding/margin的值
                if (borderBoxValueOrIsBorderBox) {
                    return val - getPBMWidth(ele, ['border', 'padding'], which);
                }
                else {
                    return cssBoxValue;
                }
            }
            else if (borderBoxValueOrIsBorderBox) {

                if (extra === BORDER_BOX) {
                    val += 0;
                }
                else if (extra === PADDING_BOX) {
                    val -= getPBMWidth(ele, ['border'], which);
                }
                else {
                    val -= getPBMWidth(ele, ['margin'], which);
                }
                return val;
            }
            else {
                return cssBoxValue + getPBMWidth(ele, BOX_MODELS.splice(extra), which);
            }

        }

        /**
         * 获取元素的padding/border的宽度值
         * @param {HTMLElement} ele 元素
         * @param {Array<string>} props padding，border，margin的数组
         * @param {Array<string>} which  left和top or right和bottom
         * @return {number} 值大小
         */
        function getPBMWidth(ele, props, which) {
            var value = 0;
            var prop;
            var len;
            var j;
            var i;
            var cssProp;
            for (j = 0, len = props.length; j < len; j++) {
                prop = props[j];
                if (prop) {
                    for (i = 0; i < which.length; i++) {
                        if (prop === 'border') {
                            // 拼接css属性
                            cssProp = prop + which[i] + 'Width'; // borderLeftWidth
                        }
                        else {
                            cssProp = prop + which[i];
                        }

                        value += exports._getComputedStyle(ele, cssProp) || 0;
                    }
                }
            }

            return value;
        }

        /**
         * 是否是border-box
         * @param {HTMLElement} ele 元素
         * @return {boolean} 是否border-box盒模型
         */
        function isBorderBoxFn(ele) {
            return exports._getComputedStyle(ele, 'boxSizing') === 'border-box';
        }

        /**
         * 获取元素的默认display的值
         * @param {string} tagName 标签名
         * @return {string} defaultDisplay 默认的display值
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
         * @param {string} key 样式名
         * @return {string} key 处理后的样式名
         */
        function normalizeCssProp(key) {
            if (cssProps[key]) {
                return cssProps[key];
            }

            return key;
        }


        return exports;
    });
