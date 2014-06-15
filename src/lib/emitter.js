/**
 * @file 事件发射器，观察者模式实现
 * @author shenli （meshenli@gmail.com）
 */
define(function () {

    function Emitter() {
    }

    var proto = Emitter.prototype;
    var eventSplitter = /\s+/;

    proto._getEvents = function () {
        if (!this._events) {
            this._events = {};
        }

        return this._events;
    };

    /**
     * 获取最大监听器个数
     * 若尚未设置，则初始化最大个数为10
     *
     * @private
     * @return {number}
     */
    proto._getMaxListeners = function () {
        if (isNaN(this.maxListeners)) {
            this.maxListeners = 10;
        }

        return this.maxListeners;
    };
    /**
     * 挂载事件
     * @param events
     * @param listener
     * @param context
     * @returns {Emitter}
     */
    proto.on = function (events, listener, context) {
        var eventsList = this._getEvents();
        var maxListeners = this._getMaxListeners();
        var list, event, currentListeners;
        if (!listener) {
            return this;
        }

        events = events.split(eventSplitter);

        while (event = events.shift()) {

            //获取某个事件的集合
            list = eventsList[event] || (eventsList[event] = []);

            currentListeners = list.length;

            if (currentListeners >= maxListeners && maxListeners !== 0) {
                throw new RangeError(
                        'Warning: possible Emitter memory leak detected. '
                        + currentListeners
                        + ' listeners added.'
                );
            }
            list.push(listener, context);
        }

        return this;

    };

    /**
     * 挂载只执行一次的事件
     * @param events
     * @param listener
     * @param context
     * @returns {Emitter}
     */
    proto.once = function (events, listener, context) {
        var me = this;

        var cb = function () {
            me.off(events, cb);
            listener.apply(context || me, arguments);
        };

        return this.on(events, cb, context);

    };

    proto.un = proto.off = function (events, listener, context) {
        var event, i, list;
        var cache = this._getEvents();

        //一个事件也没有
        if (!cache) {
            return this;
        }

        //off所有事件
        if (arguments.length === 0) {
            delete  this._events;
            return this;
        }

        //获取所有的事件名称
        events = events ? events.split(eventSplitter) : keys(cache);

        while (event = events.shift()) {
            //获取某个事件名下的listeners集合
            list = cache[event];


            if (!list) {
                continue;
            }

            //删除某个事件名下的所有事件
            if (!(listener || context)) {
                delete  cache[event];
                continue;
            }

            //一个事件名下有多个事件
            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(listener && list[i] !== listener
                    || context && list[i + 1] !== context)) {
                    list.splice(i, 2);
                }
            }
        }

        return this;
    };


    proto.fire = proto.emit = function (events) {
        var cache;
        var rest = [];//参数数组
        var event, all, list, i, returned = true;
        if (!(cache = this._events)) {
            return this;
        }
        events = events.split(eventSplitter);

        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i];
        }

        while (event = events.shift()) {

            if (all = cache.all) {
                all = all.slice();
            }
            if (list = cache[event]) {
                list = list.slice();
            }

            //执行事件，all除外
            if (event !== 'all') {
                returned = emitEvents(list, rest, this) && returned;
            }
            //执行事件'all'
            returned = emitEvents(all, [event].concat(rest), this) && returned;

        }

        return returned;
    };


    //helpers
    var keys = Object.keys ? Object.keys : function (list) {
        var result = [];
        for (var name in list) {
            if (list.hasOwnProperty(name)) {
                result.push(name);
            }
        }
        return name;
    };

    function emitEvents(list, args, context) {
        var pass = true;

        if (list) {
            var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2];
            // call is faster than apply, optimize less than 3 argu
            // http://blog.csdn.net/zhengyinhui100/article/details/7837127
            switch (args.length) {
                case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
                case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
                case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
                case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
                default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
            }
        }

        // 一个函数有错，就返回false
        return pass;
    }

    /**
     * 将Emitter混入目标对象
     *
     * @param {Object} obj 目标对象
     * @return {Object} 混入Emitter后的对象
     */
    Emitter.mixTo = function (obj) {
        for (var key in Emitter.prototype) {
            obj[ key ] = Emitter.prototype[ key ];
        }
        return obj;
    };

    return Emitter;

});