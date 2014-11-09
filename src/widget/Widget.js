/**
 * @file ui控件基类，封装基本的方法和属性,api 参考 http://aralejs.org/widget/
 * @author shenli
 */
define(function (require) {
    var lib = require('../lib');
    var util = require('../lib/util');
    var Control = require('./Control');
    var EVENT_KEY_SPLITTER = /^(\S+)\s*(.*)$/;
    var DELEGATE_EVENT_NAMESPACE = '.delegate-event-';
    var DATA_WIDGET_WID = 'data-widget-wid';

    // 存储实例的数组
    var cachedInstances = {};

    /**
     * @constructor
     * @extends module:Control
     * @requires util
     * @requires Control
     * @exports Widget
     * @example
     *   var WidgetA = Widget.extend({
     *      options: {
     *          a:1
     *      },
     *      method:function(){
     *          console.log(this.get('a');
     *      }
     *   });
     *
     *   var widget = new WidgetA({
     *      a: 2
     *   }).render();
     *
     *   widget.method(); // => 2
     *
     */
    var Widget = Control.extend({
        type: 'Widget',

        element: null,

        // 这些属性会直接添加到实例上
        propsInOptions: ['element', 'events'],
        /**
         * 控件配置项
         *
         * @name module:Widget#options
         * @property {(string | selector)} id
         * @property {string} template 组件的模板，支持子类覆盖
         * @property {parentNode} 组件的父节点，默认为body
         */
        options: {
            id: null,
            template: '<div></div>',
            parentNode: document.body
        },
        /**
         * 销毁控件时执行的方法,删除dom元素等
         * @public
         */
        dispose: function () {

            this.undelegateEvents();

            delete cachedInstances[this.wid];
            // 删除节点
            if (this.element) {
//                this.element.off();
                lib.remove(this.element);
            }

            this.element = null;

            this.fire('dispose');

            Widget.superClass.dispose.call(this);

        },
        /**
         * 组件初始化执行的方法
         * @param {Object} config 手动传入的配置项
         * 初始化 options --》初始化 events --》 子类的初始化
         */
        initialize: function (config) {
            // 生成标志符
            this.wid = uniqueWid();

            // 因为类构建的时候只调用自己的initialize方法
            Widget.superClass.initialize.call(this, config);

            // 初始化元素
            this.parseElement();

            // 初始化委托的事件
            this.delegateEvents();

            this._saveInstance();

            this.init && this.init(config);
        },

        /**
         * 解析元素,子类可覆盖
         * @public
         */
        parseElement: function () {

            var element = this.element;

            // 用户传入dom元素或者id
            if (element) {
                this.element = lib.get(element);
            }
            // 从模板中拿
            else if (this.get('template')) {
                this.parseElementFromTemplate();
            }

            if (!this.element) {
                throw new Error('element is invalid');
            }
        },

        /**
         * 从模板解析元素
         * @public
         */
        parseElementFromTemplate: function () {
            this.element = lib.create(this.get('template'));
        },

        /**
         * element插入到父节点中，渲染
         * @returns {Widget}实例
         */
        render: function () {

            if (!this.rendered) {
                // 对属性绑定change事件，set的时候会调用相应的方法
                this.renderAndBindOptions();
                this.rendered = true;
            }


            var parentNode = this.get('parentNode');

            if (parentNode && !lib.isInDocument(this.element)) {
                parentNode.appendChild(this.element);
            }

            return this;
        },
        /**
         * 渲染并相关配置的setter调用
         * @public
         */
        renderAndBindOptions: function () {
            var host = this;
            var options = this.options;
            var option;
            for (option in options) {
                if (!options.hasOwnProperty(option)) {
                    continue;
                }

                // 得到函数名
                var fn = '_onRender' + ucfirst(option);

                if (this[fn]) {
                    var val = this.get(option);

                    if (!isEmptyOption(val)) {
                        this[fn](val, undefined, option);
                    }
                }

                // 注册事件
                (function (fn) {
                    host.on('change:' + option, function (val, prev, key) {
                        host[fn](val, prev, key);
                    });
                }(fn));
            }

        },
        /**
         * 绑定代理事件
         * @param {?jQuery} element 委托的element,默认为组件的element元素
         * @param {Object} events
         * @param {string} events.key  事件名称
         * @param {Function} events.value 函数
         * @param {Function} callback 回调函数
         * @returns 实例
         * @example
         * widget.delegateEvents({
         *      'click p': 'fn1'
         *      'click li': 'fn2'
         * });
         *
         * widget.delegateEvents('click p',function(e){
         *      //doSomething
         * });
         *
         * widget.delegateEvents(element,'click p',function(e){
         *      //doSomething
         * });
         */
        delegateEvents: function (element, events, callback) {
            // 获取参数的数组
            var args = Array.prototype.slice.call(arguments);

            if (args.length === 0) {
                events = getEventsFromInstance(this);
                element = this.element;
            }

            // widget.delegateEvents({
            //   'click p': 'fn1',
            //   'click li': 'fn2'
            // })
            else if (args.length === 1) {
                events = element;
                element = this.element;
            }

            // widget.delegateEvents('click p',function(e){
            //      do something
            // })
            else if (args.length === 2) {
                events = element;
                callback = events;
                element = this.element;
            }

            // widget.delegateEvents(element,'click p',function(e){
            //      do something
            // })

            else {
                element || (element = this.element);
                this._delegateElements || (this._delegateElements = []);
                this._delegateElements.push(element);
            }

            // 讲事件和函数转换为统一的events对象格式
            if (util.isString(events) && util.isFunction(callback)) {
                var obj = {};
                obj[events] = callback;
                events = obj;
            }

            // 绑定事件
            for (var key in events) {
                if (!events.hasOwnProperty(key)) {
                    continue;
                }

                var eventsObj = parseEventKey(key, this);
                var eventType = eventsObj.type;
                var selector = eventsObj.selector;

                (function (callback, instance) {
                    var handler = function (ev) {
                        if (util.isFunction(callback)) {
                            callback.call(instance, ev);
                        }
                        else {

                            // 这个是将事件写入widget的method，而不是在events中
                            instance[callback](ev);
                        }
                    };

                    if (selector) {
                        lib.on(element, eventType, selector, handler);
                    }
                    else {
                        lib.on(element, eventType, handler);
                    }

                }(events[key], this));
            }

            return this;
        },

        /**
         * 解除代理事件
         * @param {?HTMLElement} element ，默认为组件的element元素
         * @param {?Object} eventKey  eg:click .btn
         * @param {?string} eventKey.key  eg:click .btn
         * @returns 实例
         * @example
         * widget.delegateEvents(); // 全部消除
         *
         * widget.undelegateEvents('click'); // 消除click事件
         */

        undelegateEvents: function (element, eventKey) {

            if (!eventKey) {
                eventKey = element;
                element = null;
            }

            // undelegateEvents();
            if (arguments.length === 0) {
                var type = DELEGATE_EVENT_NAMESPACE + this.wid;
                this.element && lib.off(this.element, type);

                // 卸载所有外部传入的 element
                if (this._delegateElements) {
                    for (var de in this._delegateElements) {
                        if (!this._delegateElements.hasOwnProperty(de)) {
                            continue;
                        }
                        lib.off(this._delegateElements[de], type);
                    }
                }
            }
            // undelegateEvents('click');
            else {
                var eventsObj = parseEventKey(eventKey, this);

                // 卸载this.element
                if (!element) {
                    this.element && lib.off(this.element, eventsObj.type, eventsObj.selector);
                }
                else {
                    lib.off(element, eventsObj.type, eventsObj.selector);
                }

            }
            return this;
        },

        /**
         * 保存实例
         * @private
         */
        _saveInstance: function () {

            if (!this.element || !this.element.length) {
                return;
            }

            var wid = this.wid;
            // element与实例关联
            this.element.setAttribute(DATA_WIDGET_WID, wid);

            cachedInstances[wid] = this;
        }

    });

    // For memory leak
    lib.on(window, 'unload', function () {
        for (var wid in cachedInstances) {
            cachedInstances[wid].dispose();
        }
    });

    /**
     * 首字母变为大写
     * @param str 字符串
     * @returns {string}
     */
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    /**
     * 对于一个配置项而言，'',[],{},null,undefined都是空
     * @param o
     * @returns {boolean|*}
     */
    function isEmptyOption(o) {
        return o == null || (util.isString(o) || util.isArray(o)) && o.length === 0
            || util.isEmptyObject(o);
    }

    /**
     * 解释event
     * @param {Object} eventKey
     * @param {Object} instance
     * @returns {{type: string, selector: *}}
     */
    function parseEventKey(eventKey, instance) {
        var match = eventKey.match(EVENT_KEY_SPLITTER);
        // 给绑定事件添加命名空间和标识
        var type = match[1] + DELEGATE_EVENT_NAMESPACE + instance.wid;

        var selector = match[2];

        return {
            type: type,
            selector: selector
        };

    }

    /**
     * 从实例获取events对象
     * @param instance 实例
     * @returns events 实例的events
     */
    function getEventsFromInstance(instance) {
        if (util.isFunction(instance.events)) {
            instance.events = instance.events();
        }
        return instance.events;
    }

    // 计数器
    var widCounter = 0;

    function uniqueWid() {
        return 'widget-' + widCounter++;
    }

    return Widget;
});
