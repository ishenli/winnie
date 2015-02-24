/**
 * @file lib
 * @author shenli
 */
define(function (require) {

    var util = require('./lib/util');


    var exports = {};

    util.extend(
        exports,
        require('./lib/dom'),
        require('./lib/event')
    );

    return exports;
});