/**
 * @file ui控件基础，封装基本的方法和属性
 * @author shenli
 */
define(function (require) {
    var u = require('underscore');
    var lib = require('./lib');
    var Control = require('./Control');

    var Widget = Control.extend({

        type:'Widget',

        element:null,

        /**
         * 销毁控件时执行的方法
         */
        dispose: function () {
            //注销事件
            for (var type in this._listener) {
                this.un(type);
            }

            //删除节点
            var element = this.element;
            lib.removeNode(element);

            delete  this.element;

            this.fire('dispose');

        },
        /**
         * 添加事件绑定
         * @public
         * @param {string} type 事件类型
         * @param {Function} listener 要添加绑定的监听器
         */
        on: function (type, listener) {
            if (u.isFunction(type)) {
                listener = type;
                type = '*';
            }

            this._listeners = this._listeners || {};
            var listeners = this._listeners[type] || [];

            if (u.indexOf(listeners, listener) < 0) {
                listener.$type = type;
                listeners.push(listener);
            }

            this._listeners[type] = listeners;

            return this;
        },
        /**
         * 解除事件绑定
         *
         * @public
         * @param {string} type 事件类型
         * @param {Function} listener 要解除绑定的监听器
         */
        un: function (type, listener) {

            if (u.isFunction(type)) {
                listener = type;
                type = '*';
            }

            this._listeners = this._listeners || {};
            var listeners = this._listeners[type];

            if (listeners) {
                if (listener) { //删除某个事件
                    var index = u.indexOf(listeners, listener);

                    if (~index) {
                        delete listeners[index];
                    }
                } else {
                    //http://stackoverflow.com/questions/4804235/difference-between-array-length-0-and-array
                    listeners.length = 0; //清空数组
                    delete this._listeners[type]; //删除数组的引用
                }
            }

            return this;
        },

        /**
         * 添加单次事件绑定
         *
         * @public
         * @param {string=} type 事件类型
         * @param {Function} listener 要添加绑定的监听器
         */
        once: function (type, listener) {
            if (u.isFunction(type)) {
                listener = type;
                type = '*';
            }

            var me = this;
            var realListener = function () {
                listener.apply(me, arguments);
                me.un(type, realListener);
            };
            this.on.call(me, type, realListener);
        },

        /**
         * 触发指定事件
         *
         * @public
         * @param {string} type 事件类型
         * @param {Object} args 透传的事件数据对象
         */
        fire: function (type/*,args*/) {
            this._listeners = this._listeners || {};
            var listeners = this._listeners[type];
            var args = Array.prototype.slice.call(arguments, 1);
            args.push(type);
            if (listeners) {
                u.each(
                    listeners,
                    function (listener) {

                        //args = args || {};
                        //args.type = type;

                        listener.apply(this,args);

                    },
                    this
                );
            }

            if (type !== '*') {
                this.fire('*', args);
            }

            return this;
        },
        /**
         * 组件初始化执行的方法
         * @param config
         */
        initialize:function(config) {

           //因为类构建的时候只调用自己的initialize方法

           Widget.superClass.initialize.call(this, config);

            config = config || {};

            /*if(!config.element){
                throw  new Error('no element is passed');
            }*/

            config.element && (this.element = lib.g(config.element));

            this.init && this.init();
        }
    });


    return Widget;
});