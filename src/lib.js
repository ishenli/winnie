/**
 * @file file
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
        require('./lib/lang')
    );

    return lib;
});