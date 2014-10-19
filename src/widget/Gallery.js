/**
 * @file Gallery 没有dialog的图片切换控件
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Widget = require('./Widget');
    var lib = require('./lib');
    var Tool = require('./gallery/default');
    var $ = require('jquery');
    var Gallery = Widget.extend({
        Implements:[Tool],
        type:'Gallery',
        options:{
            trigger:'click',
            nextBtn:'.next',
            prevBtn:'.prev',
            fullScreen:'.fullScreen',
            width:'100%',
            height:'1000%',
            imageTpl:'',
            img:'.j-img',
            //选择器
            content:'.j-gallery-content',
            origin:'data-origin-url',
            desc:'title',
            baseEle:null
        },
        init:function() {

            this.baseEle = $(this.get('baseEle'));

            this._bindEvents();
            this._initImages();
            this._bindTheme();

            //用于存放加载完毕的图片
            this._loadedImgs = {};

            this.contentBox = this.element.find(this.get('content'));
        },
        _bindEvents:function() {
            var evt = this.get('trigger');
            var img = this.get('img');
            var me = this;

            me.element.on(evt,me.get('prevBtn'), function(e){
                e.preventDefault();
                me.go(-1);
            });

            me.element.on(evt, me.get('nextBtn'), function(e){
                e.preventDefault();
                me.go(1);
            });

            me.element.on(evt, me.get('fullScreen'), function(e){
                e.preventDefault();
                me.fire('fullScreen');
            });

            this.on('resize', this.resize, this);
            this.on('fullScreen', this._fullScreen, this);

            $(document).on('mozfullscreenchange webkitfullscreenchange fullscreenchange', function(){
                if (!document.webkitFullscreenElement &&
                    !document.mozFullScreenElement && !document.fullscreenElement) {
                    me.fire('fullscreen:exit');
                }
            });

        },

        //如果屏幕尺寸变化，需要重新计算图片的布局
        resize:function() {
            var el = this.element.find(this.get('img'));

            if(el.length) {
                this._setImgPosition(el,1);
            }
            this.fire('contentResize');
        },
        showImg:function(opts,callback) {
            this._showImg(opts);
        },
        /**
         * 显示图片
         * @private
         */
        _showImg:function(opts,callback) {
            var me = this;
            var target = opts.img;
            var index = opts.index;

            index = parseInt(index, 10);

            this.set('index', index);

            this._preLoadImg(index);

            //渲染模板
            this.renderImageTpl(this.contentBox,index);


            //获取已插入dom的图片
            var el = this.element.find(this.get('img'));

            //对图片的大小和外观进行修改
            if(isImageLoaded(el)) {
                el.data('loaded', true);
                this._setImgPosition(el, null, callback);
            }else {
                el.data('loaded', false);

                el.on('load',function() {
                    el.data('loaded', true);
                    me._setImgPosition(el,null,callback);
                });
            }

        },
        _initImages:function() {
            var imgList = this.get('imgList');

            this.set('imgList', imgList);
            this.set('len', imgList.length);

            return imgList;
        },
        _go:function(e) {
            var target = e.target;
            var step = $(target).hasClass('prev') ? -1 : 1;
            this.go(step);
        },

        go:function(step) {
            step = parseInt(step, 10);
            var len = this.get('imgList').length;
            var index = (this.get('index') || 0) + step;

            if (index === -1) {
                index = len - 1;
            }
            if (index === len) {
                index = 0;
                this.fire('done');
            }
            //保存图片索引
            this.set('index', index);

            //获取要显示的图片
            var img = this.get('imgList')[index];

            this._preLoadImg(index);

            this.showImg({
                img:img,
                index:index
            },function() {

            });
        },
        /**
         * 预加载图片,加载前一个和后一个的图片
         * @private
         */
        _preLoadImg:function(index) {
            var imgList = this.get('imgList');
            var len = imgList.length - 1;
            if(!len) {
                return;
            }

            var prev = index ? index - 1 : len;
            var next = index === len ? 0 : index + 1;

            //获取图片的原始url的key
            var origin = this.get('origin');

            var nowImg = imgList[index][origin];
            var prevImg = imgList[prev][origin];
            var nextImg = imgList[next][origin];

            this._loadedImgs[nowImg] = true;

            this._loadImg(prevImg);

            this._loadImg(nextImg);
        },
        _loadImg:function(url) {
            if(url && !this._loadedImgs[url]) {
                var img = new Image();
                img.src = url;
                //只要下载进缓存就可以了
                img = null;

                this._loadedImgs[url] = true;
            }
        },
        /**
         * 调整相册中的图片大小和位置
         * @params {Ojbect} el 传入的jquery el对象
         * @private
         */
        _setImgPosition:function(el,anim,callback) {

            //图片还没全部载入
            if(!el.data('loaded')) {
                return;
            }

            var size = getImageSize(el[0]);

            var viewWidth = this.contentBox.width();
            var viewHeight = this.contentBox.height();

            var zoomAndPos = this.getZoom(size.width, size.height,
                viewWidth, viewHeight);

            var css = $.extend({
                position: 'relative',
                display: 'block'
            }, {
                left:zoomAndPos.offset.left,
                top:zoomAndPos.offset.top,
                transform:'scale('+zoomAndPos.zoom+')'

            });

            el.css(css);
        }

    });

    //helpers
    function isImageLoaded(img) {
        if(!img.complete) {
            return false;
        }

        //http://www.w3schools.com/jsref/prop_img_naturalwidth.asp
        //https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement
        return (typeof img.naturlWidth !=='undefined'
            && img.naturlWidth ===0);
    }

    function getImageSize(el) {
        if(el.natureWdith) {
            return {
                width:el.natureWdith,
                height:el.natureHeight
            }
        } else {
            var img = new Image();

            img.src = el.getAttribute('src');

            return {
                width:img.width,
                height:img.height
            }
        }
    }

    return Gallery;
});