/**
 * @file Album 控件
 * @author shenli <shenli03@baidu.com>
 * @modify yumao <zhangyu38@baidu.com>
 */

define(function (require) {
    var Dialog = require('./Dialog');
    var lib = require('../lib');
    var Tool = require('./album/default');

    /**
     * 相册控件
     * @constructor
     * @require Dialog
     * @require lib
     * @require album/default
     * @require jQuery
     * @extends module:Dialog
     * @exports Album
     */
    var Album = Dialog.extend({
        Implements: [Tool],
        type: 'Album',
        /**
         * 控件配置项
         * @name options
         * @type {Object}
         * @property {string} options.trigger 控件trigger事件类型
         * @property {jQuery} options.prevBtn 控件前一个的按钮的选择器
         * @property {jQuery} options.nextBtn 控件后一个的按钮的选择器
         * @property {jQuery} options.fullScreen 控件全屏点击的dom元素
         * @property {number} options.width 控件的默认宽度
         * @property {number} options.height 控件的默认高度
         * @property {string} options.template 默认的框架模板
         * @property {string} options.imageTpl 默认的图片框架模板
         * @property {jQuery} options.content album的内容节点
         * @property {jQuery} options.baseEle 小图的某个父节点选择器
         * @property {jQuery} options.img 小图的选择器
         * @property {string} options.origin 图片的真实地址
         * @property {Object} options.conten    tStyle 修饰内部的样式
         */
        options: {
            trigger: 'click',
            nextBtn: '.next',
            prevBtn: '.prev',
            fullScreen: '.fullScreen',
            width: '100%',
            height: '100%',
            template: require('./album/default-tpl'),
            // 选择器
            img: '.j-img',
            content: '.j-album-content',
            id: {
                value: '',
                setter: function () {
                    return lib.guid();
                }
            },
            origin: 'data-origin-url',
            baseEle: null,
            contentStyle: {
                marginRight: '300'
            }
        },

        /**
         * 初始化控件
         * @private
         */
        init: function () {

            Album.superClass.init.call(this);

            this.baseEle = lib.query(this.get('baseEle'));

            this._bindEvents();
            this._initImages();
            this._bindTheme();

            //  用于存放加载完毕的图片
            this._loadedImgs = {};
        },
        /**
         * 绑定各种事件
         * @private
         */
        _bindEvents: function () {
            var evt = this.get('trigger');
            var img = this.get('img');
            var me = this;

            // 绑定图片事件

            lib.on(me.baseEle,evt, img, function (e) {
                e.preventDefault();
                var index = this.getAttribute('data-index');

                me.show();

                me.showImg(me.get('imgList')[index]);
            });

            lib.on(me.element,evt, me.get('prevBtn'), function (e) {
                e.preventDefault();
                me.go(-1);
            });

            lib.on(me.element,evt, me.get('nextBtn'), function (e) {
                e.preventDefault();
                me.go(1);
            });

            lib.on(me.element,evt, me.get('fullScreen'), function (e) {
                e.preventDefault();
                me.fire('fullScreen');
            });

            this.on('resize', this.resize, this);
            this.on('fullScreen', this._fullScreen, this);

            lib.on(document,'mozfullscreenchange webkitfullscreenchange fullscreenchange', function () {
                if (!document.webkitFullscreenElement
                    && !document.mozFullScreenElement
                    && !document.fullscreenElement
                    ) {
                    me.fire('fullscreen:exit');
                }
            });

        },
        /**
         *如果屏幕尺寸变化，需要重新计算图片的布局
         * @public
         */
        resize: function () {

            var el = lib.query(this.get('img'), this.element);
            if (el.length) {
                this._setImgPosition(el, 1);
            }
            this.fire('contentResize');
        },
        /**
         * 显示图片
         * @param {HTMLElement} el 图片的dom节点
         */
        showImg: function (el) {
            this._showImg({
                target: el
            });
        },
        /**
         * 显示图片
         * @private
         */
        _showImg: function (evt, callback) {
            var me = this;
            var target = evt.target;
            var index = target.getAttribute('data-index');

            index = parseInt(index, 10);

            this.set('index', index);

            this._preLoadImg(index);

            // 渲染模板
            this.renderImageTpl(this.contentBox, index);


            // 获取已插入dom的图片
            var el = lib.query(this.get('img',this.element));

            // 对图片的大小和外观进行修改
            if (isImageLoaded(el)) {
                el.data('loaded', true);
                this._setImgPosition(el, null, callback);
            }
            else {
                el.data('loaded', false);
                el.on('load', function () {
                    el.data('loaded', true);
                    me._setImgPosition(el, null, callback);
                });
            }

        },
        /**
         * 隐藏album
         * @public
         */
        hide: function () {
            Album.superClass.hide.call(this);
        },
        /**
         * 初始化图片，返回图片
         * @returns {NodeList} imgList dom集合
         * @private
         */
        _initImages: function () {
            var imgList = this.baseEle.find(this.get('img')).get();

            $.each(imgList, function (i, el) {
                el.setAttribute('data-index', i);
            });

            this.set('imgList', imgList);
            this.set('len', imgList.length);

            return imgList;
        },
        /**
         * 显示某个图片项
         * @param {number} step 图片的索引
         */
        go: function (step) {
            step = parseInt(step, 10);

            var len = this.get('imgList').length;
            var index = this.get('index') + step;

            if (index === -1) {
                index = len - 1;
            }

            if (index === len) {
                index = 0;
            }

            // 获取要显示的图片
            var img = this.get('imgList')[index];

            this._preLoadImg(index);

            this.showImg(img);
        },
        /**
         * 预加载图片,加载前一个和后一个的图片
         * @param {number} index 图片索引
         * @private
         */
        _preLoadImg: function (index) {
            var imgList = this.get('imgList');
            var len = imgList.length - 1;
            if (!len) {
                return;
            }

            var prev = index ? index - 1 : len;
            var next = index === len ? 0 : index + 1;

            // 获取图片的原始url的key
            var origin = this.get('origin');

            var nowImg = $(imgList[index]).attr(origin);
            var prevImg = $(imgList[prev]).attr(origin);
            var nextImg = $(imgList[next]).attr(origin);

            this._loadedImgs[nowImg] = true;

            this._loadImg(prevImg);
            this._loadImg(nextImg);
        },
        /**
         * 载入图片
         * @param {string} url 图片url
         * @private
         */
        _loadImg: function (url) {
            if (url && !this._loadedImgs[url]) {
                var img = new Image();
                img.src = url;
                // 只要下载进缓存就可以了
                img = null;

                this._loadedImgs[url] = true;
            }
        },
        /**
         * 调整相册中的图片大小和位置
         * @param {jquery} el 传入的jq对象
         * @private
         */
        _setImgPosition: function (el) {

            // 图片还没全部载入
            if (!el.data('loaded')) {
                return;
            }

            var size = getImageSize(el[0]);

            var viewWidth = this.contentBox.width() - this.get('contentStyle').marginRight;
            var viewHeight = this.contentBox.height();

            var zoomAndPos = this.getZoom(size.width, size.height,
                viewWidth, viewHeight);

            var css = $.extend({
                position: 'relative',
                display: 'block'
            }, {
                left: zoomAndPos.offset.left,
                top: zoomAndPos.offset.top,
                transform: 'scale(' + zoomAndPos.zoom + ')'

            });

            el.css(css);
        }

    });

    /**
     * 检测图片是否已加载
     * @param {HTMLElement} img 图片dom元素
     * @returns {boolean}
     * @inner
     */
    function isImageLoaded(img) {
        if (!img.complete) {
            return false;
        }

        // http:// www.w3schools.com/jsref/prop_img_naturalwidth.asp
        // https:// developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
        return (typeof img.naturlWidth !== 'undefined'
            && img.naturlWidth === 0);
    }

    /**
     * 获取图片尺寸
     * @param {HTMLElement} el 图片的dom节点
     * @returns {Object} 宽和高
     * @returns {number}  Object.width 宽
     * @returns {number}  Object.height 高
     * @inner
     */
    function getImageSize(el) {
        if (el.natureWdith) {
            return {
                width: el.natureWdith,
                height: el.natureHeight
            };
        }
        else {
            var img = new Image();

            img.src = $(el).attr('src');

            return {
                width: img.width,
                height: img.height
            };
        }
    }

    return Album;
});
