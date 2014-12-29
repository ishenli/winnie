/**
 * @file control
 * @author ishenli （meshenli@gmail.com）
 */

define(function (require) {
    var Control = require('widget/Control');
    var htmlHelper = require('htmlHelper');

    var container;

    describe('Control', function () {

        beforeEach(function () {
            container = htmlHelper.add(''
                + '<div id="test" title="hello"></div>'
            );
        });

        afterEach(function () {
            htmlHelper.remove(container);
        });


        it('newClass init', function () {

            var instance = new Control();

            expect(instance.type).toEqual('Control');
        });

        it('control isEqual', function () {

            expect(Control.isEmptyOption(true)).toBeFalsy();

            var a = '#fff';
            var b = '#000';
            var res = Control.isEqual(a, b);
            expect(res).toBeFalsy();
            var c = true;
            var d = false;
            var r2 = Control.isEqual(c, d);

            expect(r2).toBeFalsy();


        });

        it('change render', function () {
            var Panel = Control.extend({
                options: {
                    element: {
                        value: '#test',
                        readOnly: true
                    },
                    color: '#fff',
                    size: {
                        width: 100,
                        height: 100
                    },
                    x: 200,
                    y: 200,
                    xy: {
                        getter: function () {
                            return this.get('x') + this.get('y')
                        },
                        setter: function (val) {
                            this.set('x', val[0]);
                            this.set('y', val[1]);
                        }
                    }
                },
                initialize: function (config) {
                    Panel.superClass.initialize.call(this, config);
                    this.color = this.get('color');
                },
                _onChangeColor: function (val) {
                    this.color = val;
                }
            });

            var test = new Panel();

            expect(test.get('color')).toEqual('#fff');
            expect(test.color).toEqual('#fff');
            expect(test.get('xy')).toEqual(400);
            test.set('xy', [100, 100]);
            expect(test.get('xy')).toEqual(200);
            test.set('color', '#000');
            expect(test.color).toEqual('#000');
        });

    });

});