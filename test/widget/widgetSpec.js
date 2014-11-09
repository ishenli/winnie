/**
 * @file widgetSpec
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Widget = require('widget/Widget');
    var dom = require('lib/dom');

    var $ = require('jquery');

    var tpl;

    $.ajax({
        url: './base/test/widget/widget.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });


    describe('Widget', function () {

        var globalVar = {};
        beforeEach(function () {
            document.body.appendChild(dom.create(tpl));
        });

        afterEach(function () {
            dom.remove('#widget-test-data');
            for (var v in globalVar) {
                globalVar[v].dispose();
            }
            globalVar = {}
        });

        var simulate = function (target, type, relatedTarget) {
            if (typeof target === 'string') {
                target = dom.g(target);
            }
            simulateEvent(target, type, {relatedTarget: relatedTarget || window});
        };
        it('aspect', function () {
            var item = 1;
            var test = Widget.extend({
                show: function () {
                    return item;
                }
            });

            var instance = new test();

            instance.show();

            instance.before('show', function () {
                item++;
            });

            instance.after('show', function () {
                item++;
            });

            expect(instance.show()).toEqual(2);
        });

        it('initOptions', function () {
            var div = $('<div id="a"></div>').appendTo(document.body);

            var WidgetA = Widget.extend({
                options: {
                    element: '#default',
                    foo: 'foo',
                    template: '<span></span>',
                    model: {
                        title: 'default title',
                        content: 'default content'
                    }
                }
            });


            var a = new WidgetA({
                element: '#a',
                foo: 'bar',
                template: '<a></a>',
                model: {
                    title: 'title a'
                }
            });

            expect(a.get('foo')).toEqual('bar');
            expect(a.get('template')).toEqual('<a></a>');
            expect(a.get('model').title).toEqual('title a');
            expect(a.element.id).toBe('a');

            div.remove();
        });

        describe('delegateEvents/undelegateEvents', function () {
            var FIRST = '1',
                SECOND = '2';

            it('delegateEvents()', function () {
                var result = [];

                var TestWidget = Widget.extend({
                    element: '#widget-test-data',
                    events: {
                        'click p': 'fn1',
                        'click li': 'fn2'
                    },
                    fn1: function () {
                        result.push(FIRST);
                    },
                    fn2: function () {
                        result.push(SECOND);
                    }
                });

                var testA = new TestWidget();

                var p = dom.get('#widget-test-data p');
                simulate(p, 'click');
                expect(result).toEqual([FIRST]);

                var li = dom.get('#widget-test-data li');

                simulate(li, 'click');

                expect(result).toEqual([FIRST, SECOND]);

                testA.dispose();
            });

            it('delegateEvents(eventsObject)', function () {
                var ret = [];
                var TestWidget = Widget.extend({
                    fn1: function () {
                        ret.push(1);
                    }
                });
                var widget = new TestWidget({
                    template: '<div><p></p><ul><li></li></ul><span></span></div>'
                }).render();

                widget.delegateEvents({
                    'click p': 'fn1',
                    'click span': function () {
                        ret.push(2);
                    }
                });
                var p = dom.get('p', widget.element);
                var span = dom.get('span', widget.element);

                simulate(p, 'click');

                expect(ret).toEqual([1]);

                simulate(span, 'click');

                expect(ret).toEqual([1, 2]);

                widget.dispose();
            });

            it('delegateEvents(element, events, handler)', function () {
                var ret = [];

                var fn1 = function () {
                    ret.push(1);
                };
                var fn2 = function () {
                    ret.push(2);
                };
                var widget = new Widget({
                    template: '<div><p></p><ul><li></li></ul><span></span></div>'
                }).render();

                widget.delegateEvents(widget.element, 'click', fn1);
                widget.delegateEvents(widget.element, 'click p', fn2);

                var p = dom.get('p', widget.element);
                var span = dom.get('span', widget.element);

                simulate(p, 'click');

                expect(ret).toEqual([1, 2]);

                simulate(widget.element, 'click');

                expect(ret).toEqual([1, 2, 1]);

                simulate(p, 'click');

                expect(ret).toEqual([1, 2, 1, 1, 2]);
            });

            it('undelegateEvents()', function () {
                var result = [];
                var TestWidget = Widget.extend({
                    element: '#widget-test-data',
                    events: {
                        'click p': 'fn1',
                        'click li': 'fn2'
                    },
                    fn1: function () {
                        result.push(FIRST);
                    },
                    fn2: function () {
                        result.push(SECOND);
                    }
                });

                var testB = new TestWidget();

                var p = dom.get('#widget-test-data p');
                simulate(p, 'click');
                expect(result).toEqual([FIRST]);

                var li = dom.get('#widget-test-data li');
                simulate(li, 'click');
                expect(result).toEqual([FIRST, SECOND]);

                // 注销所有事件
                testB.undelegateEvents();

                simulate(p, 'click');
                simulate(li, 'click');

                expect(result).toEqual([FIRST, SECOND]);

                testB.dispose();
            });

            it('undelegateEvents(event)', function () {
                var result = [];
                var TestWidget = Widget.extend({
                    element: '#widget-test-data',
                    events: {
                        'click p': 'fn1',
                        'mouseover li': 'fn2'
                    },
                    fn1: function () {
                        result.push(FIRST);
                    },
                    fn2: function () {
                        result.push(SECOND);
                    }
                });

                var testC = new TestWidget();

                var p = dom.get('#widget-test-data p');
                simulate(p, 'click');

                expect(result).toEqual([FIRST]);

                var li = dom.get('#widget-test-data li');

                simulate(li, 'click');

                expect(result).toEqual([FIRST]);

                simulate(li, 'mouseover');

                expect(result).toEqual([FIRST, SECOND]);

                // 注销单一事件
                testC.undelegateEvents('mouseover');

                //simulate(p, 'click');
                simulate(li, 'mouseover');

                expect(result).toEqual([FIRST, SECOND]);


            });


            it('undelegateEvents(element, events)', function() {
                var ret = [];
                var widget = globalVar.widget = new Widget({
                    template: '<div><p></p><ul><li></li></ul><span></span></div>'
                }).render();

                var div = widget.element;
                widget.delegateEvents(div, 'click p', function() {
                    ret.push(1);
                });
                widget.delegateEvents(div, 'click li', function () {
                    ret.push(2);
                });
                widget.delegateEvents(div, 'click span', function () {
                    ret.push(3);
                });

                widget.undelegateEvents(div, 'click li');
                var p = dom.get('p', widget.element);
                var span = dom.get('span', widget.element);
                var li = dom.get('li', widget.element);
                simulate(p, 'click');
                simulate(li, 'click');
                simulate(span, 'click');
                expect(ret).toEqual([1, 3]);

                widget.undelegateEvents(div, 'click');
                simulate(p, 'click');
                simulate(li, 'click');
                simulate(span, 'click');
                expect(ret).toEqual([1, 3]);
            })

        });


        it('events hash can be a function', function () {
            var counter = 0;

            var TestWidget = Widget.extend({

                events: function () {
                    return {
                        'click h3': 'incr',
                        'click p': 'incr'
                    }
                },

                incr: function () {
                    counter++
                }
            });

            var widget = globalVar.widget = new TestWidget({
                template: '<div><h3></h3><p></p></div>'
            }).render();

            var h3 = dom.get('h3', widget.element);

            simulate(h3, 'click');

            expect(counter).toEqual(1);

            counter = 0;

            var p = dom.get('p', widget.element);

            simulate(p, 'click');

            expect(counter).toEqual(1)
        });

        it('the default event target is `this.element`', function () {
            var counter = 0;

            var TestWidget = Widget.extend({

                events: function () {
                    return {
                        'click': 'incr'
                    }
                },

                incr: function () {
                    counter++
                }
            });

            var widget = globalVar.widget = new TestWidget().render();
            simulate(widget.element, 'click');
            expect(counter).toEqual(1)
        });

        it('parentNode is a document fragment', function () {
            var id = 'test' + new Date();
            var divs = dom.create('<div id="' + id + '"></div><div></div>');

            new Widget({
                element: divs,
                parentNode: document.body
            }).render();

            expect(document.getElementById(id).nodeType).toEqual(1);
        });


        it('delegate events inherited from ancestors', function () {
            var counter = 0;

            function incr() {
                counter++
            }

            var A = Widget.extend({
                events: {
                    'click p': incr
                }
            });

            var B = A.extend({
                events: {
                    'click div': incr
                }
            });

            var object = globalVar.object = new B({
                template: '<section><p></p><div></div><span></span></section>',
                events: {
                    'click span': incr
                }
            }).render();

            counter = 0;

            var p = dom.get('p', object.element);
            simulate(p, 'click');
            expect(counter).toEqual(1);

            counter = 0;

            var div = dom.get('div', object.element);
            simulate(div, 'click');
            expect(counter).toEqual(1);

            counter = 0;

            var span = dom.get('span', object.element);
            simulate(span, 'click');
            expect(counter).toEqual(1);

        });

        it('set default options', function () {

            var A = Widget.extend({
                options: {
                    a: 1,
                    b: 1
                },

                _onRenderA: function (val) {
                    this.a = val
                }
            });

            var a = globalVar.a = new A({b: 2});
            expect(a.get('a')).toEqual(1);
            expect(a.get('b')).toEqual(2);
            expect(a.a).toEqual(undefined);

            a.render();
            a.set('a', 3);
            expect(a.a).toEqual(3);
        });

        it('set attribute after render method', function() {
            var r = [], p = [];

            var A = Widget.extend({
                attrs: {
                    a: 1
                },

                _onRenderA: function (val, prev) {
                    r.push(val);
                    p.push(prev);
                }
            });

            var a = globalVar.a = new A({a: 2});
            a.render();
            a.set('a', 3);

            expect(r).toEqual([3]);
            expect(p).toEqual([2]);
        })
    });

});
