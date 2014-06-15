/**
 * @file dom event
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var u = require('underscore');
    var lib = require('./dom');
    var DOC = document;
    var W3C = DOC.dispatchEvent; //IE9开始支持W3C的事件模型与getComputedStyle取样式值
    var html = DOC.documentElement; //HTML元素
//    var head = DOC.head || DOC.getElementsByTagName("head")[0]; //HEAD元素

    var event = {};
    //存储基本的事件，如自定义事件和事件修复
    var eventFix = {
        list: [],
        custom: []
    };

    //存储代理事件，用于销毁
    var eventProxy = {
        list: []
    };

    //修改标准浏览器不支持mouseenter
    //http://www.w3help.org/zh-cn/causes/BT9017
    if (!('onmouseenter' in DOC)) {
        var check = function (e) {

            //relatedTarget
            //https://developer.mozilla.org/en-US/docs/Web/API/event.relatedTarget
            var related = e.relatedTarget;
            if (related == null) {
                return true;
            }
            if (!related) {
                return false;
            }

            //this为element
            return (related !== this)
                && related.prefix !== 'xul' //http://bugs.jquery.com/ticket/5631
                && related.nodeType !== 9  //document
                // 如果包含元素，就返回false，不触发事件
                && !lib.contains(this, related);
        };

        eventFix.custom.mouseenter = {
            base: 'mouseover',
            condition: check
        };

        eventFix.custom.mouseleave = {
            base: 'mouseoout',
            condition: check
        };

    }
    /**注册事件
     * @param {(HTMLElement | window)} element 目标元素
     * @type {String}
     */
    event.on = document.addEventListener ?
        function (element, type, listener, context) {
            var condition;
            var custom = eventFix.custom[type];

            //指定执行的作用域，先这样写了，后期优化
            if (context) {
                condition = event.proxy(listener, context);

                listener.index = eventProxy.list.length;
                // 保存事件的标识，用于移除事件
                eventProxy.list[listener.index] = condition;

            } else {
                condition = listener
            }

            var realType = type;

            if (custom) {
                realType = custom.base;
                condition = function (e) {
                    //如果识别是自定义事件，则调用listener
                    if (custom.condition.call(element, e, type)) {
                        e._type = type;
                        listener.call(element, event);
                    }

                    listener.index = eventFix.list.length;
                    // 保存事件的标识，用于移除事件
                    eventFix.list[listener.index] = condition;
                };
            }

            //第三个为true，则取消冒泡
            return element.addEventListener(realType, condition, !!arguments[3]);
        }
        : function (element, type, listener) {
        element.attachEvent('on' + type, listener);
    };

    /**
     * 为目标元素移除事件监听器
     * @param {(HTMLElement | window)} element 目标元素
     * @param {(boolean)} isProxy 是否是代理的事件
     * @type {Function}
     */
    event.un = DOC.removeEventListener ?
        function (element, type, listener, isProxy) {
            var condition = listener;
            var custom = eventFix.custom[type];
            var realType = type;

            if (custom) {
                realType = custom.base;
                condition = eventFix.list[listener.index];
                delete  eventFix.list[listener.index];
                delete  listener.index;
            }
            if (isProxy) {
                condition = eventProxy.list[listener.index];
                delete  eventProxy.list[listener.index];
                delete  listener.index;
            }
            element.removeEventListener(
                realType,
                condition,
                !!arguments[3]
            );
            return element;
        }
        : function (element, type, listener) {
        element.detachEvent('on' + type, listener);
        return element;
    };

    /**
     * 触发事件
     * @type {Function}
     */
    event.fire = DOC.createEvent
        ? function (element, type) {

        var custom = eventFix.custom[type];
        var realType = type;
        if (custom) {
            realType = custom.base; // 如 mouseenter 转为 mouseover
        }

        // 标准浏览器使用dispatchEvent方法
        var env = DOC.createEvent('HTMLEvents');
        // initEvent接受3个参数：
        // 事件类型，是否冒泡，是否阻止浏览器的默认行为
        env.initEvent(realType, true, true);

        element.dispatchEvent(env);

        return element;
    }
        : function (element, type) {
        // IE浏览器支持fireEvent方法
        var event = DOC.createEventObject();
        element.fireEvent('on' + type, event);
        return element;
    };

    /**
     * 只执行一次的事件
     * @param ele
     * @param type
     * @param fun
     */
    lib.one = function (ele, type, fun) {

        ele = lib.g(ele);

        var callee = function () {
            ele.removeEventListener(type, callee, false);
            fun();
        };

        ele.addEventListener(type, callee, false);
    };
    /**
     * 简单的事件代理
     * @param el 委托的元素
     * @param selector 父级元素的class
     * @param type
     * @param fn
     * @param capture
     * @returns {*}
     */
    event.bind = function (el, selector, type, fn, capture) {
        return event.on(el, type, function (e) {
            var target = event.getTarget(e);
            e.delegateTarget = lib.closest(target, selector, true, el);
            if (e.delegateTarget) {
                fn.call(el, e);
            }
        }, capture);
    };

    /**
     * 消除事件代理
     * @param el
     * @param type
     * @param fn
     * @param capture
     */
    event.unbind = function (el, type, fn, capture) {
        event.un(el, type, fn, capture);
    };
    /**
     * 阻止事件默认行为
     *
     * @param {Event | undefined} e 事件对象
     */
    event.preventDefault = function (e) {
        e = e || window.e;

        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            e.returnValue = false;
        }
    };

    /**
     * 阻止事件冒泡
     *
     * @param {Event | undefined} e 事件对象
     */
    event.stopPropagation = function (e) {

        e = e || window.event;
        e.stopPropagation
            ? e.stopPropagation()
            : e.cancelBubble = true;
    };

    /**
     * 获取事件源对象
     *
     * @method module:lib.event.getTarget
     * @param e DOM 事件对象
     *
     * @return {HTMLElement} 获取事件目标对象
     */
    event.getTarget = function (e) {
        e = e || window.event;
        return e.target || e.srcElement;
    };


    event.proxy = function (func, context) {
        var aArgs = Array.prototype.slice.call(arguments, 2);
        return function () {
            func.apply(context, Array.prototype.slice.call(arguments, 0).concat(aArgs));
        };
    };

    ////============================scrollStop===========================
    (function (win) {
        function registerScrollStop() {
            event.on(win, 'scroll', u.debounce(function () {
                event.fire(win, 'scrollStop');
            }, 80, false));
        }

        function backEventOffHandler() {
            //在离开页面，前进或后退回到页面后，重新绑定scroll,
            // 需要un掉所有的scroll，否则scroll时间不触发
            event.un(win, 'scroll');
            registerScrollStop();
        }

        registerScrollStop();

        //todo 待统一解决后退事件触发问题
        event.on(win, 'pageshow', function (e) {
            //如果是从bfcache中加载页面，为了防止多次注册，需要先un掉
            if (e.persisted) {
                event.un(win, 'touchstart', backEventOffHandler);
                event.one(win, 'touchstart', backEventOffHandler);
            }
        });
    }(window));

    //============================domReady机制===========================
    var readyList = [];
    event.ready = function (fn) {
        if (readyList) {
            readyList.push(fn);
        } else {
            fn();
        }
    };

    var readyFn,readyEvent = W3C
            ? 'DOMContentLoaded'
            : 'readyStateChange';

    function fireReady(){

        u.each(readyList,function(fn){
            fn();
        });
        readyList = null;

        fireReady = function(){};
    }

    function doScrollCheck(){
        //ie 在dom未加载完全，执行doScroll（'left'）会抛出异常
        //http://msdn.microsoft.com/en-us/library/ie/ms536414(v=vs.85).aspx
        try{
            html.doScroll('left');
        }catch(e){
            setTimeout(doScrollCheck);
        }
    }

    //firefox 3.6 之前不支持readyState,通过判断body是否已经生成模拟readyState
    if(!DOC.readyState){
        var readyState = DOC.readyState = DOC.body ? 'complete' :'loading';
    }

    if(DOC.readyState === 'complete'){
        fireReady();
    } else {
        event.on(DOC,readyEvent,readyFn = function() {
            if(W3C || DOC.readyState ==='complete'){
                fireReady();
                if(readyState) {
                    DOC.readyState = 'complete';
                }
            }
        });

        if(html.doScroll) {
            try{
                if(self.eval === parent.eval) {
                    doScrollCheck();
                }
            }catch (e){
                doScrollCheck();
            }
        }
    }


    return event;
});