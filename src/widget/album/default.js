define(function (require) {
    var lib = require('winnie/lib');
    var Etpl = require('etpl');
    var exports = {};

    /**
     * 根据相关尺寸计算大小
     * @param imgW
     * @param imgH
     * @param viewW
     * @param viewH
     */
    exports.getZoom = function (imgW, imgH, viewW, viewH) {
        var offset = {
            top: 0,
            left: 0
        };

        //缩放比例
        var zoom = 1;

        if (imgW > viewW || imgH > viewH) { //图片大于内容区域

            //缩放成同等高度大小，图片的宽度是小于内容区域
            if (imgH / viewH > imgW / viewW) {
                zoom = viewH / imgH;
                offset.top = -(imgH - viewH) / 2;
                offset.left = (viewW - imgW) / 2;
            } else {
                zoom = viewW / imgW;
                offset.top = (viewH - imgH) / 2;
                offset.left = - (imgW - viewW) / 2;
            }

        } else {
            offset.left = (viewW - imgW) / 2;
            offset.top = (viewH - imgH) / 2;
        }

        return{
            zoom: zoom,
            offset: offset
        }
    };

    /**
     * 渲染图片的dom
     * @param target 目标
     * @param index 索引
     */
    exports.renderImageTpl = function(target,index) {
        var el = this.get('imgList')[index];
        var contentTpl = Etpl.getRenderer('content');

        var viewWidth = lib.getSize(target).width;
        var viewHeight = lib.getSize(target).height;
        var marginRight = this.get('contentStyle').marginRight;
        var data = {
            viewHeight:viewHeight-20,//border
            viewWidth:viewWidth-marginRight,
            img:el.getAttribute(this.get('origin')),
            marginRight:marginRight,
            index:(index+1),
            asideHeight:viewHeight,
            len:this.get('len'),
            description:el.getAttribute('data-desc')
        };

        target.innerHTML = contentTpl(data);
    };

    exports._bindTheme = function() {
        this.on('resize', this.contentResize,this);
        this.on('fullscreen:exit', this._exitFullsreen, this);
    };

    exports.contentResize = function() {

        var viewHeight = lib.getSize(this.contentBox).height;
        var boxMain = lib.query('.box-main', this.element);
        var boxAside = lib.query('.box-aside', this.element);

        console.log('theme resize');

        if(boxMain) {
            lib.setStyle(boxMain,{
                height:viewHeight-20+'px'
            });
            lib.setStyle(boxAside,{
                height:viewHeight+'px'
            });

        }

    };

    /**
     * 全屏查看
     * @private
     */
    exports._fullScreen = function(){
        fullScreen();
        this.contentResize();
    };

    /**
     * 关闭全屏
     * @param e
     * @private
     */
    exports._exitFullsreen = function(e) {
        // 关闭fullscreen
        fullScreen(true);
        this.contentResize();
    };

    function fullScreen(close) {
        if (!close && !document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    }

    return exports;
});