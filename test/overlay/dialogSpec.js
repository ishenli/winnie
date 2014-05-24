/**
 * @file Validator test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var lib = require('lib');
    var  Dialog= require('widget/Widget');
    var htmlHelper = require('test/htmlHelper');

    var container;

    beforeEach(function () {
        container = htmlHelper.add(''
            + '<div id="dialog" title="hello"></div>'
        );
    });


    describe('dialog', function () {

        it('element init',function() {
            var test = new Dialog({
                element:'dialog'
            });

            expect(test.element.getAttribute('title')).toEqual('hello');
        });

    });
});