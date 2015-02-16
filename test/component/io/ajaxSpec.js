/**
 * @file ajax test
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Ajax = require('component/io/ajax').Ajax;

    describe('ajax', function () {
        beforeEach(function () {
            jasmine.Ajax.install();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });

        it('should exports an Ajax class', function () {
            expect(typeof Ajax).toEqual('function');
        });

        it('should live as a global instance of Ajax class', function () {
            var globalInstance = require('component/io/ajax');
            expect(globalInstance).toBeDefined();
            expect(globalInstance instanceof Ajax).toBe(true);
        });

        it('should be instantiable', function () {
            expect(Ajax).not.toThrow();
        });

        describe('request method', function () {
            var ajax = new Ajax();


            it('should exist', function () {
                expect(typeof ajax.request).toBe('function');
            });

            it('should return a Promise', function () {
                var xhr = ajax.request({url: 'foo'});
                expect(typeof xhr.then).toBe('function');
                jasmine.Ajax.requests.mostRecent().response({status: 200});
            });

            it('should request the remote url with proper HTTP method', function () {
                var get = ajax.request({url: 'foo', method: 'GET', cache: true});
                expect(jasmine.Ajax.requests.mostRecent().url).toBe('foo');
                expect(jasmine.Ajax.requests.mostRecent().method).toBe('GET');
                jasmine.Ajax.requests.mostRecent().response({status: 200});

                var get = ajax.request({url: 'foo', method: 'POST', cache: true});
                expect(jasmine.Ajax.requests.mostRecent().url).toBe('foo');
                expect(jasmine.Ajax.requests.mostRecent().method).toBe('POST');
                jasmine.Ajax.requests.mostRecent().response({status: 200});
            });

            it('should resolve the Promise when remote success', function (done) {
                var loading = ajax.request({url: 'foo'});

                jasmine.Ajax.requests.mostRecent().response({status: 200, responseText: 'bar'});

                loading
                    .then(
                    function (data) {
                        expect(data).toBe('bar');
                    },
                    function (xhr) {
                        throw new Error(xhr.status);
                    }
                )
                    .ensure(done);
            });

            it('should reject the Promise when remote fail', function (done) {
                var loading = ajax.request({url: 'foo'});

                jasmine.Ajax.requests.mostRecent().response({status: 500, responseText: 'bar'});

                loading
                    .fail(function (xhr) {
                        expect(xhr.responseText).toBe('bar');
                        expect(xhr.status).toBe(500);
                    })
                    .ensure(done);
            });

            it('should reject the Promise when timeout', function (done) {
                var loading = ajax.request({url: 'foo', timeout: 8});

                loading
                    .fail(function (xhr) {
                        expect(xhr.status).toBe(408);
                    })
                    .ensure(done);
            });

            it('should parse a json string when dataType is set to "json"', function (done) {
                var loading = ajax.request({url: 'foo', dataType: 'json'});

                jasmine.Ajax.requests.mostRecent().response({status: 200, responseText: '{ "bar": 1 }'});

                loading
                    .then(
                    function (data) {
                        expect(data).toEqual({bar: 1});
                    },
                    function (xhr) {
                        throw new Error(xhr.status);
                    }
                )
                    .ensure(done);
            });

            it('should fire done event when request success', function (done) {
                var handler = jasmine.createSpy('done');
                ajax.on('done', handler);
                var loading = ajax.request({url: 'foo'});

                jasmine.Ajax.requests.mostRecent().response({status: 200});

                loading
                    .then(
                    function () {
                        expect(handler).toHaveBeenCalled();
                        var event = handler.calls.mostRecent().args[0];
                        expect(event).toBeOfType('object');
                        expect(event.xhr).toBe(loading);
                        expect(event.options.url).toBe('foo');
                    },
                    function (xhr) {
                        throw new Error(xhr.status);
                    }
                )
                    .ensure(done);
            });

            it('should fire fail event when request fail', function (done) {
                var handler = jasmine.createSpy('fail');
                ajax.on('fail', handler);
                var loading = ajax.request({url: 'foo'});

                jasmine.Ajax.requests.mostRecent().response({status: 500});

                loading
                    .then(
                    function () {
                        expect(handler).toHaveBeenCalled();
                        var event = handler.calls.mostRecent().args[0];
                        expect(event).toBeOfType('object');
                        expect(event.xhr).toBe(loading);
                        expect(event.options.url).toBe('foo');
                    },
                    function (xhr) {
                        throw new Error(xhr.status);
                    }
                )
                    .ensure(done);
            });

            it('should fire timeout event when request timeout', function (done) {
                var handler = jasmine.createSpy('timeout');
                ajax.on('timeout', handler);
                var loading = ajax.request({url: 'foo', timeout: 1});

                loading
                    .fail(
                    function () {
                        expect(handler).toHaveBeenCalled();
                        var event = handler.calls.mostRecent().args[0];
                        expect(event).toBeOfType('object');
                        expect(event.xhr).toBe(loading);
                        expect(event.options.url).toBe('foo');
                    }
                )
                    .ensure(done);
            });
        });

        describe('hooks', function () {
            var ajax;

            beforeEach(function () {
                ajax = new Ajax();
            });

            it('should be an object', function () {
                expect(typeof ajax.hooks).toBe('object');
            });

            it('should not share between instances', function () {
                var another = new Ajax();
                expect(ajax.hooks).not.toBe(another.hooks);
            });

        });

        describe('serializeData hook', function () {
            var ajax;

            beforeEach(function () {
                ajax = new Ajax();
            });

            it('should be implemented by default', function () {
                expect(typeof  ajax.hooks.serializeData).toBe('function');
            });

            it('should be called for a non-get request', function () {
                spyOn(ajax.hooks, 'serializeData');
                var data = {x: 1};
                var options = {
                    url: 'foo',
                    method: 'POST',
                    contentType: 'application/json',
                    data: data
                };
                var loading = ajax.request(options);

                expect(ajax.hooks.serializeData).toHaveBeenCalled();
                expect(ajax.hooks.serializeData.calls.mostRecent().args.length).toBe(4);
                expect(ajax.hooks.serializeData.calls.mostRecent().args[0]).toBe('');
                expect(ajax.hooks.serializeData.calls.mostRecent().args[1]).toBe(data);
                expect(ajax.hooks.serializeData.calls.mostRecent().args[2]).toBe('application/json');
                expect(ajax.hooks.serializeData.calls.mostRecent().args[3]).toBe(loading);

                jasmine.Ajax.requests.mostRecent().response({status: 200});
            });

            it('should give a default value of contentType parameter', function () {
                ajax.hooks.serializeData = jasmine.createSpy('serializeData');
                var options = {
                    url: 'foo',
                    method: 'POST'
                };
                var loading = ajax.request(options);
                expect(ajax.hooks.serializeData).toHaveBeenCalled();
                expect(ajax.hooks.serializeData.calls.mostRecent().args[2]).toBe('application/x-www-form-urlencoded');

                jasmine.Ajax.requests.mostRecent().response({status: 200});
            });

            it('should correctly serialize a number', function () {
                expect(ajax.hooks.serializeData(1)).toBe('1');
                expect(ajax.hooks.serializeData(1.2)).toBe('1.2');
            });

            it('should correctly serialize a boolean', function () {
                expect(ajax.hooks.serializeData(true)).toBe('true');
                expect(ajax.hooks.serializeData(false)).toBe('false');
            });

            it('should correctly serialize a string and encode it', function () {
                expect(ajax.hooks.serializeData('abc')).toBe('abc');
                expect(ajax.hooks.serializeData('&=_1%234')).toBe(encodeURIComponent('&=_1%234'));
            });

            it('should correctly serialize an array', function () {
                expect(ajax.hooks.serializeData([1, 2, 3])).toBe('1,2,3');
                expect(ajax.hooks.serializeData(['a', '&', '='])).toBe('a,%26,%3D');
            });

            it('should correctly serialize an object', function () {
                var o = {
                    x: 1,
                    y: 'test',
                    z: ['a', '&', 'c']
                };
                expect(ajax.hooks.serializeData(o)).toBe('x=1&y=test&z=a,%26,c');
            });

            it('should correctly serialize a deep object', function () {
                var o = {
                    x: 1,
                    y: {
                        a: 1,
                        b: 'test',
                        c: ['a', '&', 'c']
                    },
                    z: false
                };
                expect(ajax.hooks.serializeData(o)).toBe('x=1&y.a=1&y.b=test&y.c=a,%26,c&z=false');
            });

            it('should serialize null and undefined to an empty string', function () {
                expect(ajax.hooks.serializeData(null)).toBe('');
                expect(ajax.hooks.serializeData(undefined)).toBe('');
                expect(ajax.hooks.serializeData({x: null})).toBe('x=');
            })
        });
    });
});
