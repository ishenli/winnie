/**
 * @file Validator test
 * @author shenli <meshenli@gmail.com>
 */
define(function (require) {

    var lib = require('lib');
    var Validator = require('Validator');
    var htmlHelper = require('test/htmlHelper');

    describe('validator', function () {
        it('init', function () {
            var testValidator = new Validator({
                element: 'test'
            });

            expect(testValidator.type).toEqual('Validator');

            testValidator.items.push('first');

            expect(testValidator.items[0]).toEqual('first');
        });

        it('options get', function () {
            var testValidator = new Validator({
                element: 'test'
            });

            expect(
                testValidator.element.id
            ).toEqual('test');
        });

    });
});