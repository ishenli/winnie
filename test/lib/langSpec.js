/**
 * @file lang test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var lang = require('lib/lang');
    var util = require('lib/util');

    describe('deepClone', function () {
        it('简单的对象克隆',function (){
            var testObj = {
                name: 'shenli',
                age: [11, 12],
                work: {
                    company: 'baidu'
                }
            };
            var cloneObj = lang.deepClone(testObj);
            cloneObj.name = 'ishenli';
            cloneObj.work.company = 'taobao';
            expect(cloneObj.age[0]).toEqual(11);
            expect(cloneObj.work.company).toEqual('taobao');
            expect(testObj.work.company).toEqual('baidu');
        });

    });
});