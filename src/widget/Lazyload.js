/**
 * @file Lazyload
 * @author ishenli
 */
define(function (require) {

    var lib = require('winnie/lib');
    var u = require('underscore');
    var Widget = require('./Widget');

    var OFFSET;

    var Lazyload = Widget.extend({
        /**
         * 控件默认配置
         *
         * @inner
         * @type {Object}
         */
        options: {


            /**
             * 未设定原始图片，则显示占位符
             *
             * @type {string}
             */
            placeHolder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+' +
                'PB/AAffA0nNPuCLAAAAAElFTkSuQmCC',

            /**
             * 存放原始图片
             *
             * @type {string}
             */
            urlName: 'data-url',

            /**
             * 是否竖滚
             *
             * @type {boolean}
             */
            isVertical: true,

            /**
             * 阀值，为正值则提前加载
             *
             * @type {number}
             */
            threshold: 200,

            /**
             * 触发事件
             *
             * @type {string}
             */
            eventName: 'scroll',

            /**
             * 图片容器
             */
            container: window
        },
        /**
         * 控件初始化
         *
         * @protected
         */
        init: function () {
            this.element = lib.queryAll(this.get('element'));
            this.isVertical = this.get('isVertical');
            this.placeHolder = this.get('placeHolder') ? this.get('placeHolder') : null;
            this.isWindow = this.get('container') === window;
            this._initOffset();
            this._initEvent();
            this.active();
        },

        /**
         * 控件销毁
         *
         * @public
         */
        destroy: function () {

            // 清理相关数据、监听器
            OFFSET = this.element = this.isVertical = this.placeHolder = null;

            lib.un(window, this.get('eventName'), this.scrollHandler);

            /**
             * @event Lazyload#destroy
             */
            this.fire('destroy');

            this.off();
        },

        _initOffset: function () {
            OFFSET = {
                win: [this.isVertical ? 'scrollY' : 'scrollX',
                    this.isVertical ? 'innerHeight' : 'innerWidth'
                ],
                img: [this.isVertical ? 'top' : 'left',
                    this.isVertical ? 'height' : 'width'
                ]
            };

            //若element不是window，则OFFSET取值同img
            !this.isWindow && (OFFSET['win'] = OFFSET['img']);
        },
        _initEvent: function () {
            var self = this;

            this.scrollHandler = function () {
                self.detect();
            };

            lib.on(window, this.get('eventName'), this.scrollHandler);


            u.each(this.element, function (ele) {

                //用于图片加载判断
                ele.loaded = false;

                //如果图片没有替代图片，则设为data:url
                if (ele.getAttribute('src') === null
                    || ele.getAttribute('src') === false
                    || ele.getAttribute('src') === '') {
                    if (ele.tagName === 'IMG') {
                        ele.setAttribute('src', self.get('placeHolder'));
                    }
                }

                lib.one(ele, 'appear', function () {
                    if (!ele.loaded) {
                        var img;
                        var src = ele.getAttribute(self.get('urlName'));
                        img = new Image();
                        img.src = src;
                        lib.on(img, 'load', function () {
                            ele.setAttribute('src', src);
                            ele.loaded = true;
                        });
                    }
                });
            })
        },
        detect: function () {
            var imgOffset;
            var self = this;
            u.each(this.element, function (item) {
                imgOffset = lib.getPosition(item);
                self._isInViewport(imgOffset, item) && self._load(item);
            });
        },

        _load: function (ele) {
            lib.fire(ele, 'appear');
        },
        _isInViewport: function (offset, img) {
            var viewOffset = this.isWindow ? window : lib.getPosition(this.container);
            var viewTop = viewOffset[OFFSET.win[0]];
            var viewHeight = viewOffset[OFFSET.win[1]];
            var offsetItem = OFFSET.img[0];
            return viewTop >= offset[offsetItem] - this.get('threshold') - viewHeight
                && viewTop <= offset[offsetItem] + img[OFFSET.img[1]];
        },
        /**
         * 激活控件
         *
         * @public
         * @return {Lazyload} 当前实例
         */
        active: function () {
            if (!this.isActive) {
                this.isActive = true;

                // 控件主元素DOM事件绑定
//                toggleDOMEvents( this );

                /**
                 * @event Lazyload#active
                 */
                this.fire('active');
            }

            return this;
        }

    });


    return Lazyload;
});