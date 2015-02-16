/**
 * @file 实现promise
 * @author shenli
 */
define(function (require) {

    var util = require('./util');
    var promise = require('./promise/es6');
    var enhance = require('./promise/enhance');

    util.extend(promise.prototype, enhance);

    return promise;
});