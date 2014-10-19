/**
 * @file   switchable 自动播放插件功能
 * @author shenli <shenli03@baidu.com>
 */
define(function (require) {
    var $ = require('jquery');
    var win = $(window);

    var Autoplay = {
        isNeeded: function () {
            return this.get('autoplay');
        },

        install: function () {
            var element = this.element;
            var timer;
            var interval = this.get('interval');
            var that = this;

            // start autoplay
            start();

            function start() {
                // 停止之前的
                stop();

                // 设置状态
                that.paused = false;

                // 开始现在的
                timer = setInterval(function () {
                    if (that.paused) {
                        return;
                    }
                    else {
                        that.next();
                    }
                }, interval);
            }

            function stop() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
                that.paused = true;
            }

            // public api
            this.stop = stop;
            this.start = start;

            // 滚出可视区域后，停止自动播放
            this._scrollDetect = throttle(function () {
                that[isInViewport(element) ? 'start' : 'stop']();
                that._initLazyload.call(that);
            });
            win.on('scroll', this._scrollDetect);

            // 鼠标悬停时，停止自动播放
            element.hover(stop, start);
        },

        destroy: function () {
            this.stop && this.stop();

        }

    };
    // Helpers
    // -------

    function throttle(fn, ms) {
        ms = ms || 200;
        var throttleTimer;

        function f() {
            f.stop();
            throttleTimer = setTimeout(fn, ms);
        }

        f.stop = function () {
            if (throttleTimer) {
                clearTimeout(throttleTimer);
                throttleTimer = 0;
            }
        };

        return f;
    }


    function isInViewport(element) {
        var scrollTop = win.scrollTop();
        var scrollBottom = scrollTop + win.height();
        var elementTop = element.offset().top;
        var elementBottom = elementTop + element.height();

        // 只判断垂直位置是否在可视区域，不判断水平。只有要部分区域在可视区域，就返回 true
        return elementTop < scrollBottom && elementBottom > scrollTop;
    }

    return Autoplay;
});
