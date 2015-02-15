/**
 * @file type
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var util = require('./base');

    var RE_NOT_WHITESPACE = /\S/;
    var win = window;

    util.mix(util, {

        /**
         * 判断是否是窗口对象
         * @member util
         */
        isWindow: function (obj) {
            return obj !== null && obj == obj.window;
        },
        /**
         * Evaluates a script in a global context.
         * @member util
         */
        globalEval: function (data) {
            if (data && RE_NOT_WHITESPACE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
                /*jshint evil:true*/
                if (win.execScript) {
                    win.execScript(data);
                } else {
                    (function (data) {
                        win['eval'].call(win, data);
                    })(data);
                }
            }
        },
    })
});