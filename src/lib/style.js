/**
 * @file style
 * @author shenli
 */
define(function (require) {

    var string = require('./string');

    var u = require('underscore');
    var lib = {};

    /**
     * 设置样式
     * @param ele
     * @param {Object}styles
     * @param value 样式值
     */
    lib.setStyle = function (ele, styles, value) {


        //如果传入一个对象
        if (u.isObject(styles)) {
            for (var name in styles) {
                if (styles.hasOwnProperty(name)) {
                    ele.style[detectProperty(name)] = styles[name];
                }
            }
        } else {
            //setStyle(ele,'display','block');
            ele.style[detectProperty(styles)] = value;
        }

    };
    /**
     * 获取元素样式
     * @param ele dom元素
     * @param key 样式key
     * @returns {*}
     */
    lib.getStyle = function (ele, key) {
        if (!ele) {
            return '';
        }
        key = detectProperty(key);
        key = string.camelCase(key);

        if (ele.style[key]) { //行内样式
            return ele.style[key];
        }

        var doc = ele.nodeType === 9
            ? ele
            : ele.ownerDocument || ele.document; //文档兼容

        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            var styles = doc.defaultView.getComputedStyle(ele, null);
            if (styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        } else if (ele.currentStyle) { //ie
            return ele.currentStyle[key] || ele.currentStyle.getAttribute(key);
        }

        return '';
    };

    lib.show = function (el) {
        if (lib.getStyle(el, 'display') === 'none') {
            el.style.display = null;
        }
    };

    lib.hide = function (el) {
        el.style.display = 'none';
    };

    /**
     * 获取元素的尺寸，不带单位
     * @param ele
     * @returns {{width: (number|*), height: (number|*)}}
     */
    lib.getSize = function(ele) {

        if(lib.getStyle(ele,'display') !=='none') {
            return {
                width: ele.offsetWidth || lib.getStyle(ele, 'width'),
                height:ele.offsetHeight || lib.getStyle(ele, 'height')
            };
        }

        //如果元素不可见，display为none时无法计算物理尺寸
        var addClass={'display':'block','position':'absolute','visibility':'hidden'};
        var oldClass = {};
        for(var i in addClass) {
            oldClass[i] = lib.getStyle(ele, i);
        }
        lib.setStyle(ele, addClass);

        var width = ele.clientWidth || parseInt(lib.getStyle(ele, 'width'),10);
        var height = ele.clientHeight || parseInt(lib.getStyle(ele, 'height'),10);

        //在设置成原来的样式值
        lib.setStyle(ele, oldClass);

        return{
            width:width,
            height:height
        }

    };

    //helper
    var detectEle = document.createElement('div');
    var prefixes = ['webkit', 'moz','ms', 'o'];

    /**
     * 检测支持的CSS属性名称
     * 如果没有找到支持的属性名称返回原有值
     *
     * @inner
     * @param {string} property CSS属性名
     * @return {string}
     */
    function detectProperty(property) {
        if (property.charAt(0) !== '-') {
            var style = detectEle.style;
            var name = string.camelCase(property);

            if (!( name in style )) {
                name = property.charAt(0).toUpperCase()
                    + property.substring(1);
                for (var i = 0, prefix; prefix = prefixes[i]; i++) {
                    if (prefix + name in style) {
                        property = '-' + prefix + '-' + property;
                        break;
                    }
                }
            }
        }
        return property;
    }

    lib.detectProperty = detectProperty;

    return lib;
});