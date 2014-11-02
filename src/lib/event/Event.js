/**
 * @file 事件对象
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var util = require('../util');
    var features = require('./features');

    var commonProps = features.commonProps;

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

    /**
     * 自定义事件对象
     * @param {Event} originalEvent
     * @param {HTMLElement} element
     * @param {boolean} isNative
     * @constructor
     */
    function Event(originalEvent, element, isNative) {

        if (!arguments.length || !originalEvent) {
            return;
        }

        this.originalEvent = originalEvent;
        this.isNative = isNative;

        var type = originalEvent.type;

        var target = originalEvent.target || originalEvent.srcElement;

        var prop, fixer;
        var len;
        var typeFixerMap = [];
        var props = commonProps.concat();

        this.target = (target && target.nodeType === 3) // 文本节点
            ? target.parentNode
            : target;

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
    }

    Event.prototype.preventDefault = function () {
        if (this.originalEvent.preventDefault) {
            this.originalEvent.preventDefault();
        }
        else {
            this.originalEvent.returnValue = false;
        }
    };

    Event.prototype.stopPropagation = function () {
        if (this.originalEvent.stopPropagation) {
            this.originalEvent.stopPropagation();
        }
        else {
            this.originalEvent.cancelBubble = true;
        }
    };

    Event.prototype.stop = function () {
        this.preventDefault();
        this.stopPropagation();
        this.stopped = true;
    };

    // stopImmediatePropagation() has to be handled internally
    // because we manage the event list for each element
    // note that originalElement may be a Bean#Event object in some situations
    Event.prototype.stopImmediatePropagation = function () {
        if (this.originalEvent.stopImmediatePropagation) {
            this.originalEvent.stopImmediatePropagation();
        }
        this.isImmediatePropagationStopped = function () {
            return true;
        };
    };
    Event.prototype.isImmediatePropagationStopped = function () {
        return this.originalEvent.isImmediatePropagationStopped
            && this.originalEvent.isImmediatePropagationStopped();
    };
    Event.prototype.clone = function (currentTarget) {
        // TODO: this is ripe for optimisation, new events are *expensive*
        // improving this will speed up delegated events
        var ne = new Event(this, this.element, this.isNative);
        ne.currentTarget = currentTarget;
        return ne;
    };

    return Event;
});