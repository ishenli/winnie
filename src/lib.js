/**
 * @file lib
 * @author shenli
 */
define(function (require) {

    var u = require('underscore');

    var lib = {};

    u.extend(
        lib,
        require('./lib/dom'),
        require('./lib/attribute'),
        require('./lib/event'),
        require('./lib/string'),
        require('./lib/style'),
        require('./lib/page'),
        require('./lib/lang')
    );

    return lib;
});