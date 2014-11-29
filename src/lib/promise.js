/**
 * @file 实现promise
 * @author zhangkai
 * http://www.html5rocks.com/zh/tutorials/es6/promises/
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 * https://promisesaplus.com/
 * https://github.com/domenic/promises-unwrapping
 */
define(
    function (require) {

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
            this.invoke = setImmediate;

            if (isFn(executor)) {
                try {
                    executor(util.bind(this.resolve, this), util.bind(this.reject, this));
                } catch (e) {
                    console.error(e.stack || e);
                    this.reject(e);
                }
            }
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

            if (this.status !== STATUS.PENDING) {
                return;
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

        Promise.prototype['catch'] = function (onRejected) {
            return this.then(null, onRejected);
        };

        function resolvePromise(promise, promise2) {
            var status = promise2.status;

            if (STATUS.PENDING === status) {
                promise2.then(util.bind(promise.resolve, promise), util.bind(promise.reject, promise));
            }
            if (STATUS.FULFILLED === status) {
                promise.resolve(promise2.value);
            }
            if (STATUS.REJECTED === status) {
                promise.reject(promise2.reason);
            }

            return promise;
        }

        /**
         * 创建一个 Promise，当且仅当传入数组中的所有 Promise 都肯定之后才肯定，
         * 如果遇到数组中的任何一个 Promise 以否定结束，则抛出否定结果。
         * 每个数组元素都会首先经过 Promise.cast，所以数组可以包含类 Promise 对象或者其他对象。
         * 肯定结果是一个数组，包含传入数组中每个 Promise 的肯定结果（且保持顺序）；
         * 否定结果是传入数组中第一个遇到的否定结果。
         *
         * @static
         * @member Promise
         * @param {Array} promises
         */
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

        /**
         * 创建一个promise，当且仅当数组中的所有的promise肯定之后才肯定
         * 如果遇到数组中任何一个promise否定，则抛出否定结果
         * @param {Array<.Promise>} promises
         * @returns {Promise}
         */
        Promise.all = function (promises) {

            return new Promise(function (resolve, reject) {
                var len = promises.length;
                var r = [];
                var pending = 0;
                var locked;

                if (len === 0) {
                    resolve([]);
                }

                each(promises, function (p, i) {
                    p.then(function (v) {
                        r[i] = v;
                        if (++pending === len && !locked) {
                            resolve(r);
                        }
                    }, function (e) {
                        locked = true;
                        reject(e);
                    });
                });

            });
        };

        /**
         * 将value转为标准的promise对象
         * @param {*} value
         */
        Promise.cast = function(value) {
            // 已经是promise对象了
            if (value && typeof value === 'object' && value.constructor === this) {
                return value;
            }

            return new Promise(function (resolve) {
                resolve(value);
            });
        };

        /**
         * Returns a Promise object that is resolved with the given value.
         * If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
         * adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
         * @param {*} value
         * @returns {Promise}
         */
        Promise.resolve = function(value) {
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        /**
         * Returns a Promise object that is rejected with the given reason.
         * @param {*} reason
         * @returns {Promise}
         */
        Promise.reject = function(reason) {
            return new Promise(function(resolve,reject) {
                reject(reason);
            })
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
