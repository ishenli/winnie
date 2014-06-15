/**
 * @file Validator test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var lib = require('lib');
    var Validator = require('Validator');
    var htmlHelper = require('test/htmlHelper');

    var container;

    beforeEach(function () {
        container = htmlHelper.add(''
            + '<ul class="list" id="test">'
            +   '<li class="list-item" id="liTag">'
            +       '<span>列表内容</span>'
            +   '</li>'
            + '</ul>'
            + '<a id="aTag">'
            +   '<span>标签内容</span>'
            + '</a>'
        );
    });


    describe('validator', function () {
        it('init',function (){
            var testValidator = new Validator({
                element:'test'
            });

            expect(testValidator.type).toEqual('Validator');

            testValidator.items.push('first');

            expect(testValidator.items[0]).toEqual('first');
        });

        it('options get',function (){
            var testValidator = new Validator({
                element:'test'
            });

            expect(
                testValidator.element.id
            ).toEqual('test');
        });

    });
});