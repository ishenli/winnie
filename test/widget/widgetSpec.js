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


            it('undelegateEvents(element, events)', function () {
                var ret = [];
                var widget = globalVar.widget = new Widget({
                    template: '<div><p></p><ul><li></li></ul><span></span></div>'
                }).render();

                var div = widget.element;
                widget.delegateEvents(div, 'click p', function () {
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
            expect(a.a).toEqual(1);
        });

        it('set attribute after render method', function () {
            var r = [], p = [];

            var A = Widget.extend({
                options: {
                    a: 1
                },

                _onRenderA: function (val, prev) {
                    r.push(val);
                    p.push(prev);
                }
            });

            var a = globalVar.a = new A({a: 2});
            a.set('a', 3);
            a.render();

            expect(r.join()).toEqual('3');
            expect(p.join()).toEqual('')
        });

        it('call render() after first render', function () {
            var counter = 0;

            function incr() {
                counter++
            }

            var A = Widget.extend({
                options: {
                    a: 1
                },

                _onRenderA: incr
            });

            var a = globalVar.a = new A();
            a.render();
            expect(counter).toEqual(1);

            a.render();
            expect(counter).toEqual(1);
        });


        it('inherited options', function () {

            var A = Widget.extend({
                options: {
                    a: '',
                    b: null
                }
            });

            var B = A.extend({
                options: {
                    a: '1'
                }
            });

            var C = B.extend({
                options: {
                    a: '2',
                    b: 'b'
                }
            });

            var c = globalVar.c = new C();

            expect(c.get('a')).toEqual('2');
            expect(c.get('b')).toEqual('b');
        });

        it('override object in prototype', function () {

            var B = Widget.extend({
                o: {p1: '1'}
            });

            var C = B.extend({
                o: {p2: '2'}
            });

            var c = globalVar.c = new C();
            expect(c.o.p1).toEqual(undefined);
            expect(c.o.p2).toEqual('2');
        });

        it('mix events object in prototype', function () {

            var B = Widget.extend({
                events: {p1: '1'}
            });

            var C = B.extend({
                events: {p2: '2'}
            });

            var c = globalVar.c = new C();
            expect(c.events.p1).toEqual('1');
            expect(c.events.p2).toEqual('2');
        });

        it('dispose', function () {

            var A = new Widget({
                template: '<div id="dispose"><a></a></div>'
            }).render();

            expect(A.element).toEqual(dom.get('#dispose'));

            debugger;
            A.dispose();
            expect(dom.get('#dispose')).toBe(null);
            expect(A.element).toBe(null);
        });

        it('dispose is called twice', function () {

            var A = new Widget({
                template: '<div id="dispose"><a></a></div>'
            }).render();

            expect(function () {
                A.dispose();
                A.dispose();
            }).not.toThrow()
        });

        it('dispose once', function () {
            var calledA = 0, calledB = 0;
            var A = Widget.extend({
                dispose: function () {
                    calledA++;
                    A.superClass.dispose.call(this)
                }
            });

            var B = A.extend({
                dispose: function () {
                    calledB++;
                    B.superClass.dispose.call(this)
                }
            });

            var c = new B().render();
            c.dispose();
            c.dispose();

            expect(calledA).toBe(1);
            expect(calledB).toBe(1)
        });
        it('style attribute', function () {
            var A = new Widget({
                style: {
                    padding: '1px'
                },
                template: '<div id="dispose"><a></a></div>'
            }).render();

            expect(dom.getStyle(A.element, 'paddingTop')).toBe('1px')
        });

        it('options change callback', function () {
            var spy = jasmine.createSpy('spy');

            var Test = Widget.extend({
                options: {
                    a: 1
                },
                _onChangeA: spy
            });

            var test = new Test();
            test.set('a', 2);
            expect(spy.calls.count()).toBe(1);
        });

        it('set call onRender', function () {
            var spy = jasmine.createSpy('spy');
            var A = Widget.extend({
                options: {
                    a: 1
                },
                _onRenderA: spy
            });

            var a = new A();

            a.render();
            expect(spy.calls.count()).toBe(1);

            a.set('a', 2);
            expect(spy.calls.count()).toBe(2);
        });

    });


});
