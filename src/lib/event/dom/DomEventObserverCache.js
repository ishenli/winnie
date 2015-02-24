/**
 * @file DomEventObserverCache
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {

    var ObserverCache = require('../base/ObserverCache');
    var DomEventUtils = require('./util');
    var BaseUtil = require('../base/util');
    var util = require('../../util');
    var special = require('./special');
    var DomEventObject = require('./DomEventObject');
    var DomEventObserver = require('./DomEventObserver');
    var domMatch = require('../../dom/matches-selector');

    var DomEventObserverCache = ObserverCache.extend({
        initialize: function (option) {
            //DomEventObserverCache.superClass.initialize.call(this, option);
            util.mix(this, option);
            this.reset();
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
            this.delegateCount = 0;

        },
        /**
         * 给cache中添加observer
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

                // delegate事件, 这个将所有的delegate的observer放在一起, 便于notify
                if (observer.options.selector) {
                    observers.splice(me.delegateCount, 0, observer);
                    me.delegateCount++;
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
            var namespace = options.namespace;
            var isDelegate = 'selector' in options;
            var selector = options.selector;
            var namespaceReg;
            if (!observers.length) {
                return;
            }

            if (namespace) {
                namespaceReg = BaseUtil.getNamespaceReg(namespace);
            }
            var observerItem;
            var observerOptions;
            var observerContext;
            var newObservers = [];

            // 如果传入的了函数，需要作为判断删除的一个条件
            if (fn || namespaceReg || isDelegate) {
                context = context || currentTarget;
                for (var i = 0, j = 0, len = observers.length; i < len; ++i) {
                    observerItem = observers[i];
                    observerOptions = observerItem.options;
                    observerContext = observerOptions.context || currentTarget;


                    if (context !== observerContext
                        || (fn && fn !== observerOptions.fn)
                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                        || (namespaceReg && !observerOptions.namespace.match(namespaceReg))
                        || (isDelegate
                                && (
                                (selector && selector !== observerOptions.selector)
                                || (!selector && !observerOptions.selector)
                            )
                        )
                    ) {
                        newObservers[j++] = observerItem;
                    }
                    else {
                        // 删掉observer，如何做处理
                        if (observerOptions.selector && me.delegateCount) {
                            me.delegateCount--;
                        }
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
         * notify
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
            var target = event.target; // 触发该事件的节点,但不一定是绑定事件的节点
            var type = event.type;
            var i, len;


            // 处理delegate
            if (delegateCount && target.nodeType) {
                while (target !== currentTarget) {
                    if (target.disabled !== true || type !== 'click') {
                        currentTargetObservers = [];
                        var selector;
                        var matchCache = {};
                        var isMatch;

                        for (i = 0; i < delegateCount; i++) {
                            observerItem = observers[i];
                            // 判断节点是否匹配selector
                            selector = observerItem.options.selector;
                            isMatch = matchCache[selector];

                            if (isMatch === undefined) {
                                isMatch = matchCache[selector] = domMatch(target, selector);
                            }

                            if (isMatch) {
                                currentTargetObservers.push(observerItem);
                            }
                        }

                        if (currentTargetObservers.length) {
                            allObservers.push({
                                isDelegate: true,
                                currentTarget: target,
                                currentTargetObservers: currentTargetObservers
                            });
                        }
                    }
                    target = target.parentNode || currentTarget;
                }
            }

            if (delegateCount < observers.length) {
                allObservers.push({
                    currentTarget: currentTarget,
                    currentTargetObservers: observers.slice(delegateCount)
                });
            }

            /**
             * 执行observers[]的observer对象，先on的先notify
             */
            for (i = 0, len = allObservers.length; !event.isPropagationStopped() && i < len; ++i) {
                observerItem = allObservers[i];
                currentTargetObservers = observerItem.currentTargetObservers;
                currentTargetItem = observerItem.currentTarget;
                event.currentTarget = currentTargetItem;

                // 如果是delegate,则修正this 指向 currentTarget，同jQuery
                if (observerItem.isDelegate) {
                    me.delegateContext = event.currentTarget;
                }

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

        },
        /**
         * fire要处理冒泡的情况
         * @param event
         * @param {Function} handler
         */
        fire: function (event, handler) {
            event = event || {};
            var me = this;
            var type = me.type;
            var domEventCache;
            var win = window;
            var currentTarget = me.currentTarget;
            var ret;
            var finalResult;
            var eventData;
            var onType = 'on' + type;
            event.currentTarget = currentTarget;
            event.target = event.target || currentTarget;

            var specialEvent = special[type] || {};
            var bubbles = specialEvent.bubbles !== false;

            var current = currentTarget;

            var eventPath = [];
            var bubbleIndex = 0;

            // special fire for click/focus/blur
            if (specialEvent.fire && specialEvent.fire.call(currentTarget, handler) === false) {
                return;
            }

            if (!event.isEventObject) {
                eventData = event;

                event = new DomEventObject({
                    type: type
                });

                util.mix(event, eventData);
            }

            // 拿到冒泡行为上的所有节点
            do {
                eventPath.push(current);
                current = current.parentNode || current.ownerDocument || (current === win.document) && win;

            } while (!handler && current && bubbles);


            current = eventPath[bubbleIndex];

            // 对每个的节点observer进行notify
            do {
                event.currentTarget = current;
                domEventCache = DomEventObserverCache.getDomEventCache(current, type);

                if (domEventCache) {
                    ret = domEventCache.notify(event);

                    if (ret !== undefined && finalResult !== false) {
                        finalResult = ret;
                    }
                }

                if (current[onType] && current[onType].call(event) === false) {
                    event.preventDefault();
                }

                current = eventPath[++bubbleIndex];

            } while (current && !event.isPropagationStopped());


            // 还是要调用原生的事件
            if (!handler && !event.isDefaultPrevented()) {

                try {
                    if (currentTarget[type] && !util.isWindow(currentTarget)) {
                        // 这个是为了标识浏览器的默认事件不触发 winnie的事件
                        DomEventObserverCache.triggeredEvent = type;
                        currentTarget[type]();
                    }
                }
                catch (e) {
                    console.error('event:' + e);
                }

                DomEventObserverCache.triggeredEvent = '';
            }


            return finalResult;

        },
        /**
         * 检查ObserverCache的状态
         * 1.如果没有observers，则delete ObserverCache
         */
        checkStatus: function () {
            var me = this;
            var currentTarget = this.currentTarget;
            var eventCache = DomEventUtils.data(currentTarget);
            var domEventObservers;
            var type = this.type;
            var handler;
            if (eventCache) {
                domEventObservers = eventCache.observerCache;
                // cache中observers中为空
                if (!me.hasObserver()) {
                    handler = eventCache.handler;
                    DomEventUtils.removeEventListener(currentTarget, type, handler);
                    delete domEventObservers[type];
                }

                if (util.isEmptyObject(domEventObservers)) {
                    eventCache.handler = null;
                    DomEventUtils.removeData(currentTarget);
                }
            }
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