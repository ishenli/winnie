/**
 * @file 动画
 * @author ishenli （meshenli@gmail.com）
 */
define(function(require) {

    var extend = require('underscore').extend;

    var Animation = require('./Animation');

    var Anim = {};

    var rAF = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (callback) {return setTimeout(callback, 1000 / 60);};

    var cRAF = window.cancelAnimationFrame
        || window.webkitCancelAnimationFrame
        || window.mozCancelAnimationFrame
        || window.oCancelAnimationFrame
        || window.msCancelAnimationFrame
        || function (idenity) {clearTimeout(idenity);};

    /**
     * 添加动画帧
     *
     * @public
     * @param {Function} callback 动画函数
     * @return {string} 动画帧Id 用于取消已添加的动画帧
     */
    Anim.requestAnimationFrame = function (callback) {
        return rAF.call(window, callback);
    };

    /**
     * 取消已添加的动画帧
     *
     * @public
     * @param {string} idenity 动画帧Id
     */
    Anim.cancelAnimationFrame = function (idenity) {
        cRAF.call(window, idenity);
    };


    extend(Anim, require('./transition'));

    Anim.animation = function (ele, options) {
        return new Animation(ele, options);
    };

    return Anim;
});