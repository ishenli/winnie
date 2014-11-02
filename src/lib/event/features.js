/**
 * @file file
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('../util');
    var isW3c = document.addEventListener;
    var eventSupport = isW3c ? 'addEventListener' : 'attachEvent';


    var commonProps = util.strToArray(
        'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode ' +
        'relatedTarget shiftKey srcElement target timeStamp type view ' +
        'which propertyName'
    );

    // 浏览器原生事件
    var standardNativeEvents =
        'click dblclick mouseup mousedown contextmenu ' + // mouse buttons
        'mousewheel mousemultiwheel DOMMouseScroll ' + // mouse wheel
        'mouseover mouseout mousemove selectstart selectend ' + // mouse movement
        'keydown keypress keyup ' + // keyboard
        'orientationchange ' + // mobile
        'focus blur change reset select submit ' + // form elements
        'load unload beforeunload resize move DOMContentLoaded ' + // window
        'readystatechange message ' + // window
        'error abort scroll ';// misc

    var nativeEvents = (function (hash, events) {
        events = util.strToArray(events);
        for (var i = 0, len = events.length; i < len; i++) {
            if (events[i]) {
                hash[events[i]] = true;
            }
        }
        return events;
    })({}, standardNativeEvents);

    var mouseProps = util.strToArray('button buttons clientX clientY dataTransfer ' +
    'fromElement offsetX offsetY pageX pageY screenX screenY toElement');

    return {
        commonProps: commonProps,
        isW3c: isW3c,
        eventSupport: eventSupport,
        nativeEvents:nativeEvents
    };
});