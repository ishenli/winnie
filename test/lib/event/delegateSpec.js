/**
 * @file delegate
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Dom = require('lib/dom');
    //var Event = require('lib/event');
    var Event = require('bean');
    var $ = require('jquery');
    var async = require('async');
    var tpl = '';

    $.ajax({
        url: './base/test/lib/event/delegate.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });

    beforeEach(function () {
        document.body.appendChild(Dom.create(tpl));
    });

    afterEach(function () {
        Dom.remove('#event-test-data');

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

    describe('delegate', function () {

        /*it('should invoke correctly', function (done) {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            //$('#test-delegate').on('click', '.xx', test);

            Event.on(Dom.get('#test-delegate'), 'click', '.xx', test);
            var a = Dom.get('#test-delegate-a');
            var b = Dom.get('#test-delegate-b');

            // support native dom event
            simulateEvent(a, 'click', {
                which: 1
            });

            async.series([
                waits(1000),
                runs(function() {
                    expect(ret).toEqual([a.id,
                        'test-delegate-inner',
                        'test-delegate-inner',
                        a.id,
                        'test-delegate-outer',
                        'test-delegate-outer'
                    ]);
                }),
                runs(function() {
                    ret = [];
                    // support simulated event
                    //Event.fire(b, 'click');
                    b.click();

                }),
                waits(200),
                runs(function() {
                    expect(ret).toEqual([b.id,
                        'test-delegate-inner',
                        'test-delegate-inner',
                        b.id,
                        'test-delegate-outer',
                        'test-delegate-outer'
                    ]);
                }),
                waits(20),
                runs(function() {
                    Event.off(Dom.get('#test-delegate'), 'click', '.xx', test);
                    //$(b).off('click');
                    ret = [];
                    // support simulated event
                    Event.fire(b, 'click', {
                        which: 1
                    });
                }),
                waits(20),
                runs(function() {
                    expect(ret).toEqual([]);
                })
            ],done);

        });

        it('should stop propagation correctly', function (done) {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
                e.stopPropagation();
            }

            Event.on(Dom.get('#test-delegate'), 'click', '.xx', test);
            var b = Dom.get('#test-delegate-b');

            // support native dom event
            simulateEvent(b, 'click');

            async.series([
                waits(10),
                runs(function () {
                    expect(ret).toEqual([b.id,
                        'test-delegate-inner',
                        'test-delegate-inner'
                    ]);
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([b.id,
                        'test-delegate-inner',
                        'test-delegate-inner'
                    ]);
                }),
                runs(function () {
                    Event.off(Dom.get('#test-delegate'), 'click', '.xx', test);
                    ret = [];
                    // support simulated event
                    Event.fire(b, 'click', {
                        which: 1
                    });
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([]);
                    //var eventDesc = DomEventUtils.data(Dom.get('#test-delegate'), undefined, false);
                    //expect(eventDesc).to.be(undefined);
                })
            ], done);
        },5000);

        it('should prevent default correctly', function (done) {
            var ret = [];

            function test(e) {
                ret.push(e.target.id);
                ret.push(e.currentTarget.id);
                ret.push(this.id);
            }

            Event.on(Dom.get('#test-delegate'), 'click', '.xx', test);
            var a = Dom.get('#test-delegate-b');
            // support native dom event

            Event.fire(a, 'click');

            setTimeout(function () {
                expect(ret + '').toBe([a.id,
                    'test-delegate-inner',
                    'test-delegate-inner',
                    a.id,
                    'test-delegate-outer',
                    'test-delegate-outer'
                ] + '');
                done();
            }, 10);
        });

        it('should undelegate properly', function (done) {
            var d = Dom.create('<div><button>xxxx</button></div>');
            document.body.appendChild(d);
            var s = Dom.get('button', d);
            var ret = [];
            Event.on(d, 'click', function () {
                ret.push(9);
            });
            function t() {
                ret.push(1);
            }

            Event.on(d, 'click', 'button', t);

            simulateEvent(s, 'click');

            async.series([
                waits(10),
                runs(function () {
                    expect(ret).toEqual([9,1]);
                    ret = [];
                }),
                runs(function () {
                    Event.off(d, 'click', 'button', t);
                    simulateEvent(s, 'click');
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([9]);
                }),
                runs(function () {
                    ret = [];
                    Event.on(d, 'click', 'button', t);
                    Event.off(d, 'click', 'button');
                    simulateEvent(s, 'click');
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([9]);
                }),
                runs(function () {
                    ret = [];
                    Event.on(d, 'click', 'button', t);
                    Event.off(d, 'click'); // 移除所有除去委托的事件
                    simulateEvent(s, 'click');
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([1]);
                    Dom.remove(d);
                })
            ], done);
        });*/


        it('delegate events in one dom ', function (done) {

            var ret = [];
            Event.on(Dom.get('#test-delegate'), 'click', 'a', function () {
                ret.push(1);
            });

            Event.on(Dom.get('#test-delegate'), 'mouseover', 'button', function () {
                ret.push(2);
            });

            var a = Dom.get('#test-delegate a');
            var delegate = Dom.get('#test-delegate');
            var b = Dom.get('#test-delegate button');

            simulateEvent(a, 'click');

            async.series([
                waits(10),
                runs(function () {
                    expect(ret).toEqual([1]);
                }),
                runs(function () {
                    simulateEvent(b, 'click');

                    expect(ret).toEqual([1]);
                }),
                waits(10),
                runs(function () {
                    simulateEvent(b, 'mouseover');
                    expect(ret).toEqual([1,2]);
                }),
                runs(function () {
                    Event.off(delegate, 'mouseover', 'button');
                    simulateEvent(a, 'click');
                }),
                waits(10),
                runs(function () {
                    expect(ret).toEqual([1,2,1]);
                })
            ], done);
        });

    });
});