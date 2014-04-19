/**
 * @file string test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var lib = require('lib');


    describe('string', function () {
        it('camelCase',function (){

            var test = 'hello-world-boy',
                css = 'margin-right';

            expect(lib.camelCase(test)).toBe('helloWorldBoy');

            expect(lib.camelCase(css)).toBe('marginRight');

        });

    });
});