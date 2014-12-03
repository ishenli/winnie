/**
 * @file dom 常用的函数
 * @author ishenli <meshenli@gmail.com>
 */
define(function (require) {

    var doc = window.document;
    var exports = {};

    exports.domReady = function (callback) {
        var readyList = [];
        var readyBound = false;
        exports.domReady.isReady = false;
        if (typeof callback === 'function') {
            if (readyList) {
                readyList.push(callback)
            }
            else {
                callback();
            }
            bindReady();
        }

        // 执行之后要去掉监听
        var DOMContentLoaded = function () {
            if (window.addEventListener) {
                window.removeEventListener('DOMContentLoaded', DOMContentLoaded, false)
            }
            else {
                window.detachEvent('onreadystatechange', DOMContentLoaded);
            }

            fireReady();
        };

        function fireReady() {

            // 确保之前没有执行
            if (!exports.domReady.isReady) {
                if (!document.body) {
                    return setTimeout(fireReady, 1);
                }

                exports.domReady.isReady = true;

                for (var i= 0,fn;fn = readyList[i++];) {
                    fn();
                }
                readyList = null; // 清空数组

                fireReady = function () {
                };
            }
        }

        /**
         * 绑定ready事件
         */
        function bindReady() {

            var top = false;
            if (readyBound) {
                return;
            }

            readyBound = true;

            // Catch cases where documentReady is called after the
            // browser event has already occurred.
            if (doc.readyState !== 'loading') {
                fireReady();
            }

            // 给window叫load确保DOMContentLoaded 总能执行
            if (window.addEventListener) {
                window.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
                window.addEventListener("load", DOMContentLoaded, false);
            }
            else {
                document.attachEvent("onreadystatechange", DOMContentLoaded);
                window.attachEvent("onload", DOMContentLoaded);

                try {
                    top = window.frameElement == null;
                } catch (e) {
                }

                if (doc.documentElement.doScroll && top) {
                    doScrollCheck();
                }
            }

        }

        function doScrollCheck() {
            if (exports.domReady.isReady) {
                return;
            }

            try {
                // http://javascript.nwbox.com/IEContentLoaded/
                doc.documentElement.doScroll('left');
            }
            catch (e) {
                setTimeout(doScrollCheck, 1);
                return;
            }

            fireReady();
        }

    };

    return exports;
});