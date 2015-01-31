/**
 * @file transition
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {
    var dom = require('../../lib/dom');
    var feature = require('../../lib/feature');
    var Promise = require('../../lib/promise');

    var exports = {};

    var transitionEndEvents = [
        'transitionend', 'webkitTransitionEnd',
        'oTransitionEnd', 'MSTransitionEnd'
    ];

    var EVENT_INDEX = 'transition-event';
    var eventList = [];

    /**
     * 用于手动触发事件
     * @param {HTMLElement} el
     */
    function fireEndEvent(el) {
        var index = dom.data(el, EVENT_INDEX);
        if(!index) {
            return;
        }

        index = parseInt(index, 10);
        var items = eventList[index] || [];

        items.forEach(function (fn) {
            fn.call(el, true);
        });
    }

    /**
     * 保存事件
     * @param {HTMLElement} el
     * @param {Function} handler
     */
    function onEndEvent(el,handler) {
        var items;
        var index = dom.data(el, EVENT_INDEX);
        if (index) {
            index = parseInt(index, 10);
            items = eventList[index];
        }
        else {
            index = eventList.length;
            dom.data(el, EVENT_INDEX, index);
        }
        items = items || [];
        items.push(handler);
        eventList[index] = items;
    }
    /**
     * 删除手动触发事件
     * @param {HTMLElement} el
     */
    function unEndEvent(el,handler) {
        var index = dom.data(el, EVENT_INDEX);
        if (!index) {
            return;
        }

        index = parseInt(index, 10);
        var items = eventList[index] || [];

        items.some(function (item, index, items) {
            return item === handler
                && items.splice(index, 1);
        });
    }


    /**
     * 设置transition
     *
     * @public
     * @param {dom} el DOM元素
     * @param {Object} properties 要改变的属性
     * @param {Object} config 属性值
     * @param {number=} config.duration 持续时间 单位秒
     * @param {string=} config.easing 缓动效果
     * @param {number=} config.delay 延时 单位秒
     * @return {Promise}
     */
    exports.addStyle = function (el, properties, config) {
        if (!el || !properties) {
            return Promise.resolve(el);
        }

        config = config || {};
        config.duration = config.duration || 0;
        config.easing = config.easing || 'ease';
        config.delay = config.delay || 0;

        var propertyNames = [];
        var oldStyles = {};

        // 将原有样式cache
        Object.keys(properties).forEach(function (key) {
            oldStyles[key] = dom.css(el, key);
        });

        // 就是先将样式设置好，浏览器渲染的时候还会带上动画
        Object.keys(properties).forEach(function (key) {
            if (oldStyles[key] !== properties[key]) {
                propertyNames.push(key);
                dom.css(el, key, properties[key]);
            }
        });

        var promise = new Promise(function (resolve, reject) {
            function callback(e) {
                var ret = true;
                if (e === true || propertyNames.length <= 1) {
                    resolve(el);
                    dom.css(el, 'transition', '');
                }
                else {
                    propertyNames.pop();
                    ret = false;
                }

                return ret;
            }

            if (propertyNames.length && config.duration) {
                exports.oneTransitionEnd(el, callback);
                // http://www.w3school.com.cn/cssref/pr_transition-property.asp
                propertyNames.forEach(function (property, index) {
                    propertyNames[index] = feature.detectProperty(property);
                });

                dom.setStyle(el, 'transition-property', propertyNames.join(','));
                dom.setStyle(el, 'transition-duration', config.duration + 's');
                dom.setStyle(el, 'transition-timing-function', config.easing);
                dom.setStyle(el, 'transition-delay', config.delay + 's');
            }
            else {
                resolve(el);
            }

        });

        return promise;
    };


    /**
     * 停止动画
     * @param {HTMLElement} el 元素节点
     */
    exports.removeStyle = function(el) {
        // 将transition-property设为none，不会触发transitionend事件，需要手动触发下
        dom.setStyle(el, 'transition-property', 'none');

        fireEndEvent(el);
    };

    exports.onTransitionEnd = function (el, handler, capture) {
        transitionEndEvents.forEach(function (event) {
            el.addEventListener(event, handler, capture || false);
        });

        onEndEvent(el, handler);
    };

    exports.unTransitionEnd = function (el, handler, capture) {
        transitionEndEvents.forEach(function (event) {
            el.removeEventListener(event, handler, capture || false);
        });

        unEndEvent(el, handler);
    };

    exports.oneTransitionEnd = function (el, callback, capture) {
        var handler = function (e) {
            if (callback.call(el, e) !== false) {
                exports.unTransitionEnd(el, handler, capture);
            }
        };

        exports.onTransitionEnd(el, handler, capture);
    };

    return exports;
});
