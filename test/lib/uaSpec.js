/**
 * @file event test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var ua = require('lib/ua');


    describe('ua', function () {
        it('version',function (){
            var detector = ua;

            expect(detector.browser).toBe('chrome');

//            expect(result).toBe('click done');

        });

    });
});