/**
 * @file lib
 * @author shenli
 */
define(function (require) {

    var u = require('underscore');

    var lib = {};

    u.extend(
        lib,
        require('./lib/string'),
        require('./lib/lang'),
        require('./component/dom'),
        require('./component/domify'),
        require('./component/attribute'),
        require('./component/style'),
        require('./component/event-debug'),
        require('./component/page')
    );

    return lib;
});