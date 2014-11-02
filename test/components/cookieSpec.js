/**
 * @file Cookie
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Cookie = require('component/cookie');

    describe('cookie', function () {

        if (location.protocol === 'file:') {
            return;
        }

        describe('get', function () {
            document.cookie = '_winnie_test_1=1';
            document.cookie = '_winnie_test_2=';
            document.cookie = '_winnie_test_3=';

            it('should return the cookie value for the given name', function () {
                expect(Cookie.get('_winnie_test_1')).to.be('1');
                expect(Cookie.get('_winnie_test_2')).to.be('');
                expect(Cookie.get('_winnie_test_3')).to.be('');

            });

            it('should return undefined for non-existing name', function () {

                expect(Cookie.get('_winnie_test_none')).to.be(undefined);
                expect(Cookie.get(true)).to.be(undefined);
                expect(Cookie.get({})).to.be(undefined);
                expect(Cookie.get(null)).to.be(undefined);

            });
        });

        describe('set', function () {

            it('should set a cookie with a given name and value', function () {

                Cookie.set('_winnie_test_11', 'xx');
                expect(Cookie.get('_winnie_test_11')).to.be('xx');

                Cookie.set('_winnie_test_12', 'xx', 0);
                expect(Cookie.get('_winnie_test_12')).to.be(undefined);

                Cookie.set('_winnie_test_13', '1', new Date(2099, 1, 1), '', '/');
                Cookie.set('_winnie_test_13', '2', new Date(2099, 1, 1), '', '/');
                expect(Cookie.get('_winnie_test_13')).to.be('2');

                Cookie.remove('_winnie_test_14');
                Cookie.set('_winnie_test_14', '4', 1, document.domain, '/', true);
                expect(Cookie.get('_winnie_test_14')).to.be(undefined);
            });
        });

        describe('remove', function () {

            it('should remove a cookie from the machine', function () {

                Cookie.set('_winnie_test_21', 'xx');
                Cookie.remove('_winnie_test_21');
                expect(Cookie.get('_winnie_test_21')).to.be(undefined);

                Cookie.set('_winnie_test_22', 'xx', new Date(2099, 1, 1), '', '/');
                Cookie.remove('_winnie_test_22', '', '/');
                expect(Cookie.get('_winnie_test_22')).to.be(undefined);

            });
        });
    });
});