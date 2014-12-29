/**
 * @file DomEventObserver
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Observer = require('../base/Observer');
    var special = require('./special');

    var DomObserver = Observer.extend({
        keys:['fn','context','namespace','type', 'originalType'],
        initialize:function(options) {
            DomObserver.superClass.initialize.call(this, options);
        },
        notifyInternal:function(event, observerCache) {
            var me = this;
            var ret;
            var type = event.type;
            var t;
            var originalType;

            // event.type是fix过的
            // 因为在on的时候，会把mosueenter转为mouseover，进行注册
            if (originalType = me.options.originalType) {
                event.type = originalType;
            }
            else {
                originalType = type;
            }

            if (special[originalType] && special[originalType].handler) {
                t = special[originalType].handler(event, me, observerCache);
                if (t) {
                    ret = t;
                }
            }
            else {
                ret = me.simpleNotify(event,observerCache);
            }

            if (ret === false) {
                event.stop();
            }

            event.type = type;

            return ret;

        }
    });
    return DomObserver;
});