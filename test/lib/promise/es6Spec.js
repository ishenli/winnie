/**
 * @file promise test
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Promise = require('lib/promise');

    describe('constructor', function () {
        it('resolve sync works', function (done) {
            var obj = {};
            var promise = new Promise(function (resolve) {
                resolve(obj);
            });
            promise.then(function (ret) {
                expect(ret).toBe(obj);
                done();
            });
        });

        it('reject sync works', function (done) {
            var obj = {};
            var promise = new Promise(function (resolve, reject) {
                reject(obj);
            });
            promise.then(undefined, function (ret) {
                expect(ret).toBe(obj);
                done();
            });
        });

        it('resolve async works', function (done) {
            var obj = {};
            var promise = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(obj);
                }, 100);
            });
            promise.then(function (ret) {
                expect(ret).toBe(obj);
                done();
            });
        });

        it('reject async works', function (done) {
            var obj = {};
            var promise = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    reject(obj);
                }, 100);
            });
            promise.then(undefined, function (ret) {
                expect(ret).toBe(obj);
                done();
            });
        });
        it('catch function parameter', function (done) {
            var obj = {};
            var promise = new Promise(function (resolve, reject) {
                if (1) {
                    throw obj;
                }
                reject(2);
            });
            promise.then(undefined, function (ret) {
                expect(ret).toBe(obj);
                done();
            });
        });
    });

    describe('cast', function () {
        it('cast promise works', function () {
            var defer = new Promise(function (resolve) {
                resolve('qq');
            });
            expect(Promise.cast(defer)).toBe(defer);
        });

        it('cast common obj works', function (done) {
            var obj = {};
            Promise.cast(obj).then(function (obj2) {
                expect(obj).toBe(obj2);
                done();
            });
        });
    });

    describe('resolve', function () {
        it('resolve common obj works', function (done) {
            var obj = {};
            Promise.resolve(obj).then(function (obj2) {
                expect(obj).toBe(obj2);
                done();
            });
        });

        it('reject works', function (done) {
            var error = new Error({});
            Promise.reject(error).then(undefined, function (reason) {
                expect(reason).toBe(error);
                done();
            });
        });
    });


    function createPromises(options) {
        options = options || [{}, {}];
        var res = [];

        options.forEach(function (item) {
            res.push(new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (item.reason) {
                        reject(item.reason);
                    }
                    else {
                        resolve(item.data);
                    }
                }, item.delay || 0);
            }));
        });

        return res;
    }

    describe('all', function () {
        var value = 0;
        beforeEach(function (done) {
            var promises = createPromises();
            Promise.all(promises).then(function () {
                value++;
                done();
            });
        });
        it('that will resolve only once all the items have resolved', function (done) {
            expect(value).toBe(1);
            done();
        });
    });

    describe('all resolve', function () {

        var ret = [];
        beforeEach(function (done) {
            var promises = createPromises([{data: 1, delay: 100}, {data: 2}]);
            Promise.all(promises).then(function (value) {
                ret = value;
                done();
            });
        });
        it('that resolved with a array param has right sequence', function (done) {
            expect(ret).toEqual([1, 2]);
            done();
        });
    });

    describe('all reject', function () {
        var handler;
        beforeEach(function (done) {
            var promises = createPromises([{data: 1}, {reason: 'error'}]);
            handler = jasmine.createSpy('handler');
            Promise.all(promises).then(null, function (reason) {
                handler(reason);
                done();
            });

        });

        it('that will reject if any items is rejected', function (done) {
            expect(handler.calls.count()).toBe(1);
            expect(handler).toHaveBeenCalledWith('error');
            done();
        });
    });
});
