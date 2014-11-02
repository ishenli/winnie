/**
 * @file ua test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var UA = require('component/ua');

    describe('ua', function () {
        if (!UA.ie) {
            it('recoginize webkit', function () {
                var userAgent = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.41 Safari/537.36';
                //var ua = UA.getDescriptorFromUserAgent(userAgent);
                var ua = UA;
                //expect(ua.webkit).toEqual(537.36);
                expect(ua.browser.name).toEqual('chrome');
                expect(window.detector.browser.name).toEqual('chrome');
                expect(ua.chrome).toEqual(38);
                expect(window.detector.chrome).toEqual(38);
            });

            /*it('recoginize xiaomi', function () {
                var userAgent = 'Xiaomi_2013061_TD/V1 Linux/3.4.5 Android/4.2.1 Release/09.18.2013 Browser/AppleWebKit534.30 ' +
                    'Mobile Safari/534.30 MBBMS/2.2 System/Android 4.2.1 XiaoMi/MiuiBrowser/1.0';
                var ua = UA.getDescriptorFromUserAgent(userAgent);
                expect(ua.webkit).toEqual(534.30);
                expect(ua.safari).toEqual(534.30);
            });*/
        }
    });
});