/**
 * @file util
 * @author shenli <shenli03@baidu.com>
 */
define(function (require) {

    require('./util/array');
    require('./util/type');
    require('./util/object');

    var util = require('./util/base');
    util.version = '0.0.1';
    return util;
});
