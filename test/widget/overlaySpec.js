/**
 * @file Overlay test
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var Overlay = require('widget/Overlay');
    var Position = require('widget/Position');
    var lib = require('lib');
    var $ = require('jquery');

    describe('overlay', function () {

        var overlay;

        beforeEach(function () {
            overlay = new Overlay({
                template: '<div></div>',
                width: 120,
                height: 110,
                zIndex: 90,
                id: 'overlay',
                className: 'ui-overlay',
                visible: false,
                style: {
                    color: '#e80',
                    backgroundColor: 'green',
                    paddingLeft: '11px',
                    fontSize: '13px'
                },
                align: {
                    selfXY: [0, 0],
                    baseElement: document.body,
                    baseXY: [100, 100]
                }
            });
            overlay.render();
        });

        afterEach(function () {
            if (overlay && overlay.element) {
                overlay.hide();
                overlay.dispose();
            }
        });

        it('基本属性', function () {
            expect(overlay.element.id).toEqual('overlay');
            expect(lib.hasClass(overlay.element, 'ui-overlay')).toEqual(true);
            expect(lib.getStyle(overlay.element, 'width')).toEqual('120px');
            expect(lib.getStyle(overlay.element, 'height')).toEqual('110px');
            expect(parseInt(overlay.element.style.zIndex)).toEqual(90);
            expect(overlay.get('visible')).toEqual(false);
            expect(['#e80', 'rgb(238, 136, 0)']).toContain(lib.getStyle(overlay.element, 'color'));
            expect(['green', 'rgb(0, 128, 0)']).toContain(lib.getStyle(overlay.element, 'background-color'));
            expect(lib.getStyle(overlay.element, 'padding-left')).toEqual('11px');
            expect(lib.getStyle(overlay.element, 'font-size')).toEqual('13px');
            expect(lib.getStyle(overlay.element, 'position')).toEqual('absolute');
        });

        it('align 设置', function () {
            expect(overlay.get('align').selfXY[0]).toEqual(0);
            expect(overlay.get('align').selfXY[1]).toEqual(0);
            expect(overlay.get('align').baseElement).toEqual(document.body);
            expect(overlay.get('align').baseXY[0]).toEqual(100);
            expect(overlay.get('align').baseXY[1]).toEqual(100);
        });

        it('align 默认', function () {
            overlay.hide().dispose();
            overlay = new Overlay({
                template: '<div></div>'
            }).render();
            expect(overlay.get('align').selfXY[0]).toEqual(0);
            expect(overlay.get('align').selfXY[1]).toEqual(0);
            expect(overlay.get('align').baseElement._id).toEqual('VIEWPORT');
            expect(overlay.get('align').baseXY[0]).toEqual(0);
            expect(overlay.get('align').baseXY[1]).toEqual(0);
        });

        it('设置属性', function () {
            overlay.set('style', {
                backgroundColor: 'red'
            });
            overlay.set('width', 300);
            overlay.set('height', 400);
            overlay.set('zIndex', 101);
            overlay.set('id', 'myid');
            overlay.set('className', 'myclass');
            overlay.set('visible', true);

            expect(lib.getStyle(overlay.element, 'width')).toEqual('300px');
            expect(lib.getStyle(overlay.element, 'height')).toEqual('400px');
            expect(parseInt(overlay.element.style.zIndex)).toEqual(101);
            expect(['red', 'rgb(255, 0, 0)']).toContain(lib.getStyle(overlay.element, 'background-color'));
            expect(overlay.element.id).toEqual('myid');
            expect(lib.hasClass(overlay.element, 'myclass')).toEqual(true);
            //expect(overlay.element.is(':hidden')).toEqual(false);
        });

        it('显示隐藏', function () {
            overlay.show();
            expect(overlay.get('visible')).toEqual(true);
            expect(lib.isShow(overlay.element)).toEqual(true);

            overlay.hide();
            expect(overlay.get('visible')).toEqual(false);
            expect(lib.isShow(overlay.element)).toEqual(false);
        });

        it('Overlay.allOverlays', function () {
            overlay.hide().dispose();
            var num = Overlay.allOverlays.length;

            overlay = new Overlay();
            expect(Overlay.allOverlays.length).toBe(num + 1);
            expect(Overlay.allOverlays[num]).toBe(overlay);
            overlay.dispose();
            expect(Overlay.allOverlays.length).toBe(num);
        });

        it('Overlay.blurOverlays', function () {
            overlay.hide().dispose();
            var num = Overlay.blurOverlays.length;
            overlay = new Overlay();
            overlay.blurHide();
            expect(Overlay.blurOverlays.length).toBe(num + 1);
            expect(Overlay.blurOverlays[num]).toBe(overlay);
            overlay.dispose();
            expect(Overlay.blurOverlays.length).toBe(num);
        });

        it('setPosition', function (done) {
            overlay.hide().dispose();
            overlay = new Overlay();
            spyOn(overlay, '_setPosition');
            expect(overlay._setPosition).not.toHaveBeenCalled();

            overlay.render();
            expect(overlay._setPosition.calls.count()).toBe(1);
            overlay.show();
            expect(overlay._setPosition.calls.count()).toBe(2);
            setTimeout(function () {
                expect(overlay._setPosition.calls.count()).toBe(2);
                done();
            }, 100);
        });

        it('set align to null', function () {
            overlay.hide().dispose();
            overlay = new Overlay({
                align: null
            });
            spyOn(Position, 'pin');
            overlay.show();
            expect(Position.pin).not.toHaveBeenCalled();
        });

        it("隐藏元素的 Overlay", function () {
            overlay.hide().dispose();
            var element = $('<div style="display: none;">我是看不见的 Overlay</div>').appendTo("body");
            overlay = new Overlay({
                element: element[0],
                //template: '<div style="display: none;">我是看不见的 Overlay</div>',
                width: 120,
                height: 110,
                align: {
                    selfXY: [0, 0],
                    baseXY: [100, 100]
                }
            }).render();
            expect(overlay.get('visible')).toEqual(false);
            overlay.show();
            expect(lib.getPosition(overlay.element).left).toEqual(100);
            expect(lib.getPosition(overlay.element).top).toEqual(100);
        });

        it("_blurHide", function () {
            overlay.hide().dispose();

            var testPopup = Overlay.extend({
                options: {
                    trigger: null
                },
                init: function () {
                    var that = this;
                    testPopup.superClass.init.call(this);
                    $(this.get('trigger')).click(function () {
                        that.show();
                    });
                    this.blurHide(this.get('trigger'));
                }
            });
            overlay = new testPopup({
                trigger: $("<a >点击我</a>").appendTo("body"),
                template: '<div>我是 Overlay</div>'
            });

            overlay.get("trigger").click();

            expect(overlay.get("visible")).toEqual(true);

            spyOn(overlay, 'hide');

            overlay.set("visible", false);

            $("body").click();
            expect(overlay.hide).not.toHaveBeenCalled();

            overlay.set("visible", true);
            $("body").click();
            expect(overlay.hide.calls.count()).toBe(1);
            overlay.get("trigger").off().remove();
        });
    });
});
