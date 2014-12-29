/**
 * @file 工具类
 * @author shenli （meshenli@gmail.com）
 */
define(function () {

    var exports = {};
    var guid = 0;
    var EMPTY = '';

    exports.mix = function (to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    };

    exports.guid = function (prefix) {
        return (prefix || EMPTY) + guid++;
    };

    return exports;

});
