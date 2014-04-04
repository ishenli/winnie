/**
 * @file file
 * @author shenli
 */
define(function (require) {
    var Control = require('Control');
    var lib = require('lib');

    describe('Control', function () {

        it('newClass init',function (){
//            function Widget(){}
//
//            lib.inherit(Widget, Control);

            var instance = new Control();

            expect(instance.type).toEqual('Control');
        });

//        it('元素包含另一个元素',function () {
//            var ul = lib.g('ulTag');
//            var li = lib.g('liTag');
//            expect(lib.dom.contains(ul, li)).toBeTruthy();
//        });

    });
});