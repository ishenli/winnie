/**
 * @file util
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('lib/util');

    var host = typeof window !== undefined ? window : '';
    if (!host) {
        return;
    }
    var doc = host.document;
    var web = host.setInterval;

    function fn() {
    }

    function Fn() {
    }


    describe('util', function () {

        it('util.indexOf', function () {
            var a;

            expect(util.indexOf(6, [1, 2, 3, 4, 5])).toEqual(-1);
            expect(util.indexOf(2, [1, 2, 3, 4, 5])).toEqual(1);
            expect(util.indexOf(2, [1, 2, 3, 4, 5], 1)).toEqual(1);
            expect(util.indexOf(2, [1, 2, 3, 4, 5], 2)).toEqual(-1);

            expect(util.indexOf(a, [1, 2, 3, 4, undefined])).toEqual(4);
            expect(util.indexOf({}, [1, 2, 3, 4, undefined])).toEqual(-1);
        });

        it('util.type', function () {
            expect(util.type(null)).toEqual('null');

            expect(util.type(undefined)).toEqual('undefined');
            expect(util.type()).toEqual('undefined');

            expect(util.type(true)).toEqual('boolean');
            expect(util.type(false)).toEqual('boolean');
            expect(util.type(Boolean(true))).toEqual('boolean');

            expect(util.type(1)).toEqual('number');
            expect(util.type(0)).toEqual('number');
            expect(util.type(Number(1))).toEqual('number');

            expect(util.type('')).toEqual('string');
            expect(util.type('a')).toEqual('string');
            expect(util.type(String('a'))).toEqual('string');

            expect(util.type({})).toEqual('object');

            expect(util.type(/foo/)).toEqual('regexp');
            expect(util.type(new RegExp('asdf'))).toEqual('regexp');

            expect(util.type([1])).toEqual('array');

            expect(util.type(new Date())).toEqual('date');

            expect(util.type(function () {
            })).toEqual('function');
            expect(util.type(fn)).toEqual('function');

            expect(util.type(host)).toEqual('object');

            if (web) {
                expect(util.type(doc)).toEqual('object');
                expect(util.type(doc.body)).toEqual('object');
                expect(util.type(doc.createTextNode('foo'))).toEqual('object');
                expect(util.type(doc.getElementsByTagName('*'))).toEqual('object');
            }
        });

        it('util.isArray', function () {
            expect(util.isArray([])).toEqual(true);

            expect(util.isArray()).toEqual(false);
            expect(util.isArray(arguments)).toEqual(false);

            if (web) {
                expect(util.isArray(doc.getElementsByTagName('*'))).toEqual(false);
            }

            // use native if possible
            if (Array.isArray) {
                expect(util.isArray).toEqual(Array.isArray);
            }
        });

        it('util.isDate', function () {
            expect(util.isDate(new Date())).toEqual(true);
            expect(util.isDate('2010/12/5')).toEqual(false);
        });

        it('util.isRegExp', function () {
            expect(util.isRegExp(/s/)).toEqual(true);
            expect(util.isRegExp(new RegExp('asdf'))).toEqual(true);
        });

        it('util.isObject', function () {
            expect(util.isObject({})).toEqual(true);
            expect(util.isObject(new Fn())).toEqual(true);
            expect(util.isObject(host)).toEqual(true);

            expect(util.isObject()).toEqual(false);
            expect(util.isObject(null)).toEqual(false);
            expect(util.isObject(1)).toEqual(false);
            expect(util.isObject('a')).toEqual(false);
            expect(util.isObject(true)).toEqual(false);
        });

        it('util.isEmptyObject', function () {
            expect(util.isEmptyObject({})).toEqual(true);

            expect(util.isEmptyObject({a: 1})).toEqual(false);
            expect(util.isEmptyObject([])).toEqual(true);

            // Failed in Safari/Opera
            //expect(util.isEmptyObject(fn)).toEqual(true);
        });

        it('util.isPlainObject', function () {
            // The use case that we want to match
            expect(util.isPlainObject({})).toEqual(true);

            expect(util.isPlainObject(new Fn())).toEqual(false);

            // Not objects shouldn't be matched
            expect(util.isPlainObject('')).toEqual(false);
            expect(util.isPlainObject(0)).toEqual(false);
            expect(util.isPlainObject(1)).toEqual(false);
            expect(util.isPlainObject(true)).toEqual(false);
            expect(util.isPlainObject(null)).toEqual(false);
            expect(util.isPlainObject(undefined)).toEqual(false);
            expect(util.isPlainObject([])).toEqual(false);
            expect(util.isPlainObject(new Date())).toEqual(false);
            expect(util.isPlainObject(fn)).toEqual(false);

            // Dom Element
            if (web) {
                expect(util.isPlainObject(doc.createElement('div'))).toEqual(false);
            }


            function X() {
            }

            expect(util.isPlainObject(new X())).toEqual(false);
            function Y() {
                this.x = 1;
            }

            Y.prototype.z = util.noop;
            expect(util.isPlainObject(new Y())).toEqual(false);

            // Host
            expect(util.isPlainObject(host)).toEqual(false);
        });

        it('util.each', function () {
            var ret = 0;

            util.each([1, 2, 3, 4, 5], function (num) {
                ret += num;
            });

            expect(ret).toEqual(15);

            // test context
            util.each([1], function () {
                expect(this).toEqual(host);
            });
        });


        it('camelCase', function () {

            var test = 'hello-world-boy',
                css = 'margin-right';

            expect(util.camelCase(test)).toBe('helloWorldBoy');

            expect(util.camelCase(css)).toBe('marginRight');

        });
    });
});