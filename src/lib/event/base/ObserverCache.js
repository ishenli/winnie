/**
 * @file ObserverCache
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {

    var util = require('../../util');
    var Class = require('../../class');
    var ObserverCache;
    ObserverCache = Class.create({

        initialize: function (option) {
            this.currentTarget = null;
            util.mix(this, option);
            this.reset();
        },
        hasObserver: function () {
            return !!this.observers.length;
        },
        reset: function () {
            this.observers = [];
        },

        /**
         * 删除一个observer
         * @param {Observer} observer
         */
        removeObserver: function (observer) {
            var i;
            var len = this.observers.length;
            for (i = 0; i < len; i++) {
                if (this.observers[i] === observer) {
                    this.observers.splice(i, 1);
                    break;
                }
            }

            this.checkStatus();
        },

        /**
         * @override
         */
        checkStatus: function () {
        },

        /**
         * 查找observer是否已经在observers数组中
         * @param observer
         * @returns {number}
         */
        findObserver: function (observer) {
            var observers = this.observers,
                i;

            for (i = observers.length - 1; i >= 0; --i) {
                if (observer.equals(observers[i])) {
                    return i;
                }
            }

            return -1;
        }
    });

    return ObserverCache;
});
