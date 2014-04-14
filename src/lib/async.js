/**
 * @file async
 * @author shenli
 */
define(function (require) {

    var u = require('underscore');

    var async = {};

    if (typeof process === 'undefined' || !(process.nextTick)) {
        async.nextTick = function (fn) {
            setTimeout(fn, 0);
        };
    } else {
        async.nextTick = process.nextTick;
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function(){};

        if(!arr.length) {
            return callback();
        }
        var completed = 0;

        u.each(arr,function(val) {
           iterator(val,function(err) {
              if(err) {
                  callback(err);
                  callback=function(){};
              } else {
                  completed+=1;
                  if(completed=== arr.length){
                      callback(null);
                  }
              }
           });
        });
    };

    /**
     * 依次执行iterator，只有上一个iterator完成才能进行下一个iterator
     * @param arr
     * @param iterator
     * @param callback
     * @returns {*}
     */
    async.eachSeries= function (arr,iterator,callback){
        callback = callback || function(){};
        if(!arr.length) {
            return callback();
        }
        var completed = 0;

        var iterate = function(){
            iterator(arr[completed],function(err) {
                if(err) {
                    callback(err);
                    callback=function(){};
                } else {
                    completed+=1;
                    if(completed=== arr.length){
                        callback(null);
                    } else {
                        iterate(); // 执行array数组中的
                    }
                }
            });
        };

        iterate();
    };

    var _asyncMap = function(eachFn,arr,iterator,callback){
        var results = [];
        arr = u.map(arr,function(val,i) {
            return {index: i, value: val};
        });

        eachFn(arr,function(val,callback) {
            iterator(val.value,function(err,v) {
                results[val.index] = v;
                callback(err);
            });
        },function(err) {
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

    async.series = function (tasks,callback) {
        callback = callback || function(){};
        if(u.isArray(tasks)) {
            //https://github.com/caolan/async#mapSeries
            async.mapSeries(tasks,function(fn,callback){
                if(fn) {
                    fn(function(err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            },callback);
        } else {
            var results = {};
            async.eachSeries(u.keys(tasks),function(key,callback){
                tasks[key](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[key] = args;
                    callback(err);
                });
            },function (err) {
                callback(err, results);
            });
        }
    };
    return async;
});