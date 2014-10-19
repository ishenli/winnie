/**
 * @file 常用的工具函数
 * @author shenli
 */
define(function () {

    var exports = {};

    /**
     * 根据图片比例进行按照宽或高的缩放，并视图居中现实
     * 容器的大小固定
     * @param {number} imgW 图片宽度
     * @param {number} imgH 图片高度
     * @param {number} viewW 容器宽度
     * @param {number} viewH 容器高度
     */
    exports.getImgCenterZoom = function (imgW, imgH, viewW, viewH) {
        // 获取原图和容器宽高

        // 获取原图比例
        var oScale = imgW / imgH;

        // 获取视图比例
        var cScale = viewW / viewH;

        var leftDis = 0;
        var topDis = 0;
        var width = 'auto';
        var height = 'auto';

        // 比较原图比例和容器比例
        var scaleWidth;
        var scaleHeight;

        if (oScale > cScale) {
            height = '100%';
            scaleWidth = imgW * viewH / imgH;
            leftDis = (scaleWidth - viewW) / 2;
        }
        else {
            width = '100%';
            scaleHeight = (viewW * imgH / imgW);
            // 判断位移偏量
            topDis = (scaleHeight - viewH) / 2;
        }

        return {
            marginLeft: -leftDis,
            marginTop: -topDis,
            width: width,
            height: height
        };
    };

    return exports;

});
