/**
 * @file DomEventObserverCache
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {
    var ObserverCache = require('../base/ObserverCache');
    var DomEventUtils = require('./util');
    var special = require('./special');
    var DomEventObserver = require('./DomEventObserver');

    var DomEventObserverCache = ObserverCache.extend({
        initialize: function (option) {
            DomEventObserverCache.superClass.initialize.call(this, option);
        },
        /**
         * 用于给Dom元素注册事件，作为一个主监听函数
         */
        init: function () {
            var type = this.type;
            var currentTarget = this.currentTarget;
            var eventObserver = DomEventUtils.data(currentTarget);
            var handler = eventObserver.handler;
            var s = special[type] || {};
            if (!s.init) {
                DomEventUtils.addEventListener(currentTarget, type, handler);
            }
        },
        reset: function () {
            DomEventObserverCache.superClass.reset.call(this);

        },
        /**
         *
         * @param {Object} options
         * @property {string} options.type
         * @property {HTMLElement} options.currentTarget
         */
        on: function (options) {
            var me = this;
            var observers = this.observers;

            // 新建一个DomEventObserver
            var observer = options instanceof DomEventObserver ? options : new DomEventObserver(options);

            // 接下去添加observer到observers
            if (this.findObserver(observer) === -1) { // observers中还木有
                if (observer.options.selector) {

                }
                else {
                    observers.push(observer);
                }
            }
        },

        off: function (options) {
            var me = this;
            var observers = this.observers;
            var fn = options.fn;
            var context = options.context;
            var currentTarget = me.currentTarget;
            if (!observers.length) {
                return;
            }

            var observerItem;
            var observerOptions;
            var observerContext;
            var newObservers = [];

            // 如果传入的了函数，需要作为判断删除的一个条件
            if (fn) {
                context = context || currentTarget;
                for (var i = 0, j = 0, len = observers.length; i < len; ++i) {
                    observerItem = observers[i];
                    observerOptions = observerItem.options;
                    observerContext = observerOptions.context || currentTarget;

                    // 执行删除的对象跟observer中的不同，则不删除
                    if (context !== observerContext || (fn && fn !== observerOptions.fn)) {
                        newObservers[j++] = observerItem;
                    }
                    else {
                        // 这里删掉observer
                    }
                }

                me.observers = newObservers; // 更新一下
            }
            else {
                // 全部删除
                me.reset();
            }

        },
        /**
         * notify event的Observers
         * @param {Event} event
         */
        notify: function (event) {
            var me = this;
            var observers = this.observers;
            var currentTarget = this.currentTarget;
            var allObservers = [];
            var delegateCount = this.delegateCount || 0;
            var observerItem;
            var currentTargetObservers;
            var currentTargetItem;
            var currentObserverItem;
            var result;
            var finalResult;

            if (delegateCount < observers.length) {
                allObservers.push({
                    currentTarget: currentTarget,
                    currentTargetObservers: observers.splice(delegateCount)
                });
            }

            /**
             * 执行observers[]的observer对象，先on的先notify
             */
            for (var i = 0, len = allObservers.length; !event.isPropagationStopped() && i < len; ++i) {
                observerItem = allObservers[i];
                currentTargetObservers = observerItem.currentTargetObservers;
                currentTargetItem = observerItem.currentTarget;
                event.currentTarget = currentTargetItem;
                for (var j = 0; !event.isImmediatePropagationStopped() && j < currentTargetObservers.length; j++) {
                    currentObserverItem = currentTargetObservers[j];
                    result = currentObserverItem.notify(event, me);

                    // 和 jQuery 逻辑保持一致
                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (result !== false && result !== undefined) {
                        finalResult = result;
                    }
                }
            }

            return finalResult;

        }


    });

    /**
     * 获取某个类型的事件cache
     * @param {HTMLElement} node
     * @param {string} type
     */
    DomEventObserverCache.getDomEventCache = function (node, type) {
        var cacheHolder = DomEventUtils.data(node);
        var domEventCache;
        if (cacheHolder) {
            domEventCache = cacheHolder.observerCache;
        }
        if (domEventCache) {
            return domEventCache[type];
        }

        return null;
    };


    /**
     * 获取dom节点的事件cache对象，当create为true，在事件cache对象为空时，会添加事件cache对象
     * @param {HTMLElement} node
     * @param {boolean} create
     * @returns {*}
     */
    DomEventObserverCache.getDomEventCacheHolder = function (node, create) {
        var cacheHolder = DomEventUtils.data(node);

        if (!cacheHolder && create) {
            DomEventUtils.data(node, cacheHolder = {});
        }

        return cacheHolder;
    };
    return DomEventObserverCache;
});