/**
 * @file observer
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var util = require('../../util');
    var Class = require('../../class');
    var Observer;

    Observer = Class.create({

        /**
         * initialize
         * @param {*|{}} options 配置
         * @property {Function} fn 执行的函数
         * @property {string|number} once 是否执行一次
         * @property {*} data 函数执行的参数
         * @property {*} context 函数执行的作用域
         *
         */
        initialize: function (options) {
            this.options = options || {};

        },

        /**
         * 判断observer是否相等
         * @param {Object} o
         * @returns {boolean}
         */
        equals: function (o) {
            var ret = true;
            var me = this;
            util.each(this.keys, function (key) {
                if (!me.options[key] || me.options[key] !== o.options[key]) {
                    ret = false;
                }
            });
            return ret;
        },
        /**
         * 事件通知
         * @param {Event} event
         * @param {observerCache} observerCache
         * @return {*} ret
         */
        simpleNotify: function (event, observerCache) {
            var me = this;
            var options = me.options;
            var ret = options.fn.call(options.context || options.delegateContext || observerCache.currentTarget, event, options.data);
            if (options.once) {
                observerCache.removeObserver(me);
            }

            return ret;
        },

        /**
         * 事件通知,如果结果为FALSE，则停止事件的执行和传播
         * @param {Event} event
         * @param {observerCache} observerCache
         * @return {*} ret
         */
        notifyInternal: function (event, observerCache) {
            var ret = this.simpleNotify(event, observerCache);

            if (ret === false) {
                event.stop();
            }
            return ret;
        },

        /**
         * notify
         * @param {Event} event
         * @param {observerCache} observerCache
         * @return {*} ret
         */
        notify: function (event, observerCache) {
            var me = this;

            return me.notifyInternal(event, observerCache);
        }

    });

    return Observer;
});
