/**
 * @file special event
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var dom = require('../../dom');
    var util = require('../../util');

    var exports = {};
    var SPECIAL_EVENTS = [
        {name: 'mouseenter', fix: 'mouseover'},
        {name: 'mouseleave', fix: 'mouseout'}
    ];

    util.each(SPECIAL_EVENTS, function (o) {
        exports[o.name] = {
            typeFix: o.fix,
            handler:function(event,observer,observerCache) {

                // https://developer.mozilla.org/en-US/docs/Web/Events/mouseenter
                // mouseover 事件不同，只有在鼠标指针穿过被选元素时，才会触发 mouseenter 事件
                // 如果鼠标指针穿过任何子元素，同样会触发 mouseover 事件
                var currentTarget = event.currentTarget;
                var relateTarget = event.relatedTarget;

                if (!relateTarget
                    || (relateTarget !== currentTarget && !dom.contains(currentTarget, relateTarget))) {
                    return observer.simpleNotify(event, observerCache);
                }
            }
        }
    });

    return exports;
});