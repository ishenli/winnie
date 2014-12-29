/**
 * @file event base
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    return {
        Object: require('./object'),
        Observer: require('./Observer'),
        observerCache: require('./observerCache'),
        util: require('./util')
    };
});