/**
 * @file lib 只保留jquery没有的功能
 * @author shenli
 */
define(function (require) {

    var $ = require('jquery');

    var lib = {};

    $.extend(
        lib,
        require('./lib/string'),
        require('./lib/util'),
        require('./lib/lang')
    );

    return lib;
});
