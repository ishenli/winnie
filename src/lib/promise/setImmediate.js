/**
 * @file setImmedidate 兼容
 * @author shenli （meshenli@gmail.com）
 * 参考 https://github.com/ecomfe/promise/blob/master/src/setImmediate.js
 */
define(function () {
    var global = (function () {
        return this;
    });

    var callbackPool = {};
    var cursor = 1;

    function registerCallback(cb) {
        callbackPool[cursor] = cb;
        return cursor++;
    }

    function runCallback(tick) {
        var callback = callbackPool[tick];
        if (callback) {
            delete  callbackPool[tick];
            callback();
        }
    }
    /**
     * 依次调用以下方法
     * setImmediate 原生
     * MutationObserver
     * https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
     * postMessage - ie8-9
     * MessageWorker - webWork内
     * setTimeout
     *
     */
    if (typeof  global.setImmediate === 'function') {
        return global.setImmediate;
    }

    if (global.MutationObserver || global.WebKitMutationObserver
        || global.MozMutationObserver)
    {
        var ATTRIBUTE_NAME = 'data-promise-tick';
        var MutationObserver = global.MutationObserver || global.WebKitMutationObserver
            || global.MozMutationObserver;

        var ensureElementMutation = function (mutations, observer) {
            var item = mutations[0];
            if (item.attributeName === ATTRIBUTE_NAME) {
                var tick = item.target.getAttribute(ATTRIBUTE_NAME);
                runCallback(tick);
                // 断开
                observer.disconnect(item.target);
            }
        };

        return function(cb) {
            var element = document.createElement('div');
            var observer = new MutationObserver(ensureElementMutation);

            observer.observe(element, {
                attribute: true
            });

            var tick = registerCallback(cb);

            element.setAttribute(ATTRIBUTE_NAME, tick);
        };
    }

    // 要判断不在`WebWorker`内
    if (typeof global.postMessage === 'function' && typeof global.importScript !== 'function') {
        // 部分IE的`postMessage`的`callback`是同步触发的，要去掉这一批
        var isPostMessageAsync = true;
        var oldListener = global.onmessage;
        global.onmessage = function() {
            isPostMessageAsync = false;
        };
        global.postMessage('', '*');
        global.onmessage = oldListener;

        if (isPostMessageAsync) {
            var MESSAGE_PREFIX = 'promise-tick-';

            var ensureMessage = function (e) {
                if (e.source === global && typeof e.data === 'string' && e.data.indexOf(MESSAGE_PREFIX) === 0) {
                    var tick = e.data.substring(MESSAGE_PREFIX.length);
                    runCallback(tick);
                }
            };
            if (global.addEventListener) {
                global.addEventListener('message', ensureMessage, false);
            }
            else {
                global.attachEvent('onmessage', ensureMessage);
            }

            return function (callback) {
                var tick = registerCallback(callback);
                global.postMessage(MESSAGE_PREFIX + tick, '*');
            };
        }
    }

    return function (callback) {
        setTimeout(callback, 0);
    };
});