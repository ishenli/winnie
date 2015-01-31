/**
 * @file status
 * @author shenli <shenli03@baidu.com>
 */

define(function () {
    /**
     * 状态管理
     *
     * @exports status
     * @type {Object}
     */
    var exports = {};


    /**
     * 控件是否处于指定状态
     *
     * @param {string} status 状态名
     * @return {boolean} 包含指定状态返回`true`
     */
    exports.is = function (status) {
        return !!this.status[status];
    };

    /**
     * 添加控件状态
     *
     * @public
     * @param {string} status 状态名
     */
    exports.addStatus = function (status) {
        this.status[status] = !0;
    };

    /**
     * 移除控件状态
     *
     * @public
     * @param {string} status 状态名
     */
    exports.removeStatus = function (status) {
        delete this.status[status];
    };

    /**
     * 反转控件状态
     *
     * @public
     * @param {string} status 状态名
     * @param {boolean=} isForce 强制指定添加或删除, 传入`true`则添加, 反之则删除
     */
    exports.toggleStatus = function (status, isForce) {
        isForce = 'boolean' === typeof isForce ? isForce : !this.is(status);
        this[isForce ? 'addStatus' : 'removeStatus'](status);
    };


    return exports;
});