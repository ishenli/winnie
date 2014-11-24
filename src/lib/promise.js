/**
 * @file 实现promise
 * @author zhangkai
 * http://www.html5rocks.com/zh/tutorials/es6/promises/
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * https://promisesaplus.com/
 */
define(function (require) {

    var util = require('./util');

    var setImmediate = require('./promise/setImmediate');

    var STATUS = {
        PENDING: 1,
        FULFILLED: 2,
        REJECTED: 3
    };

    /**
     * 创建一个promise对象，执行executor传入的resolve和reject两个函数
     * @param {Function} executor
     * @returns {Promise}
     * @constructor
     */
    function Promise(executor) {

        if (typeof executor !== 'function') {
            throw  new TypeError('Promise resolver undefined is not a function');
        }

        if (!(this instanceof Promise)) {
            return new Promise();
        }

        this.status = STATUS.PENDING;
        this.value = '';
        this.reason = '';

        this._resolves = [];
        this._rejects = [];

        if (isFn(executor)) {
            executor(util.bind(this.resolve, this), util.bind(this.reject, this));
        }

        this.invoke = setImmediate;

        return this;
    }


    /**
     * Appends fulfillment and rejection handlers to the promise,
     * and returns a new promise resolving to the return value of the called handler
     * @param {Function} onFulFilled
     * @param {Function} onRejected
     * @returns {Promise|*}
     */
    Promise.prototype.then = function (onFulFilled, onRejected) {
        var me = this;
        var promise = new Promise(function (resolve, reject) {
            me._resolves.push(createCallback(resolve, onFulFilled, resolve, reject));
            me._rejects.push(createCallback(reject, onRejected, resolve, reject));
        });

        exec(this);

        return promise;
    };

    Promise.prototype.resolve = function (value) {

        if (STATUS.REJECTED === this.status) {
            throw Error('Illegal call.');
        }

        if (value === this) {
            this.reject(new Error('TypeError'));
            return;
        }

        try {
            // 传入的是一个promise
            var then = getThen(value);
            if (typeof then === 'function') {
                resolvePromise(this, value);
                return;
            }
        }
        catch (e) {
            this.status === STATUS.PENDING && this.reject(e);
        }

        this.status = STATUS.FULFILLED;
        this.value = value;

        this._resolves.length && exec(this);

        return this;
    };

    Promise.prototype.reject = function (reason) {
        if (STATUS.FULFILLED === this.status) throw Error('Illegal call.');

        this.status = STATUS.REJECTED;
        this.reason = reason;

        this._rejects.length && exec(this);

        return this;
    };

    function resolveX(promise, x) {
        if (x === promise) promise.reject(new Error('TypeError'));

        if (x instanceof Promise) return resolvePromise(promise, x);
        else return promise.resolve(x);
    }

    function resolvePromise(promise, promise2) {
        var status = promise2.status;

        if (STATUS.PENDING === status) {
            promise2.then(util.bind(promise.resolve,promise), util.bind(promise.reject,promise));
        }
        if (STATUS.FULFILLED === status) promise.resolve(promise2.value);
        if (STATUS.REJECTED === status) promise.reject(promise2.reason);

        return promise;
    }

    /*function fireQ(promise) {
     var status = promise.status;
     var queue = promise[STATUS.FULFILLED === status ? '_resolves' : '_rejects'];
     var arg = promise[STATUS.FULFILLED === status ? 'value' : 'reason'];
     var fn;
     var x;

     while (fn = queue.shift()) {
     x = fn.call(promise, arg);
     x && resolveX(promise._next, x);
     }

     return promise;
     }*/

    // accept a promises array
    //you know it
    Promise.any = function (promises) {
        var promise = Promise();
        var called;

        each(promises, function (p, i) {
            p.then(function (v) {
                if (!called) {
                    promise.resolve(v);
                    called = true;
                }
            }, function (e) {
                called = true;
                promise.reject(e);
            });
        });

        return promise;
    };

    Promise.all = function (promises) {
        var len = promises.length;
        var promise = Promise();
        var r = [];
        var pending = 0;
        var locked;

        each(promises, function (p, i) {
            p.then(function (v) {
                r[i] = v;
                if (++pending === len && !locked) promise.resolve(r);
            }, function (e) {
                locked = true;
                promise.reject(e);
            });
        });

        return promise;
    };


    function exec(instance) {

        var status = instance.status;

        if (STATUS.PENDING === status) {
            return;
        }

        var callbacks = null;
        var value = null;

        if (STATUS.FULFILLED === status) {
            instance._rejects = [];
            callbacks = instance._resolves;
            value = instance.value;
        }

        if (STATUS.REJECTED === status) {
            instance._resolves = [];
            callbacks = instance._rejects;
            value = instance.reason;
        }


        instance.invoke(function () {
            var callback;
            while (callback = callbacks.shift()) {
                callback(value)
            }
        });
    }

    function createCallback(method, callback, resolve, reject) {
        return function (value) {
            try {
                if (typeof callback === 'function') {
                    value = callback(value);
                    method = resolve;
                }
                method(value);
            }
            catch (e) {
                reject(e);
            }
        };
    }

    // helper
    function getThen(promise) {
        return promise && (typeof promise === 'object' || typeof promise === 'function')
            && promise.then;
    }
    function isFn(fn) {
        return 'function' === util.type(fn);
    }

    function each(arr, iterator) {
        // this is faster then forEach
        for (var i = 0; i < arr.length; i++) {
            iterator(arr[i], i, arr);
        }
    }

    return Promise;
});
