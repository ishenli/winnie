/**
 * @file mouse test
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var event = require('lib/event/dom/main');
    var util = require('lib/util');
    var dom = require('lib/dom');
    var async = require('async');
    var $ = require('jquery');
    var tpl = '';


    $.ajax({
        url: './base/test/lib/event/mouse.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });

    function waits(ms) {
        return function (next) {
            setTimeout(next, ms);
        };
    }
    function runs(fn) {
        return function (next) {
            if (fn.length) {
                fn(next);
            } else {
                fn();
                next();
            }
        };
    }


    var simulate = function (target, type, relatedTarget) {
        if (typeof target === 'string') {
            target = dom.g(target);
        }
        simulateEvent(target, type, {relatedTarget: relatedTarget || window});
    };

    describe('normal behavior', function () {
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

        it('should trigger the mouseenter event on the proper element', function (done) {
            var outer = dom.get('#outer');
            var inner = dom.get('#inner');
            var container = outer.parentNode;
            var ret = [];
            var outerCount = 0;
            var innerCounter = 0;
            var type = 'mouseover';
            event.on(outer, 'mouseenter', function (e) {
                outerCount++;
                ret.push(e.currentTarget);
            });

            event.on(inner, 'mouseenter', function (e) {
                innerCounter++;
                ret.push(e.currentTarget);

            });

            simulate(outer, type, container);
            simulate(inner, type, outer);
            simulate(inner, type, outer);

            setTimeout(function () {
                expect(outerCount).toBe(1);
                expect(innerCounter).toBe(2);
                expect(ret).toEqual([outer, inner, inner]);
                done();
            }, 100);
        });


        it('should trigger the mouseleave event on the proper element', function (done) {
            var outer = dom.get('#outer');
            var inner = dom.get('#inner');
            var container = outer.parentNode;
            var ret = [];
            var outerCount = 0;
            var innerCounter = 0;
            var type = 'mouseout';
            event.on(outer, 'mouseleave', function (e) {
                outerCount++;
                ret.push(e.currentTarget);
            });

            event.on(inner, 'mouseleave', function (e) {
                innerCounter++;
                ret.push(e.currentTarget);

            });

            // outer -> container
            simulate(inner, type, outer);
            simulate(outer, type, container);
            simulate(outer, type, outer.parentNode);

            setTimeout(function () {
                expect(outerCount).toBe(2);
                expect(innerCounter).toBe(1);
                expect(ret).toEqual([inner,outer,outer]);
                done();
            }, 100);
        });


        it('support multiple on for mouseenter', function (done) {
            var enter = [],
                leave = [],
                mouseTests = dom.query('.mouse-test');

            event.on('.mouse-test', 'mouseenter', function (e) {
                expect(e.type).toBe('mouseenter');
                enter.push(e.target.id);
            });

            event.on('.mouse-test', 'mouseleave', function (e) {
                expect(e.type).toBe('mouseleave');
                leave.push(e.target.id);
            });

            simulate(mouseTests[0], 'mouseover', document);

            async.series([

                waits(10),

                runs(function () {
                    simulate(mouseTests[1], 'mouseover', document);
                }),

                waits(10),

                runs(function () {
                    simulate(mouseTests[0], 'mouseout', document);
                }),

                waits(10),

                runs(function () {
                    simulate(mouseTests[1], 'mouseout', document);
                }),

                waits(10),

                runs(function () {
                    expect(enter).toEqual(['mouse-test1', 'mouse-test2']);
                    expect(leave).toEqual(['mouse-test1', 'mouse-test2']);
                })
            ], done);
        });

    });

    describe('delegate works', function () {

        it("should delegate mouseenter/leave properly", function (done) {
            var t = (+new Date());
            var code = "<div id='d1" + t + "' style='width:500px;height:500px;border:1px solid red;'>" +
                "<div id='d2" + t + "' class='t' style='width:300px;height:300px;margin:150px;border:1px solid green;'>" +
                "<div id='d3" + t + "' style='width:100px;height:100px;margin:150px;border:1px solid black;'>" +
                "</div>" +
                "</div>" +
                "</div>";
            dom.append(document.body, dom.create(code));
            var d1 = dom.get("#d1" + t),
                d2 = dom.get("#d2" + t),
                d3 = dom.get("#d3" + t);

            t = "";
            var type = "";

            event.on(d1, 'mouseenter', '.t', function (e) {
                type = e.type;
                t = e.target.id;
            });

            simulate(d1, 'mouseover', document);

            async.series([

                waits(100),

                runs(function () {
                    expect(t).toBe("");
                    expect(type).toBe("");
                    t = "";
                    type = "";
                    simulate(d2, 'mouseover', d1);
                }),


                waits(100),

                runs(function () {
                    expect(t).toBe(d2.id);
                    expect(type).toBe('mouseenter');
                    t = "";
                    type = "";
                    simulate(d3, 'mouseover', d2);
                }),

                waits(100),

                runs(function () {
                    expect(t).toBe("");
                    expect(type).toBe("");
                    dom.remove(d1);
                })
            ], done);
        });
    });

});