/**
 * @file Album 控件
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var Dialog = require('./Dialog');
    var lib = require('winnie/lib');
    var u = require('underscore');
    var Tool = require('./album/default');

    var Album = Dialog.extend({
        Implements:[Tool],
        type:'Album',
        options:{
            trigger:'click',
            nextBtn:'.next',
            prevBtn:'.prev',
            fullScreen:'.fullScreen',
            width:'90%',
            height:'90%',
            template:require('./album/default-tpl'),
            //选择器
            img:'.j-img',
            content:'.j-album-content',

            id:{
                value:'',
                setter:function() {
                    return lib.guid();
                }
            },
            origin:'data-origin-url',
            baseEle:null,
            contentStyle:{
                marginRight:'300'
            }
        },
        init:function() {

            Album.superClass.init.call(this);

            this.baseEle = lib.g(this.get('baseEle'));

            this._bindEvents();
            this._initImages();
            this._bindTheme();

            //用于存放加载完毕的图片
            this._loadedImgs = {};
        },
        _bindEvents:function() {
            var evt = this.get('trigger');
            var img = this.get('img');
            var me = this;

            //绑定图片事件
            lib.bind(me.baseEle, img, evt, function(e){
                lib.preventDefault(e);
                var target = lib.getTarget(e);
                var index = target.getAttribute('data-index');

                me.show.call(me);

                me.showImg(me.get('imgList')[index]);
            });



            lib.bind(me.element, me.get('prevBtn'), evt, function(e){
                lib.preventDefault(e);
                me.go(-1);
            });

            lib.bind(me.element, me.get('nextBtn'), evt, function(e){
                lib.preventDefault(e);
                me.go(1);
            });

            lib.bind(me.element, me.get('fullScreen'), evt, function(e){
                lib.preventDefault(e);
                me.fire('fullScreen');
            });

            this.on('resize', this.resize, this);
            this.on('fullScreen', this._fullScreen, this);

            lib.on(document, 'mozfullscreenchange webkitfullscreenchange fullscreenchange', function(){
                if (!document.webkitFullscreenElement &&
                    !document.mozFullScreenElement && !document.fullscreenElement) {
                    me.fire('fullscreen:exit');
                }
            });

        },

        //如果屏幕尺寸变化，需要重新计算图片的布局
        resize:function() {

            console.log('album resize');
            var el = lib.query(this.get('img'), this.element);
            if(el) {
                this._setImgPosition(el,1);
            }
            this.fire('contentResize');
        },
        showImg:function(el,callback) {
            this._showImg({
                target:el
            });
        },
        /**
         * 显示图片
         * @private
         */
        _showImg:function(evt,callback) {
            var me = this;
            var target = evt.target;
            var index = target.getAttribute('data-index');

            index = parseInt(index, 10);

            this.set('index', index);

            this._preLoadImg(index);

            //渲染模板
            this.renderImageTpl(this.contentBox,index);


            //获取已插入dom的图片
            var el = lib.query(this.get('img'), this.element);

            //对图片的大小和外观进行修改
            if(isImageLoaded(el)) {
                el.setAttribute('data-loaded', true);
                this._setImgPosition(el, null, callback);
            }else {
                el.setAttribute('data-loaded', false);
                lib.on(el,'load',function() {
                    el.setAttribute('data-loaded', true);
                    me._setImgPosition(el,null,callback);
                });
            }

        },
        hide:function() {
            Album.superClass.hide.call(this);
        },
        _initImages:function() {
            var imgList = lib.queryAll(this.get('img'), this.baseEle);

            u.each(imgList,function(el,i) {
                el.setAttribute('data-index', i);
            });

            this.set('imgList', imgList);
            this.set('len', imgList.length);

            return imgList;
        },
        _go:function(e) {
            var target = lib.getTarget(e);
            var step = lib.hasClass(target, 'prev') ? -1 : 1;
            this.go(step);
        },
        go:function(step) {
            step = parseInt(step, 10);
            this._initImages();

            var len = this.get('imgList').length;
            var index = this.get('index') + step;

            if (index === -1) {
                index = len - 1;
            }

            if (index === len) {
                index = 0;
            }

            //获取要显示的图片
            var img = this.get('imgList')[index];

            this._preLoadImg(index);

            this.showImg(img,function() {

            });
        },
        _action:function() {

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

            var nowImg = imgList[index].getAttribute(origin);
            var prevImg = imgList[prev].getAttribute(origin);
            var nextImg = imgList[next].getAttribute(origin);

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
         * @private
         */
        _setImgPosition:function(el,anim,callback) {

            //图片还没全部载入
            if(!el.getAttribute('data-loaded')) {
                return;
            }

            var size = getImageSize(el);

            var viewWidth = lib.getSize(this.contentBox).width-this.get('contentStyle').marginRight;
            var viewHeight = lib.getSize(this.contentBox).height-20;

            var zoomAndPos = this.getZoom(size.width, size.height,
                                            viewWidth, viewHeight);

            var css = u.extend({
                position: 'relative',
                display: 'block'
            }, {
                left:zoomAndPos.offset.left+'px',
                top:zoomAndPos.offset.top+'px',
                transform:'scale('+zoomAndPos.zoom+')'

            }); 

            lib.setStyle(el, css);

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

    return Album;
});