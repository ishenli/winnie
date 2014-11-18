/**
 * @file 实现promise
 * @author zhangkai
 */
define(function (require) {

    var util = require('./util/object');

    function Promise(resolver){
        if(!(this instanceof Promise))return new Promise();

        this.status = 'pending';
        this.value  ='';
        this.reason ='';

        this._resolves = [];
        this._rejects = [];

        if(isFn(resolver)) resolver(this.resolve.bind(this), this.reject.bind(this));

        return this;
    }

    Promise.prototype.then = function(resolve,reject){
        var next = this._next || (this._next = Promise());
        var status = this.status;
        var x;

        if('pending' === status) {
            isFn(resolve) && this._resolves.push(resolve);
            isFn(reject) && this._rejects.push(reject);
            return next;
        }

        if('resolved' === status) {
            if(!isFn(resolve)) {
                next.resolve(resolve);
            } else {
                try {
                    x = resolve(this.value);
                    resolveX(next, x);
                } catch(e) {
                    this.reject(e);
                }
            }
            return next;
        }

        if('rejected' === status) {
            if(!isFn(reject)) {
                next.reject(reject);
            } else {
                try {
                    x = reject(this.reason);
                    resolveX(next, x);
                } catch(e) {
                    this.reject(e);
                }
            }
            return next;
        }
    };

    Promise.prototype.resolve = function(value){
        if('rejected' === this.status) throw Error('Illegal call.');

        this.status = 'resolved';
        this.value = value;

        this._resolves.length && fireQ(this);

        return this;
    };

    Promise.prototype.reject = function(reason){
        if('resolved' === this.status) throw Error('Illegal call.');

        this.status = 'rejected';
        this.reason = reason;

        this._rejects.length && fireQ(this);

        return this;
    };

    function resolveX(promise, x) {
        if(x === promise) promise.reject(new Error('TypeError'));

        if(x instanceof Promise) return resolvePromise(promise, x);
        else return promise.resolve(x);
    };

    function resolvePromise(promise, promise2) {
        var status = promise2.status;

        if('pending' === status) {
            promise2.then(promise.resolve.bind(promise), promise.reject.bind(promise));
        }
        if('resolved' === status) promise.resolve(promise2.value);
        if('rejected' === status) promise.reject(promise2.reason);

        return promise;
    };

    function fireQ(promise) {
        var status = promise.status;
        var queue = promise['resolved' === status ? '_resolves' : '_rejects'];
        var arg = promise['resolved' === status ? 'value' : 'reason'];
        var fn;
        var x;

        while(fn = queue.shift()) {
            x = fn.call(promise, arg);
            x && resolveX(promise._next, x);
        }

        return promise;
    };

    // accept a promises array
    //you know it
    Promise.any = function(promises) {
        var promise = Promise();
        var called;

        each(promises, function(p, i) {
            p.then(function(v) {
                if(!called) {
                    promise.resolve(v);
                    called = true;
                }
            }, function(e) {
                called = true;
                promise.reject(e);
            });
        });

        return promise;
    };

    Promise.all = function(promises) {
        var len = promises.length;
        var promise = Promise();
        var r = [];
        var pending = 0;
        var locked;

        each(promises, function(p, i) {
            p.then(function(v) {
                r[i] = v;
                if(++pending === len && !locked) promise.resolve(r);
            }, function(e) {
                locked = true;
                promise.reject(e);
            });
        });

        return promise;
    };

    //helper
    function isFn(fn) {
        return 'function' === util.type(fn);
    };

    function isObj(o) {
        return 'object' === util.type(o);
    };

    function once(fn) {
        var called;

        return function() {
            if(called) return;
            fn.apply(this, arguments);
            called = true;
        };
    };

    function each(arr, iterator) {
        // this is faster then forEach
        for(var i=0; i<arr.length; i++) iterator(arr[i], i, arr);
    };

    return Promise;

});
