/**
 * @file observer for dom event
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('../util');
    var slice = Array.prototype.slice;
    var features = require('./features');
    var isW3c = features.isW3c;
    var eventSupport = features.eventSupport;
    var nativeEvents = features.nativeEvents;
    var doc = document;
    var root = document.documentElement || {};
    var WINDOW = window;


    /**
     * DomEventObserver
     * @param {HTMLElement} element
     * @param {string} type
     * @param {Function} handler
     * @param {Function} original
     * @param {string} namespaces
     * @param {Array} args
     * @param {boolean} root
     * @constructor
     */
    var DomEventObserver = function (element, type, handler, original, namespaces, args, root, context) {
        var isNative;
        // 是否是浏览器原生事件，元素中是否有 addEventListener或attachEvent
        this.isNative = isNative = nativeEvents[type] && !!element[eventSupport];
        this.element = element;
        this.type = type;
        this.original = original;
        this.namespaces = namespaces;
        this.eventType = (isW3c || isNative) ? type : 'propertychange';
        this.target = getTargetElement(element, isNative);
        this[eventSupport] = !!this.target[eventSupport];
        this.root = root;
        this.context = context;
        this.delegateSelector = handler._delegate && handler._delegate.selector;
        // 事件执行函数,如果是浏览器原生事件会传入event对象
        // this.handler.call(element, event);
        this.handler = wrappedHandler(element, handler, null, args, context);
    };

    DomEventObserver.prototype.inNamespaces = function (checkNamespaces) {
        var i, j, counter = 0;
        if (!checkNamespaces) {
            return true;
        }
        if (!this.namespaces) {
            return false;
        }

        for (i = checkNamespaces.length; i--;) {
            for (j = this.namespaces.length; j--;) {
                if (checkNamespaces[i] === this.namespaces[j]) {
                    counter++;
                }
            }
        }
        return checkNamespaces.length === counter;
    };


    /**
     * 检测传入的参数是否实例的具体属性
     * @param checkElement
     * @param checkOriginal
     * @param checkHandler
     */
    DomEventObserver.prototype.matches = function (checkElement, checkOriginal, checkHandler) {
        return this.element === checkElement
            && (!checkOriginal || this.original === checkOriginal)
            && (!checkHandler || this.handler === checkHandler);
    };


    /**
     * 判断传入的selector 是否与 实体的selector相互匹配
     * @param selector
     * @returns {boolean}
     */
    DomEventObserver.prototype.isDelegated = function(selector) {
        if (selector === '**' || !this.delegateSelector) {
            return true;
        }
        return this.delegateSelector == selector;
    };



    function wrappedHandler(element, fn, condition, args, context) {

        context = context || element;
        // 修复ie事件中的this的问题
        var call = function (event, eargs) {
            var execArgs;
            // 函数执行的this指向元素 ,args 经过slice确保返回的是array
            if (args && args.length) {
                execArgs = slice.call(eargs, event ? 0 : 1).concat(args);
            }
            else {
                execArgs = eargs;
            }
                //var execArgs =  args ? slice.call(eargs, event ? 0 : 1).concat(args) : eargs;
            return fn.apply(context, execArgs);

        };

        var findTarget = function (event, eventElement) {
            return fn._delegate ? fn._delegate.findTarget(event.target, element) : eventElement;
        };

        var handler = function (event) {
            // delegate
            if (fn._delegate) {
//                    event = event.clone(findTarget(event));
                event.currentTarget = findTarget(event, this);
            }
            return call(event, arguments);
        };


        handler._delegate = fn._delegate;

        return handler;
    }

    /**
     * 在老版本的ie浏览器里，无法使用propertychange在doc和window，所以用documentElement
     * @param {HTMLElement} element
     * @param {boolean} isNative
     * @returns {HTMLElement|{}}
     */
    function getTargetElement(element, isNative) {
        return !isW3c && !isNative && (element === doc || element === WINDOW) ? root : element
    }

    return DomEventObserver;

});