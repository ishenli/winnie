/**
 * @file assert 断言库
 * @ignore
 * @author shenli <meshenli@gmail.com>
 * @see https://github.com/ecomfe/er
 */

define(function () {

    var assert;

    if (window.DEBUG) {

        /**
         * 断言函数
         *
         * 断言函数仅在开发期有效，当`window.DEBUG`属性为`true`时，
         * 断言失败会抛出异常，其它情况下断言无任何作用
         *
         * 断言是[契约式编程](http://en.wikipedia.org/wiki/Design_by_contract)
         * 中很重要的一块，使用得当可以有效地提高程序的质量
         *
         * @class
         * @param {boolean} condition
         * @param {string} message
         */
        assert = function (condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        };

        /**
         * 断言一个对象有值
         * @param {*} obj
         * @param {string} message
         */
        assert.has = function (obj, message) {
            assert(obj != null, message);
        };


        /**
         * 断言一个对象包含指定名称的属性
         * @param {*}obj
         * @param {string}property
         * @param {string}message
         */
        assert.hasProperty = function (obj, property, message) {
            assert(obj[property] != null, message);
        };

    }
    else {
        assert = function () {

        };

        assert.has = assert;
        assert.hasProperty = assert;
    }


    return assert;
});
