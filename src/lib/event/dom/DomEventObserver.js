/**
 * @file DomEventObserver
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Observer = require('../base/Observer');

    var DomObserver = Observer.extend({
        keys:['fn','context','namespace','type'],
        initialize:function(options) {
            DomObserver.superClass.initialize.call(this, options);
        },
        notifyInternal:function(event, observerCache) {
            var me = this;
            var ret;
            ret = me.simpleNotify(event,observerCache);

            if (ret === false) {
                event.stop();
            }

            return ret;

        }
    });
    return DomObserver;
});