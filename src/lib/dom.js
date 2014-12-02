/**
 * @file dom
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var util = require('./util');
    var dom = require('./dom/base');

    util.extend(dom,
        require('./dom/selector'),
        require('./dom/data'),
        require('./dom/create'),
        require('./dom/manipulation'),
        require('./dom/page'),
        require('./dom/style'),
        require('./dom/class'),
        require('./dom/function')
    );

    return dom;

});