/**
 * @file event test
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var DomEvent = require('lib/event');
    var util = require('lib/util');
    var dom = require('lib/dom');
    var Dom = require('lib/dom');
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

    describe('event', function () {
        var doc = document,
            HAPPENED = 'happened',
            FIRST = '1',
            SECOND = '2',
            SEP = '-',
        // simulate mouse event on any element
            simulate = function (target, type, relatedTarget) {
                if (typeof target === 'string') {
                    target = dom.g(target);
                }
                simulateEvent(target, type, {relatedTarget: relatedTarget || window});
            };

        beforeEach(function () {
            document.body.appendChild(dom.create(tpl));
        });

        afterEach(function () {
            dom.remove('#event-test-data');
        });

        describe('add event', function () {
            it('should execute in order.', function (done) {
                var a = Dom.g('#link-a');
                var result = [];
                DomEvent.on(a, 'click', function () {
                    result.push(FIRST);
                });

                DomEvent.on(a, 'click', function () {
                    result.push(SECOND);
                });

                // click a
                result = [];
                simulate(a, 'click');
                expect(result.join(SEP)).toEqual([FIRST, SECOND].join(SEP));
                DomEvent.off(a);
                done();
            });
        });

        describe('remove event', function () {

            it('should remove the specified event handler function.', function (done) {
                var f = Dom.get('#link-f');
                var result = [];

                function foo() {
                    result = HAPPENED;
                }

                //$(f).on('click', foo);
                //$(f).on('click', foo);
                //$(f).off('click', foo);
                DomEvent.on(f, 'click', foo);
                //
                DomEvent.on(f, 'click', foo);
                //
                DomEvent.off(f, 'click', foo);

                // click f
                result = null;
                simulate(f, 'click');
                setTimeout(function () {
                    expect(result).toBe(null);
                    done();
                }, 0);
            });



           it('should remove all the event handlers of the specified event type.', function (done) {
                var g = Dom.get('#link-g');
                var result = [];
                DomEvent.on(g, 'click', function () {
                    result.push(FIRST);
                });
                DomEvent.on(g, 'click', function () {
                    result.push(SECOND);
                });

                DomEvent.remove(g, 'click');

                // click g
                result = [];
                simulate(g, 'click');
                setTimeout(function () {
                    expect(result.join(SEP)).toEqual([].join(SEP));
                    done();
                }, 0);
            });

            it('should remove all the event handler of the specified element', function (done) {
                var h = Dom.get('#link-h');

                var result = [];

                DomEvent.on(h, 'click', function () {
                    result.push(FIRST);
                });

                DomEvent.on(h, 'click', function () {
                    result.push(SECOND);
                });

                DomEvent.remove(h);

                // click h
                result = [];
                simulate(h, 'click');
                setTimeout(function () {
                    expect(result.join(SEP)).toEqual([].join(SEP));
                    done();
                }, 0);
            });
        });

        describe('event handler context', function () {

            it('should treat the element itself as the context.', function () {

                var foo = Dom.get('#foo');

                DomEvent.on(foo, 'click', function () {
                    expect(this).toBe(foo);
                });

                // click foo
                simulate(foo, 'click');
            });

            it('should support using custom object as the context.', function () {

                var bar = Dom.get('#bar'),
                    TEST = {
                        foo: 'only for tesing'
                    };

                DomEvent.on(bar, 'click', function () {
                    expect(this).toBe(TEST);
                }, TEST);
            });

            it('should guarantee separate event adding function keeps separate args.', function (done) {
                DomEvent.on(doc, 'click', handler, {id: FIRST});
                DomEvent.on(doc, 'click', handler, {id: SECOND});
                var result = [];

                function handler(e,args) {
                    result.push(args.id);
                }

                // click the document twice
                simulate(doc, 'click');
                simulate(doc, 'click');

                expect(result[1]).not.toEqual(result[2]);
                done();
            });

        });
    });
});