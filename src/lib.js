/**
 * @file lib
 * @author shenli
 */
define(function (require) {

    var util = require('./lib/util');


    var lib = {};

    util.extend(
        lib,
        require('./lib/dom'),
        require('./lib/event')
    );

    return lib;
});