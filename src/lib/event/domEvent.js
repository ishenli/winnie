/**
 * @file event
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('../util');
    var dom = require('../dom');
    var DomEventObserver = require('./DomEventObserver');
    var features = require('./features');
    var Event = require('./Event');
    var domEventObservable = require('./observable');

    var addEvent = 'addEventListener';
    var removeEvent = 'removeEventListener';
    var slice = Array.prototype.slice;
    var eventSupport = features.eventSupport;
    var nativeEvents = features.nativeEvents;
    var ONE = {};


    var NAMESPACE_REG = /[^\.]*(?=\..*)\.|.*/;
    var NAME_REG = /\..*/;
    var win = window;

    /**
     * 事件监听函数
     * @param {Event} event 原生的事件对象
     * @param {string} type 事件类型
     */
    var rootListener = function (event, type) {
        // 拿到listener
        // this 为element
        var listeners = domEventObservable.get(this, type, null, false);
        var len = listeners.length;
        var i = 0;

        event = new Event(event, this, true);

        if (type) {
            event.type = type;
        }

        /**
         * 遍历事件集合
         */
        for (; i < len && !event.isImmediatePropagationStopped(); i++) {
            // 调用事件
            listeners[i].handler.call(this, event);
        }

    };
    /**
     * 给dom元素注册或注销事件
     * @param {HTMLElement} element
     * @param {string} type
     * @param {boolean} add
     */
    var listener = features.isW3c
        ? function (element, type, isAdd) {
        element[isAdd ? addEvent : removeEvent](type, rootListener, false);
    }
        : function (element, type, add) {

    };

    /**
     * 绑定事件
     * @param element
     * @param events
     * @param selector
     * @param fn
     * @param context
     */
    function on(element, events, selector, fn,context) {
        var type;
        var originalFn;
        var args; // 传入的参数
        var types;
        var entry; // DomEventObserver实例的对象
        var first; // boolean
        /**
         * 绑定多个事件
         * on(element, {
                  click: function (e) {},
                  mouseover: function (e) {},
                  'focus blur': function (e) {}
                },context);
         */
        if (selector === undefined && util.isObject(events)) {
            for (type in events) {
                if (events.hasOwnProperty(type)) {
                    on.call(element, element, type, events[type]);
                }
            }
            return;
        }

        /**
         * 实现委托事件
         * on(document,click,'.p',fn);
         * on(document,click,dom.queryAll('p'),fn);
         */
        if (!util.isFunction(selector)) {
            originalFn = fn;
            args = slice.call(arguments, 4);
            fn = delegate(selector, originalFn);
        }
        else {
            // 传入执行函数的参数
            args = slice.call(arguments, 3);
            fn = originalFn = selector;
        }

        types = util.strToArray(events);


        // 如果是once的调用
        if (this === ONE) {
            fn = createOnceFn(off, element, events, fn, originalFn);
        }
        for (var len = types.length; len--;) {

            entry = new DomEventObserver(
                element,
                types[len].replace(NAME_REG, ''),
                fn,
                originalFn,
                util.strToArray(types[len].replace(NAMESPACE_REG, ''), '.'),
                args,
                false,// not root,
                context
            );

            // 放入容器中
            first = domEventObservable.put(entry);

            // 如果是浏览器的原生事件，首次添加需要addEventListener
            if (entry[eventSupport] && first) {
                listener(element, entry.eventType, true);
            }

        }

        return element;
    }

    function createOnceFn(rm, element, event, fn, originalFn) {
        // wrap一个handler然后remove
        return function () {
            fn.apply(this, arguments);
            rm(element, event, originalFn);
        };
    }

    /**
     * 事件委托
     * @param {string|HTMLElement} selector
     * @param {Function} fun
     * @inner
     * @returns {handler}
     */
    function delegate(selector, fun) {
        // 根据选择器找到卫委托的节点
        var findTarget = function (target, root) {
            var i;
            var array = typeof  selector === 'string'
                ? dom.queryAll(selector, root)
                : selector;

            for (; target && target !== root; target = target.parentNode) {
                for (i = array.length; i--;) {
                    if (array[i] === target) {
                        return target;
                    }
                }
            }

        };

        var handler = function (e) {
            var match = findTarget(e.target, this);
            if (match) {
                fun.apply(match, arguments);
            }
        };

        handler._delegate = {
            findTarget: findTarget,
            selector: selector
        };

        return handler;
    }

    var removeListener = function (element, orgType, handler, namespaces) {
        var type = orgType && orgType.replace(NAME_REG, '');
        var listeners = domEventObservable.get(element, type, null, false);
        var removed = {};

        for (var i = 0, len = listeners.length; i < len; i++) {
            if ((!handler || listeners[i].original === handler) // 判断函数是否是orginal
                && listeners[i].inNamespaces(namespaces)
            ) {
                domEventObservable.del(listeners[i]);

                if (!removed[listeners[i].eventType] && listeners[i][eventSupport]) {

                    removed[listeners[i].eventType] = {
                        type: listeners[i].eventType,
                        c: listeners[i].type
                    }
                }
            }
        }

        /**
         * @todo  判断register是否还有该element/type,如果没有则删除rootListener
         */
        for (i in removed) {
            if (!domEventObservable.has(element, removed[i].type, null, false)) {
                listener(element, removed[i].type, false);
            }
        }
    };

    /**
     * 事件移除
     * @param {HTMLElement} element
     * @param {string} types
     * @param {Function} fn
     * @returns {*}
     */
    function off(element, types, fn) {
        var isTypeStr = util.isString(types);
        var namespaces;
        var type;
        /**
         * off(element,'click mouseover')
         */
        if (isTypeStr && types.indexOf(' ') > 0) {
            types = util.strToArray(types);
            for (var len = types.length; len--;) {
                off(element, types[len], fn);
            }
            return element;
        }

        type = isTypeStr && types.replace(NAME_REG, '');

        if (!types || isTypeStr) {
            /**
             * off(element)
             * off(element ,'.a')
             * off(element ,'.a.b')
             */
            if (namespaces = isTypeStr && types.replace(NAMESPACE_REG, '')) {
                namespaces = util.strToArray(namespaces, '.');
            }
            removeListener(element, type, null, namespaces);
        }
        else if (util.isFunction(types)) {
            // off(element,fn)
            removeListener(element, null, fn);
        }

        return element;
    }

    /**
     * 触发事件，要区分W3C和IE事件
     * @type {Function}
     */
    var fireListener = features.isW3c
        ? function (element, type, isNative) {
            /**
             * 标准浏览器支持
             * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget.dispatchEvent
             * @type {Event}
             */
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(type, true, true, win, 1);
            element.dispatchEvent(evt);
        }
        : function (element, type) {

        };

    /**
     *
     * @param {HTMLElement} element
     * @param {string} types
     * @param {*} args
     */
    function fire(element, types, args) {
        types = util.strToArray(types);
        var type;
        var names;
        for (var len = types.length; len--;) {
            type = types[len].replace(NAME_REG, '');

            names = types[len].replace(NAMESPACE_REG, '');
            if (names) {
                names = util.strToArray(names, '.');
            }
            // 浏览器原生的事件
            if (!names && !args && element[eventSupport]) {
                fireListener(element, type, nativeEvents[type]);
            }
            // 传入参数，自定义事件，命名空间
            else {
                var listeners = domEventObservable.get(element, type, null, false);
                args = [false].concat(args); // 因为首个参数为event
                for (var j = 0, l = listeners.length; j < l; j++) {
                    if (listeners[j].inNamespaces(names)) {
                        listeners[j].handler.apply(element, args);
                    }

                }
            }
        }
    }

    function once() {
        return on.apply(ONE, arguments);
    }




    return {
        on: on,
//        add: add,
        once: once,
        one: once,
        off: off,
        un: off,
        remove: off,
        detach: off,
//        clone: clone,
        fire: fire,
        Event: Event
    };

});