/**
 * @file aspect 对widget提供aop支持
 * @author ishenli
 * from https://github.com/aralejs/base/edit/master/src/aspect.js
 */
define(function() {

    var Aspect = {};

    // 在指定方法执行前，先执行 callback
    Aspect.before = function(methodName, callback, context) {
        return weave.call(this, 'before', methodName, callback, context);
    };


    // 在指定方法执行后，再执行 callback
    Aspect.after = function(methodName, callback, context) {
        return weave.call(this, 'after', methodName, callback, context);
    };


    // Helpers
    // -------

    var eventSplitter = /\s+/;

    function weave(when, methodName, callback, context) {
        var names = methodName.split(eventSplitter);
        var name, method;

        while (name = names.shift()) {
            method = getMethod(this, name);
            if (!method.__isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ':' + name, callback, context);
        }

        return this;
    }


    function getMethod(host, methodName) {
        var method = host[methodName];
        if (!method) {
            throw new Error('Invalid method name: ' + methodName);
        }
        return method;
    }


    function wrap(methodName) {
        var old = this[methodName];

        this[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var beforeArgs = ['before:' + methodName].concat(args);

            // prevent if trigger return false
            if (this.fire.apply(this, beforeArgs) === false) return;

            //运行老方法
            var ret = old.apply(this, arguments);

            var afterArgs = ['after:' + methodName, ret].concat(args);
            this.fire.apply(this, afterArgs);

            return ret;
        };

        this[methodName].__isAspected = true;
    }

    return Aspect;
});
