/**
 * @file event object for custom and dom event.
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var util = require('../../util');
    var Class = require('../../class');

    var returnFalse = function () {
        return false;
    };

    var returnTrue = function () {
        return true;
    };

    /**
     * 事件对象
     * @constructor
     */
    var EventObject = Class.create({

        initialize: function () {
            this.timeStamp = util.now();

            this.currentTarget = undefined;

            this.target = undefined;
        },

        // 阻止默认行为
        isDefaultPrevented: returnFalse,

        // 阻止冒泡
        isPropagationStopped: returnFalse,

        // 立即停止
        isImmediatePropagationStopped: returnFalse,

        /**
         * 阻止浏览器默认行为
         */
        preventDefault: function () {
            this.isDefaultPrevented = returnTrue;
        },


        /**
         * 阻止冒泡
         */
        stopPropagation: function () {
            this.isPropagationStopped = returnTrue;
        },

        /**
         * 立即停止事件执行和传播
         */
        stopImmediatePropagation: function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        },

        /**
         * 停止所有动作
         * @param {boolean} immediate
         */
        stop: function (immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            }
            else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    return EventObject;
});