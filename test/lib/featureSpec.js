/**
 * @file feature
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {
    var feature = require('lib/feature');
    var dom = require('lib/dom');


    describe('feature', function () {

        var html;
        var div;
        beforeEach(function () {
            html = '<div style="transform:rotate(7deg);"></div>';
            div = dom.create(html);
            document.body.appendChild(div);
        });

        afterEach(function () {
            dom.remove(div)
        });


        it('getCssVendorInfo', function () {
            var ret1 = feature.getCssVendorInfo('width');
            expect(ret1.propertyName).toEqual('width');

            var ret = feature.getCssVendorInfo('boxSizing');
            expect(ret.propertyName).toEqual('boxSizing');

            var ret2 = feature.getCssVendorInfo('animation');
            expect(ret2.propertyName).toEqual('WebkitAnimation');

        });

        it('detectProperty', function () {
            var ret1 = feature.detectProperty('width');
            expect(ret1).toEqual('width');

            var ret2 = feature.detectProperty('animation');
            expect(ret2).toEqual('-webkit-animation');

            var r3 = feature.detectProperty('animation-name');
            expect(r3).toEqual('-webkit-animation-name');

        });

        it('parseTransform', function () {
            var transform = dom.css(div, 'transform');
            var o = feature.parseTransform(transform);
            expect(o.rotate).toEqual('7deg');
            expect(o.rotate).not.toEqual('0deg');
        });
    });
});