/**
 * @file 动画
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {

    var util = require('../lib/util');
    var dom = require('../lib/dom');
    var feature = require('../lib/feature');
    var Promise = require('../lib/promise');
    var transition = require('./animation/transition');

    var DEFAULT_CONFIG = {
        duration: 1,
        easing: 'liner'
    };


    /**
     * 动画缓动效果
     *
     * @const
     * @type {Object}
     */
    var TIMING_FUNCTION = {
        'default': 'ease',
        'in': 'ease-in',
        'out': 'ease-out',
        'in-out': 'ease-in-out',
        'snap': 'cubic-bezier(0,1,.5,1)',
        'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
        'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
        'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
        'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
        'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
        'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
        'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
        'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
        'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
        'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
        'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
        'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
        'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
        'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
        'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
        'ease-in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
        'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
        'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
        'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
        'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
        'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
        'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
        'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
    };


    function Animation(node, to, duration, easing, complete) {
        var config;

        /**效果函数全部写在一个object中
         * Animation('#id',{width:100px},{
         *     easing:'ease-in-out-back',
         *     duration:'1',
         *     complete:function(){
         *         alert('complete');
         *     }
         * }
         */
        if (util.isPlainObject(duration)) {
            config = util.clone(duration);
        }
        else {
            config = {
                complete: complete
            };

            if (duration) {
                config.duration = duration;
            }

            if (easing) {
                config.easing = TIMING_FUNCTION[easing] || easing;
            }
        }

        // extend默认配置
        config = util.extend(DEFAULT_CONFIG, config);

        this.config = config;


        if (!util.isPlainObject(node)) {
            node = dom.get(node);
        }

        this.node = node;
        this.to = to;

        this._action = {};
        this._promise = Promise.resolve();

    }


    /**
     * 注册动作
     *
     * @public
     * @param {string} name 动作名称
     * @param {Function} fn 动作处理函数
     * fn是一个创建闭包的函数，返回一个含有方法的对象
     * 如rotate则返回
     * return {
     *     rotate:function () {
     *         // 处理rotate的逻辑
     *     }
     * }
     */
    Animation.addAction = function (name, fn) {
        var prototype = Animation.prototype;
        if (!prototype.hasOwnProperty(name)) {
            prototype[name] = function () {
                var me = this;
                var args = Array.prototype.slice.call(arguments);
                var res = fn.apply(me, args) || {};
                var value;
                Object.keys(res).forEach(function (key) {
                    value = res[key];
                    me.set(key, value);
                });
                return me;
            };
        }
    };


    Animation.prototype = {
        constructor: Animation,

        stop: function () {

        },
        run: function () {
            var el = this.node;
            var item;
            var config = this.config;
            var action = util.extend({}, this._action);

            if (!Object.keys(action).length) {
                return;
            }

            this.reset();

            this._promise = this._promise.then(function () {
                Object.keys(action).forEach(function (key) {
                    item = action[key];
                    if (util.isFunction(item)) {
                        item = item(el) || {};
                        delete action[key];
                        setAction(item, action);
                    }
                });

                return transition.addStyle(el, action, config);
            });

            return this;
        },
        set: function (key, value) {
            var data = {};
            data[key] = value;
            setAction(data, this._action);
            return this;
        },
        /**
         * 配置动画时间
         * @param {number} value
         */
        duration: function (value) {
            this.config.duration = value;
            return this;
        },

        ease:function(value) {
            this.config.easing = TIMING_FUNCTION[value] || value;
            return this;
        },
        reset: function () {
            this._action = {};
            this.config = util.extend({}, DEFAULT_CONFIG);
            return this;
        },
        finish:function(callback) {
            this._promise.then(function () {
                callback();
            });

            return this;
        }
    };


    Animation.addAction('move', function (x, y) {
        return {
            move: function (ele) {
                var res = {};
                var left = dom.css(ele, 'left');
                if (x && left) {
                    x += parseInt(left, 10);
                }
                res.left = x + 'px';

                var top = dom.css(ele, 'top');
                if (y && top) {
                    y += parseInt(top, 10);
                }

                res.top = y + 'px';


                return res;
            }
        }
    });

    Animation.addAction('rotate', function (deg) {
        return {
            rotate:function (el) {
                var ret = feature.parseTransform(dom.css(el, 'transform'));
                deg += parseInt(ret.rotate || '0', 10);
                return {
                    transform: 'rotate(' + deg + 'deg)'
                };
            }
        };

    });


    /**
     *
     * @param {HTMLElement} element
     * @param {number=} duration
     * @param {string} easing
     * @param {Function} complete
     * @return {Animation}
     */
    Animation.animation = function (element,duration, easing, complete) {
        return new Animation(element,duration, easing, complete);
    };


    /**
     * 设置动作
     * 处理样式
     *
     * @inner
     * @param {Object} properties 样式属性
     * @param {Object} action 动作集合
     * @return {Object}
     */
    function setAction(properties, action) {
        var value;
        Object.keys(properties).forEach(function (property) {
            value = properties[property];
            if (property === 'transform') {
                properties = feature.parseTransform(action[property] || '');
                value = feature.parseTransform(value);
                properties = util.extend(properties, value);
                action[property] = feature.stringifyTransform(properties);
            }
            else {
                action[property] = value;
            }
        });

        return action;
    }


    return Animation;
});
