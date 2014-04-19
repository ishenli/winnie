/**
 * @file Control test
 * @author shenli
 */
define(function (require) {
    var Control = require('Control');
    var Widget = require('Widget');

    var lib = require('lib');

    describe('Control', function () {

        it('newClass init',function (){

            var instance = new Control();

            expect(instance.type).toEqual('Control');
        });

        it('aspect',function(){
            var item = 1;
            var test =Widget.extend({
                show:function(){
                    console.log(item);
                    return item;
                }
            });

            var intance =  new  test();

            intance.show();

            intance.before('show',function(){
                console.log('before', item);
               item++;
            });

            intance.after('show',function(){
               item++;
                console.log('after', item);
            });

            expect(intance.show()).toEqual(2);

            intance.show();
        });

//        it('元素包含另一个元素',function () {
//            var ul = lib.g('ulTag');
//            var li = lib.g('liTag');
//            expect(lib.dom.contains(ul, li)).toBeTruthy();
//        });

    });
});