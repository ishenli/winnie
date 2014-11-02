/**
 * @file page
 * @author shenli
 * copy from https://github.com/ecomfe/esui/blob/master/src/lib/page.js
 * http://www.zhangxinxu.com/wordpress/?p=1907
 */
define(function () {

    var documentElement = document.documentElement;
    var body = document.body;
    var viewRoot = document.compatMode === 'BackCompat'
        ? body
        : documentElement;

    var page = {};

    /**
     * 获取页面内容高度
     * @returns {number}
     */
    page.getHeight = function() {
        return Math.max(
            (documentElement?documentElement.scrollHeight:0),
            (body?body.scrollHeight:0),
            (viewRoot?viewRoot.clientHeight:0)
        );
    };
    /**
     * 获取页面宽度
     * @return {number} 页面宽度
     */
    page.getWidth = function () {
        return Math.max(
            (documentElement ? documentElement.scrollWidth : 0),
            (body ? body.scrollWidth : 0),
            (viewRoot ? viewRoot.clientWidth : 0),
            0
        );
    };

    /**
     * 获取页面视觉区域宽度
     *
     * @return {number} 页面视觉区域宽度
     */
    page.getViewWidth = function () {
        return viewRoot ? viewRoot.clientWidth : 0;
    };

    /**
     * 获取页面视觉区域高度
     *
     * @return {number} 页面视觉区域高度
     */
    page.getViewHeight = function () {
        return viewRoot ? viewRoot.clientHeight : 0;
    };

    /**
     * 获取纵向滚动量
     *
     * @return {number} 纵向滚动量
     */
    page.getScrollTop = function () {
        return window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
    };

    /**
     * 获取横向滚动量
     *
     * @return {number} 横向滚动量
     */
    page.getScrollLeft = function () {
        return window.pageXOffset
            || document.documentElement.scrollLeft
            || document.body.scrollLeft
            || 0;
    };

    /**
     * 获取页面纵向坐标
     *
     * @return {number}
     */
    page.getClientTop = function () {
        return document.documentElement.clientTop
            || document.body.clientTop
            || 0;
    };

    /**
     * 获取页面横向坐标
     *
     * @return {number}
     */
    page.getClientLeft = function () {
        return document.documentElement.clientLeft
            || document.body.clientLeft
            || 0;
    };

    /**
     * 获取元素的绝对坐标
     *
     * @method module:getPosition
     *
     * @param {HTMLElement} element 目标元素
     * @return {Object} 包含 left 和 top 坐标值的对象
     */
    page.getPosition  = function (element) {
        //https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect
        var bound = element.getBoundingClientRect();

        var clientTop = documentElement.clientTop || body.clientTop || 0;
        var clientLeft = documentElement.clientLeft || body.clientLeft || 0;

        var scrollTop = window.pageYOffset || documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || documentElement.scrollLeft;

        return {
            left: parseFloat(bound.left) + scrollLeft - clientLeft,
            top: parseFloat(bound.top) + scrollTop - clientTop
        };
    };

    return page;
});