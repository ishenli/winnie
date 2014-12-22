/**
 * @file dom event
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var eventUtil = require('../base/util');
    var dom = require('../../dom');
    var util = require('../../util');
    var DomEventCache = require('./DomEventObserverCache');
    var DomEventObject = require('./DomEventObject');

    /**
     * 添加observer
     * @param {HTMLElement} currentTarget
     * @param {string} type
     * @param {Object} options
     */
    function createEventObserver(currentTarget, type, options) {
        options = util.merge(options);
        var domEventCacheHolder;
        var domEventObserverCache;
        var domEventObserverCacheList;
        var handler;
        domEventCacheHolder = DomEventCache.getDomEventCacheHolder(currentTarget, true);

        // 如果该domEventCache没有监听的handler
        if (!(handler = domEventCacheHolder.handler)) {
            handler = domEventCacheHolder.handler = function(event) {
                var type = event.type;
                var domEventCache;
                var currentTarget = handler.currentTarget;

                if (DomEventCache.triggerEvent === type) {
                    return undefined;
                }
                domEventCache = DomEventCache.getDomEventCache(currentTarget, type);
                if (domEventCache) {
                    event.currentTarget = currentTarget;
                    event = new DomEventObject(event);
                    return domEventCache.notify(event);
                }

                return undefined;
            };

            handler.currentTarget = currentTarget
        }


        /**
         * 包含关系
         * observerCache 是设置在dom节点上的数据
         * node.data('guid')  => observerCache
         * domEventCacheHolder.observerCache = {
         *      'click': new DomEventCache()
         * }
         *
         * observerCache.click = new DomEventCache({
         *      type:'click',
         *      currentTarget: currentTarget
         * });
         */
        if (!(domEventObserverCacheList = domEventCacheHolder.observerCache)) {
            domEventObserverCacheList = domEventCacheHolder.observerCache = {};
        }

        domEventObserverCache = domEventObserverCacheList[type];

        /**
         * 如果该元素第一次注册事件，没有一个observer，需要new DomEventCache()
         *
         */
        if (!domEventObserverCache) {
            domEventObserverCache = domEventObserverCacheList[type] = new DomEventCache({
                type: type,
                currentTarget: currentTarget
            });

            domEventObserverCache.init();
        }

        /**
         * 对同一个DomEventCache添加新的observer，放在实例的observers数组中
         */
        domEventObserverCache.on(options);

        currentTarget = null;

    }

    function on(element, events, selector, fn, context) {
        var els = dom.query(element);

        eventUtil.batchByType(function (els, type, selector, fn, context) {
            // normalizeParams 处理委托的情况还有问题
            var options = eventUtil.normalizeParams(type, selector, fn, context);
            var i;
            type = options.type;
            var el;
            for (i = els.length - 1; i >= 0; i--) {
                el = els[i];
                createEventObserver(el, type, options);
            }
        }, 1, els, events, selector, fn, context);
    }

    /**
     * 注销事件
     * @param {string|HTMLElement|HTMLElement[]} element
     * @param {string|object} events
     * @param {string} selector
     * @param {Function} fn
     * @param {object} context
     */
    function off(element, events, selector, fn, context) {
        var els = dom.query(element);

        eventUtil.batchByType(function (els, type, selector, fn, context) {
            // normalizeParams 处理委托的情况还有问题
            var options = eventUtil.normalizeParams(type, selector, fn, context);
            var i;
            var children;
            type = options.type;
            var el;
            for (i = els.length - 1; i >= 0; i--) {
                el = els[i];
                removeEventObserver(el, type, options);

                if (options.deep && el.getElementsByTagName) {
                    children = el.getElementsByTagName('*');
                    for (var j=children.length - 1;j >= 0;j--) {
                        removeEventObserver(children[j], type, options);
                    }
                }
            }
        }, 1, els, events, selector, fn, context);
    }

    /**
     * 销毁事件的observer对象
     * @param currentTarget
     * @param type
     * @param options
     */
    function removeEventObserver(currentTarget,type,options) {
        options = util.merge(options);
        var domEventCacheHolder;
        var domEventObserverCache;
        var domEventObserveItem;

        domEventCacheHolder = DomEventCache.getDomEventCacheHolder(currentTarget);
        domEventObserverCache = (domEventCacheHolder || {}).observerCache;

        if (!domEventObserverCache || !domEventCacheHolder) {
            return;
        }

        // 销毁该元素上的所有事件
        if (!type) {
            for (type in domEventObserverCache) {
                domEventObserverCache[type].off(options);
            }
            return;
        }

        // 销毁某个类型的事件，如该元素的click事件
        domEventObserveItem = domEventObserverCache[type];

        if (domEventObserveItem) {
            domEventObserveItem.off(options);
        }
    }
    var domEvent = {
        on: on,
        off: off
    };

    return domEvent;
});