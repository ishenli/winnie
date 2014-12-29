/**
 * @file fire
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Event = require('lib/event/dom/main');
    var domEventObserverCache = require('lib/event/dom/DomEventObserverCache');
    var util = require('lib/util');
    var dom = require('lib/dom');

    var $ = require('jquery');
    var tpl = '';

    function isFunction(v) {
        return typeof v === 'function';
    }

    $.ajax({
        url: './base/test/lib/event/event.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });

    describe('event fire', function () {
        var doc = document,
            HAPPENED = 'happened',
            FIRST = '1',
            SECOND = '2',
            SEP = '-';
        // simulate mouse event on any element


        beforeEach(function () {
            document.body.appendChild(dom.create(tpl));
        });

        afterEach(function () {
            dom.remove('#event-test-data');
        });

        it('normal fire', function () {
            var n = dom.create('<div/>');
            var ret;

            Event.on(n, 'click', function (e) {
                    ret = 1;
            });

            Event.fire(n, 'click');

            expect(ret).toBe(1);

            expect(domEventObserverCache.getDomEventCache(n)).toBe(undefined);
        });

        it('support once', function () {
            var n = dom.create('<div/>');
            var ret;

            Event.on(n, 'mouseenter', {
                fn: function (e) {
                    expect(e.type).toBe('mouseenter');
                    ret = 1;
                },
                once: 1
            });

            Event.fire(n, 'mouseenter', {
                relatedTarget: document
            });

            expect(ret).toBe(1);

            expect(domEventObserverCache.getDomEventCacheHolder(n)).toBe(undefined);
        });

    });
});