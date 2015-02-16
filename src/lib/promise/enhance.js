/**
 * @file 对promise的api增强
 * @author shenli <meshenli@gmail.com>
 */

define(function () {

    var exports = {};

    exports.done = function(callback) {
        return this.then(callback);
    };

    exports.fail = function(callback) {
        return this.then(null, callback);
    };

    exports.ensure = function(callback) {
        return this.then(callback, callback);
    };

    return exports;

});
