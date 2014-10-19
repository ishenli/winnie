/**
 * @file Lazyload，支持图片延迟加载和textarea中的html片段延迟渲染
 * @author ishenli
 */
define(function (require) {

    var Widget = require('./Widget');
    var $ = require('jquery');
    var lib = require('./lib');
    var IND = 0;
    var DEFAULT = 'default';

    /**
    * @constructor
    * @extends module:Widget
    * @requires Widget
    * @requires jQuery
    * @exports Lazyload
    */
    var Lazyload = Widget.extend({
        /**
         * 控件配置项
         * @name options
         * @name module:Lazyload#options
         * @property {string} options.placeHolder  占位符
         * @property {string} [options.urlName='data-url']  未设定原始图片，则显示占位符
         * @property {string} [options.textareaFlag='j-lazyload-text']  textarea的class选择器
         * @property {boolean} [options.execScript=true]  是否执行的textarea中的script脚本
         * @property {boolean} [options.threshold='default']  阀值，为正值则提前加载,默认为当前视窗（容器）高度，（两屏以外的才加载）
         * @property {boolean} [options.autoDestroy=true]  自动销毁
         * @property {jQuery} [options.container=document]  容器
         * @property {number} [options.duration=200]  load函数的执行频率,单位ms
         */
        options: {


            /**
             * 未设定原始图片，则显示占位符
             * @type {string}
             */
            placeHolder: 'http://vs-static.baidu.com/game/asset/img/transparent.gif',

            /**
             * 存放原始图片
             *
             * @type {string}
             */
            urlName: 'data-url',
            /**
             * textarea的class选择器
             */
            textareaFlag: 'j-lazyload-text',

            /**
             * 执行textarea中的脚本
             * @type {boolean}
             */
            execScript: true,

            /**
             * 阀值，为正值则提前加载
             * 默认为当前视窗（容器）高度，（两屏以外的才加载）
             * @type {number}
             */
            threshold: DEFAULT,

            /**
             * 延迟加载的容器
             * 传入dom节点,返回dom节点
             * @return {HTMLElement} 容器的dom节点
             */
            container: document,

            /**
             * 自动销毁
             */
            autoDestroy: true,

            /**
             * 图片显示前的调用函数
             */
            onStart: null,

            /**
             * load函数的执行频率,单位ms
             */
            duration: 150
        },
        /**
         * 控件初始化
         *
         * @protected
         */
        init: function () {
            var self = this;

            this._callbacks = {};
            this._initEvent();
            this.get('container') && this.addElements(this.get('container'));

            this._loadFn();

            $(document).ready(function () {
                self._loadFn();
            });

            this.resume();
        },

        /**
         * 覆盖父类的parseElement方法
         * @override
         */
        parseElement: function () {
            this._containerIsNotDocument = this.get('container').nodeType !== 9;
            this.$window = $(window);
        },

        /**
         * 控件销毁
         *
         * @public
         */
        destroy: function () {

            //  清理相关数据、监听器
            this._callback = {};
            this._destroyed = true;
            this.pause();
            this.fire('destroy');
            this.off();
        },

        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var self = this;
            var autoDestroy = self.get('destroy');

            self.imgHandle = function () {
                loadImgSrc(this, self.get('urlName'), self.get('onStart'));
            };

            self.textAreaHandle = function () {
                //  在textarea区域内部可能还存在image、textarea，所以需要addElements
                self.addElements(loadTextAreaData(this, self.get('execScript'), self.get('onStart')));
            };

            var loadFn = $.proxy(function () {
                if (autoDestroy && self._counter === 0 && $.isEmptyObject(self._callbacks)) {
                    self.destroy();
                }
                //  开始载入
                self._loadItems();
            }, self);

            self._loadFn = lib.throttle(loadFn, this.get('duration'));

        },

        /**
         * 添加元素到加载列表,要区分img 和 textarea
         * @param {HTMLElement[]} eles
         * @param {string} type  img or textarea
         */
        addElements: function (eles, type) {
            var self = this;

            // 添加计数器
            self._counter = self._counter || 0;
            if (typeof eles === 'string') {
                eles = $(eles).get(); // 返回dom对象
            }
            else if (!$.isArray(eles)) {
                eles = [eles];
            }

            $.each(eles, function (index, el) {
                // 如果是图片
                if (!type || type === 'img') {

                    // 获取每个容器中的所有图片
                    var imgInEl = $(el).find('img').get();
//                     var imgs = [el].concat(imgInEl);
                    $.each($(imgInEl).filter(function (index, img) {
                        return img.getAttribute
                            && img.getAttribute(self.get('urlName'));

                    }), function (index, img) {
                        // 对带有延迟加载标志的图片进行load
                        self.onPlaceHolder = self.onPlaceHolder
                            || function (callback) {
                            var img = new Image();
                            var placeHolder = self.get('placeHolder');

                            img.src = placeHolder;
                            img.onload = function () {

                                // callback为createLoader的load的匿名函数
                                callback(placeHolder);
                            };
                        };

                        if (img.offsetWidth) { // 图片已经显示出来
                            self.addCallback(img, self.imgHandle);
                        }
                        else {
                            self._counter++;
                            img.onload = function () {
                                self._counter--;

                                // 这个是将每个懒加载项存入的lazylaod的list
                                self.addCallback(img, self.imgHandle);
                            };

                            if (!img.src) {
                                self.onPlaceHolder(function (placeholder) {
                                    if (!img.src) {
                                        img.src = placeholder;
                                    }
                                });
                            }
                        }
                    });
                }

                // 加载textarea的中html
                if (!type || type === 'textarea') {
                    $.each($('textarea.' + self.get('textareaFlag'), el), function (index, textarea) {
                        self.addCallback(textarea, self.textAreaHandle);
                    });
                }
            });

        },
        /**
         * 删除监听的元素
         * @param {HTMLElement[]} eles
         */
        removeElements: function (eles) {
            var self = this;
            var callbacks = self._callbacks;
            if (typeof eles === 'string') {
                eles = $(eles);
            }
            else if (!$.isArray(eles)) {
                eles = [eles];
            }

            $.each(callbacks, function (callback, key) {
                if ($.inArray(callback.el, eles)) {
                    delete callbacks[key];
                }
            });

        },
        /**
         * 添加回调函数，当元素出现在可视区域内，触发
         * @param {HTMLElement} el 元素
         * @param {function} fn 监听函数
         */
        addCallback: function (el, fn) {
            var self = this;
            var callbacks = self._callbacks;
            var callback = {
                el: el || document,
                fn: fn || $.noop
            };
            var key = ++IND;

            callbacks[key] = callback;

            if (self._windowRegion) {
                self._loadItem(key, callback);
            }
            else {
                self.refresh();
            }
        },
        /**
         * 删除某个元素的回调函数
         * @param {element} el 元素
         * @param {function} fn 监听函数
         */
        removeCallback: function (el, fn) {
            var calllbacks = this._callbacks;
            $.each(calllbacks, function (key, callback) {
                if (callback.el === el && (fn ? callback.fn === fn : 1)) {
                    delete calllbacks[key];
                }
            });
        },

        /**
         * 执行所有的懒加载项目
         * @private
         */
        _loadItems: function () {
            var self = this;

            self._windowRegion = self._getBoundingRect();

            // 如果容器不是默认的document，需要重新计算容器的区域
            if (self._containerIsNotDocument) {
                self._containerRegion = self._getBoundingRect(self.get('container'));
            }
            // 遍历lazyload的list
            $.each(self._callbacks, function (key, callback) {
                callback && self._loadItem(key, callback);
            });
        },
        /**
         * 执行单个项目的回调，执行成功后，删除，并返回执行的结果
         * @param {Number} key
         * @param {Object} callback 是一个包含el和fn的对象
         * @private
         */
        _loadItem: function (key, callback) {
            var self = this;
            callback = callback || self._callbacks[key];
            if (!callback) {
                return;
            }

            var el = callback.el;
            var result = false;
            var fn = callback.fn;
            if (self.get('force')
                || elementInViewport(el, self._windowRegion, self._containerRegion)) {
                try {
                    result = fn.call(el);
                }
                catch (e) {
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }

                if (result !== false) {
                    delete self._callbacks[key];
                }

                return result;
            }
        },
        /**
         * 监控懒加载的元素，绑定滚动事件什么的
         */
        resume: function () {
            var loadFn = this._loadFn;
            if (this._destroyed) {
                return;
            }
            this.$window.on('scroll resize', loadFn);
            if (this._containerIsNotDocument) {
                var $container = $(this.get('container'));
                $container.on('scroll', loadFn);
            }
        },
        /**
         * 用于首屏刷新数据
         */
        refresh: function () {
            this._loadFn();
        },
        /**
         * 暂停监听
         */
        pause: function () {
            var self = this;
            var loadFn = self._loadFn;
            this.$window.off('scroll resize', loadFn);
            if (this._containerIsNotDocument) {
                var $container = $(this.get('container'));
                $container.off('scroll', loadFn);
            }
        },
        /**
         * 获取元素的区域坐标，默认元素为window
         * @param {HTMLElement} el
         * @returns {{left: *, right: *, top: *, bottom: *}}
         * @private
         */
        _getBoundingRect: function (el) {
            var width;
            var height;
            var left;
            var top;
            var right;
            var bottom;
            if (el) { // 传入目标元素
                var $el = $(el);
                width = $el.outerWidth();
                height = $el.outerHeight();
                var offset = $el.offset();
                left = offset.left;
                top = offset.top;
            }
            else {
                width = this.$window.width();
                height = this.$window.height();
                top = this.$window.scrollTop();
                left = this.$window.scrollLeft();
            }

            var threshold = this.get('threshold');
            var thresholdX = threshold === DEFAULT ? width : threshold;
            var thresholdY = threshold === DEFAULT ? height : threshold;

            right = left + width;
            bottom = top + height;

            left -= 0;
            right += thresholdX;
            top -= 0;
            bottom += thresholdY;
            return {
                left: left,
                right: right,
                top: top,
                bottom: bottom
            };

        }
    });


    /**
     * 图片加载函数
     * @param {HTMLElement} img 图片
     * @param {String} urlName
     * @param {Function} onStart 默认值为 null, 替换 src 之前调用的函数
     */
    function loadImgSrc(img, urlName, onStart) {
        var dataSrc = img.getAttribute(urlName);
        var params = {
            type: 'img',
            ele: img,
            src: dataSrc
        };
        var result = (!$.isFunction(onStart)) || (onStart(params) !== false);

        if (result && params.src) {
            var setSrc = function (src) {

                // 如果图片的src不等于延迟的地址，则替换
                if (img.src !== src) {
                    img.src = src;
                }
                img.removeAttribute(urlName);
            };

            setSrc(params.src);
        }
    }

    /**
     * 加载textArea的文本，提升渲染的性能
     * @param {HTMLElement} textarea textarea节点
     * @param {boolean} isExecScript 是否执行textarea的脚本
     * @param {function} onStart 执行前的函数
     * @return {HTMLElement} $html 返回的元素集合给addElements,添加里面的图片到lazylaod.list
     */
    function loadTextAreaData(textarea, isExecScript, onStart) {
        textarea.style.display = 'none';
        textarea.className = '';
        var html = textarea.value;
        if ($.isFunction(onStart)) {
            var ret = onStart({
                type: 'textarea',
                elem: textarea,
                value: html
            });
            if (ret) {
                html = ret;
            }
        }

        var $html = $(html);
        var $textarea = $(textarea);
        $textarea.before($html);

        /*if (isExecScript) {
            // 执行插入节点的脚本
            var scriptText = $textarea[0].parentNode.parentNode.getElementsByTagName('script');
            var node; // 脚本节点
            var text; // 脚本的内容
            for (var i = 0, len = scriptText.length; i < len; i++) {
                node = scriptText[i];
                text = node.text || node.textContent || node.innerHTML || '';
                window.eval.call(window, text);
            }
        }*/

        // 返回插入之后的dom节点
        return $html.get();
    }

    /**
     * 判断元素是否出现在可视区域内，
     * @param {HTMLElement} ele
     * @param {Object} windowRegion
     * @param {Object} containerRegion 如果容器不是的document的有值，否则为undefined
     * @returns {*}
     */
    function elementInViewport(ele, windowRegion, containerRegion) {

        // 元素被display:none
        if (!ele.offsetWidth) {
            return false;
        }

        var eleOffset = $(ele).offset();
        var isInViewport = true;
        var inWin;
        var left = eleOffset.left;
        var top = eleOffset.top;
        var eleRegion = {
            left: left,
            top: top,
            bottom: top + getElementHeight(ele),
            right: left + getElementWidth(ele)
        };

        inWin = isCross(windowRegion, eleRegion);

        if (inWin && containerRegion) {
            isInViewport = isCross(containerRegion, eleRegion); //  maybe the container has a scroll bar, so do this.
        }

        //  确保在容器内出现并且在视窗内也出现
        return isInViewport && inWin;

    }

    function getElementHeight(ele) {
        return $(ele).outerHeight();
    }

    function getElementWidth(ele) {
        return $(ele).outerWidth();
    }

    /**
     * 两个区域是否相交
     * @param {Object} r1
     * @param {Object} r2
     */
    function isCross(r1, r2) {
        var r = {};
        r.top = Math.max(r1.top, r2.top);
        r.bottom = Math.min(r1.bottom, r2.bottom);
        r.left = Math.max(r1.left, r2.left);
        r.right = Math.min(r1.right, r2.right);
        return r.bottom >= r.top && r.right >= r.left;

    }

    return Lazyload;
});
