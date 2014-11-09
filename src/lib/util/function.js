/**
 * @file function
 * @ignore
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    util.mix(util, {
        noop: function () {
            return function() {

            }
        }
    });

    return util;
});
