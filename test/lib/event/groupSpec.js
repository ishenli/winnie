/**
 * @file 分组事件测试
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var Dom = require('lib/dom');
    var Event = require('lib/event/domEvent');
    var util = require('lib/util');
    var $ = require('jquery');
    /*jshint quotmark:false*/
    var
// simulate mouse event on any element
        simulate = function (target, type, relatedTarget) {
            target = Dom.get(target);
            simulateEvent(target, type, { relatedTarget: relatedTarget });
        };

    describe("native event group", function () {
        describe("native fire", function () {
            var t;

            beforeEach(function () {
                t = $("<div id='d-event-group'><div id='c-event-group'>click</div></div>").appendTo(document.body);
            });

            afterEach(function () {
                t.remove();
            });

            it("should works with one group simply", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                // 只删去属于 two 组的 click handler
                Event.detach(g[0],"click.two");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([3]);
                    done();
                },100);
            });

            it("should works with multiple events", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });

                Event.detach(g[0],"click.two");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([3]);
                    done();
                },100);
            });

            it("should works with multiple events when remove", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除 two 组和 one 组 的 click handler
                Event.detach(g[0],"click.two click.one");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([3]);
                    done();
                },100);
            });

            it("should works with multiple events and no type when remove", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除所有事件的 two 组和 one 组
                Event.detach(g[0],".two .one");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([3]);
                    done();
                },100);
            });

            it("should works with multiple events and groups by simulate", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除既属于 two 组又属于 one 组的所有事件的 handler
                Event.detach(g[0],".two.one");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([1, 3]);
                    done();
                },100);
            });

            it("should works multiple groups", function (done) {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });

                Event.detach(g[0],"click.one");
                simulate(g[0], 'click');
                setTimeout(function () {
                    expect(ret).toEqual([2, 3]);
                    done();
                },100);
            });

        });

        describe("fire manually", function () {
            var t;

            beforeEach(function () {
                t = $("<div id='d-event-group'><div id='c-event-group'>click</div></div>").appendTo(document.body);
            });

            afterEach(function () {
                t.remove();
            });

            it("should works with one group simply", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                // 只删去属于 two 组的 click handler
                Event.detach(g[0],"click.two");
                Event.fire(g[0],'click');
                    expect(ret).toEqual([3]);
            });

            it("should fire", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                Event.fire(g[0],'click');
                expect(ret).toEqual([1, 2, 3]);

            });

            it("should fire at specified groups 1", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                // 触发第二组事件
                Event.fire(g[0],"click.two");
                expect(ret).toEqual([1, 2]);
            });

            it("should fire at specified groups 2", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                // 触发第一组的事件
                Event.fire(g[0],"click.one");
                expect(ret).toEqual([1]);
            });

            it("should fire at specified groups 3", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                // 同时属于 one 和 two 组
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });
                Event.on(g[0],'click.one', function () {
                    ret.push(3);
                });
                // 触发同时属于 one 和 two 组的 handler
                Event.fire(g[0],"click.one.two");
                expect(ret).toEqual([1]);
            });

            it("should works with multiple events", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });

                Event.detach(g[0],"click.two");
                Event.fire(g[0],'click');
                setTimeout(function () {
                    expect(ret).toEqual([3]);
                },10);
            });

            it("should works with multiple events when remove", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除 two 组和 one 组 的 click handler
                Event.detach(g[0],"click.two click.one");
                Event.fire(g[0],'click');
                    expect(ret).toEqual([3]);
            });

            it("should works with multiple events and no type when remove", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除所有事件的 two 组和 one 组
                Event.detach(g[0],".two .one");
                Event.fire(g[0],'click');
                expect(ret).toEqual([3]);
            });

            it("should works with multiple events and groups by fire", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two click.two", function (e) {
                    expect(e.type).toBe('click');
                    ret.push(1);
                });
                // 删除既属于 two 组又属于 one 组的所有事件的 handler
                Event.detach(g[0],".two.one");
                Event.fire(g[0],'click');
                expect(ret).toEqual([1, 3]);
            });

            it("should works multiple groups", function () {
                var g = t.find("#c-event-group"),
                    ret = [];
                Event.on(t[0],'click', function () {
                    ret.push(3);
                });
                Event.on(g[0],"click.one.two", function () {
                    ret.push(1);
                });
                Event.on(g[0],'click.two', function () {
                    ret.push(2);
                });

                Event.detach(g[0],"click.one");
                Event.fire(g[0],'click');
                expect(ret).toEqual([2, 3]);
            });
        });
    });
});