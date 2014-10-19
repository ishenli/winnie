/**
 * @file async
 * @author shenli
 */
define(function (require) {
    var async = {};
    var u = require('underscore');

    async.each = function (arr, iterator, callback) {
        callback = callback || function(){};

        if (!arr.length) {
            return callback();
        }
        var completed = 0;

        _forEach(arr, function (val) {
            iterator(val, function (err) {
                if (err) {
                    callback(err);
                    callback = function(){};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                }
            });
        });
    };

    /**
     * 依次执行iterator，只有上一个iterator完成才能进行下一个iterator
     * @param {Array} arr
     * @param {function} iterator
     * @param {function} callback
     * @returns {*}
     */
    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function(){};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;

        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function(){};
                }
                else {
                    completed += 1;
                    if (completed === arr.length) {
                        callback(null);
                    }
                    else {
                        iterate(); // 执行array数组中的
                    }
                }
            });
        };

        iterate();
    };

    var _asyncMap = function (eachFn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (val, i) {
            return { index: i, value: val };
        });

        eachFn(arr, function (val, callback) {
            iterator(val.value, function (err, v) {
                results[val.index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };

    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    async.map = doParallel(_asyncMap);

    async.mapSeries = doSeries(_asyncMap);

    async.series = function (tasks, callback) {
        callback = callback || function () {
        };
        if (u.isArray(tasks)) {
            // https://github.com/caolan/async#mapSeries
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (key, callback) {
                tasks[key](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[key] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };


    var _forEach = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _forEach(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
    return async;
});
