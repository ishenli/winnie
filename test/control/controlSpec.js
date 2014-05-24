/**
 * @file Control test
 * @author shenli
 */
define(function (require) {
    var Control = require('widget/Control');
    var Widget = require('widget/Widget');

    var lib = require('lib');

    var htmlHelper = require('test/htmlHelper');

    var container;

    beforeEach(function () {
        container = htmlHelper.add(''
                + '<div id="test" title="hello"></div>'
        );
    });

    describe('Control', function () {

        it('newClass init', function () {

            var instance = new Control();

            expect(instance.type).toEqual('Control');
        });

        it('aspect', function () {
            var item = 1;
            var test = Widget.extend({
                show: function () {
                    console.log(item);
                    return item;
                }
            });

            var instance = new test();

            instance.show();

            instance.before('show', function () {
                console.log('before', item);
                item++;
            });

            instance.after('show', function () {
                item++;
                console.log('after', item);
            });

            expect(instance.show()).toEqual(2);

        });

        it('element init',function () {
            var test = new Widget({
                element: container.query('#test')
            });

            expect(test.element.getAttribute('title')).toEqual('hello');
        });

    });
});