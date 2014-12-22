/**
 * @file DomEventObject
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var baseObject = require('../base/object');
    var util = require('../../util');
    var FALSE = false;
    var TRUE = true;

    function retTrue() {
        return TRUE;
    }

    function retFalse() {
        return FALSE;
    }

    var commonProps = util.strToArray(
        'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode ' +
        'relatedTarget shiftKey srcElement target timeStamp type view ' +
        'which propertyName'
    );

    var typeFixers = [
        {
            reg: /^key/,
            props: ['char', 'charCode', 'key', 'keyCode', 'which'],
            fix: function (event, originalEvent) {
                if (event.which == null) {
                    event.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
                }

                // add metaKey to non-Mac browsers (use ctrl for PC 's and Meta for Macs)
                if (event.metaKey === undefined) {
                    event.metaKey = event.ctrlKey;
                }
            }
        },
        {
            reg: /^touch/,
            props: ['touches', 'changedTouches', 'targetTouches']
        },
        {
            reg: /^hashchange$/,
            props: ['newURL', 'oldURL']
        },
        {
            reg: /^gesturechange$/i,
            props: ['rotation', 'scale']
        },
        {
            reg: /^(mousewheel|DOMMouseScroll)$/,
            props: [],
            fix: function (event, originalEvent) {
                var deltaX,
                    deltaY,
                    delta,
                    wheelDelta = originalEvent.wheelDelta,
                    axis = originalEvent.axis,
                    wheelDeltaY = originalEvent.wheelDeltaY,
                    wheelDeltaX = originalEvent.wheelDeltaX,
                    detail = originalEvent.detail;

                // ie/webkit
                if (wheelDelta) {
                    delta = wheelDelta / 120;
                }

                // gecko
                if (detail) {
                    // press control e.detail == 1 else e.detail == 3
                    delta = 0 - (detail % 3 === 0 ? detail / 3 : detail);
                }

                // Gecko
                if (axis !== undefined) {
                    if (axis === event.HORIZONTAL_AXIS) {
                        deltaY = 0;
                        deltaX = 0 - delta;
                    }
                    else if (axis === event.VERTICAL_AXIS) {
                        deltaX = 0;
                        deltaY = delta;
                    }
                }

                // Webkit
                if (wheelDeltaY !== undefined) {
                    deltaY = wheelDeltaY / 120;
                }
                if (wheelDeltaX !== undefined) {
                    deltaX = -1 * wheelDeltaX / 120;
                }

                // 默认 deltaY (ie)
                if (!deltaX && !deltaY) {
                    deltaY = delta;
                }

                if (deltaX !== undefined) {
                    /**
                     * deltaX of mousewheel event
                     * @property deltaX
                     * @member Event.DomEvent.Object
                     */
                    event.deltaX = deltaX;
                }

                if (deltaY !== undefined) {
                    /**
                     * deltaY of mousewheel event
                     * @property deltaY
                     * @member Event.DomEvent.Object
                     */
                    event.deltaY = deltaY;
                }

                if (delta !== undefined) {
                    /**
                     * delta of mousewheel event
                     * @property delta
                     * @member Event.DomEvent.Object
                     */
                    event.delta = delta;
                }
            }
        },
        {
            reg: /^mouse|contextmenu|click|mspointer|(^DOMMouseScroll$)/i,
            props: [
                'buttons', 'clientX', 'clientY', 'button',
                'offsetX', 'relatedTarget', 'which',
                'fromElement', 'toElement', 'offsetY',
                'pageX', 'pageY', 'screenX', 'screenY'
            ],
            fix: function (event, originalEvent) {
                var eventDoc, doc, body,
                    target = event.target,
                    button = originalEvent.button;

                // Calculate pageX/Y if missing and clientX/Y available
                if (target && event.pageX == null && originalEvent.clientX != null) {
                    eventDoc = target.ownerDocument || DOCUMENT;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    event.pageX = originalEvent.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = originalEvent.clientY +
                    (doc && doc.scrollTop || body && body.scrollTop || 0) -
                    (doc && doc.clientTop || body && body.clientTop || 0);
                }

                // which for click: 1 === left; 2 === middle; 3 === right
                // do not use button
                if (!event.which && button !== undefined) {
                    event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
                }

                // add relatedTarget, if necessary
                if (!event.relatedTarget && event.fromElement) {
                    event.relatedTarget = (event.fromElement === target) ? event.toElement : event.fromElement;
                }

                return event;
            }
        }
    ];

    var DomEventObject = baseObject.extend({

        initialize:function(originalEvent) {

            var self = this;
            if (!arguments.length || !originalEvent) {
                return;
            }

            DomEventObject.superClass.initialize.call(this);



            var isNative = (typeof originalEvent.stopPropagation === 'function') ||
                (typeof originalEvent.cancelBubble === 'boolean');
            var type = originalEvent.type;

            this.originalEvent = originalEvent;

            var isDefaultPrevented = retFalse;
            if ('defaultPrevented' in originalEvent) {
                isDefaultPrevented = originalEvent.defaultPrevented ? retTrue : retFalse;
            } else if ('getPreventDefault' in originalEvent) {
                // https://bugzilla.mozilla.org/show_bug.cgi?id=691151
                isDefaultPrevented = originalEvent.getPreventDefault() ? retTrue : retFalse;
            } else if ('returnValue' in originalEvent) {
                isDefaultPrevented = originalEvent.returnValue === FALSE ? retTrue : retFalse;
            }

            this.isDefaultPrevented = isDefaultPrevented;

            var prop, fixer;
            var len;
            var typeFixerMap = [];
            var props = commonProps.concat();

            // 统一event对象的type
            if (isNative) {
                util.each(typeFixers, function (typeFixer) {
                    if (type.match(typeFixer.reg)) {

                        props = props.concat(typeFixer.props);

                        if (typeFixer.fix) {
                            typeFixerMap.push(typeFixer.fix);
                        }
                    }
                });

                len = props.length;

                // 复制原生事件的属性到事件对象
                while (len) {
                    prop = props[--len];
                    this[prop] = originalEvent[prop];
                }

                len = typeFixerMap.length;

                // fix props
                while (len) {
                    fixer = typeFixerMap[--len];
                    fixer(this, originalEvent);
                }
            }

            if (!self.target && isNative) {
                self.target = originalEvent.srcElement || document; // srcElement might not be defined either
            }

            // check if target is a text node (safari)
            if (self.target && self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            self.timeStamp = originalEvent.timeStamp || util.now();

        },
        preventDefault: function () {
            var self = this,
                e = self.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                // otherwise set the returnValue property of the original event to FALSE (IE)
                e.returnValue = FALSE;
            }

            DomEventObject.superClass.preventDefault.call(self);
        },
        stopPropagation: function() {
            var e = this.originalEvent;
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            else {
                e.cancelBubble = TRUE;
            }

            DomEventObject.superClass.stopPropagation.call(this);
        }
    });


    return DomEventObject;

});