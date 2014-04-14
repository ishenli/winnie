/**
 * @file style
 * @author shenli
 */
define(function (require) {

    var STRONG = require('./string');

    var lib = {};

    /**
     * 设置样式
     * @param ele
     * @param styles
     */
    lib.setStyle = function(ele,styles) {
        for(var name in styles) {
            if(styles.hasOwnProperty(name)) {
                ele.style[STRONG.camelCase(name)] = styles[name];
            }
        }
    };
    /**
     * 获取元素样式
     * @param ele dom元素
     * @param key 样式key
     * @returns {*}
     */
    lib.getStyle = function(ele,key) {
        if(!ele) {
            return '';
        }

        key = STRONG.camelCase(key);

        if(ele.style[key]) { //行内样式
            return ele.style[key];
        }

        var doc = ele.nodeType === 9
                ?ele
                :ele.ownerDocument || ele.document; //文档兼容

        if(doc.defaultView && doc.defaultView.getComputedStyle) {
            var styles = doc.defaultView.getComputedStyle(ele, null);
            if(styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        } else if(ele.currentStyle) { //ie
            return ele.currentStyle[key] || ele.currentStyle.getAttribute(key);
        }

        return '';
    };

    lib.show = function(el) {
        if(lib.getStyle(el,'display') === 'none'){
            el.style.display = null;
        }
    };

    lib.hide = function(el){
        el.style.display = 'none';
    };
    return lib;
});