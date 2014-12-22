/**
 * @ignore
 * @file dom event util
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var dom = require('../../dom');
    var doc = document;
    var GUID = '_winnie_event' + (new Date()); // 保证dom节点的上observerCache的key唯一

    var addEventListener = doc && doc.addEventListener
        ? function (el, type, handler, capture) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, !!capture);
        }
    }
        : function (el, type, handler) {
        if (el.attachEvent) {
            el.attachEvent('on' + type, handler);
        }
    };

    var removeEventListener = doc && doc.removeEventListener
        ? function (el, type, handler, capture) {
        if (el.removeEventListener) {
            el.removeEventListener(type, handler, !!capture);
        }
    }
        : function (el, type, handler) {
        if (el.detachEvent) {
            el.detachEvent('on' + type, handler);

        }

    };
    return {
        addEventListener: addEventListener,
        removeEventListener:removeEventListener,
        data:function(node,value) {
            return dom.data(node, GUID, value);
        },
        removeData:function(node) {
            return dom.removeData(node, GUID);
        }
    };
});