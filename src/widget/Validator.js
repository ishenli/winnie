/**
 * @file validator
 * @author shenli <meshenli@gmail.com>
 * 表单验证的完整版
 */

define(function (require) {

    var ValidatorMain = require('./validator/main');
    var lib = require('../lib');

    var Validator = ValidatorMain.extend({

        type: 'Validator',

        options: {
            explainClass: 'mp-form-explain',
            itemClass: 'mp-form-item',
            itemHoverClass: 'mp-form-hover',
            itemFocusClass: 'mp-form-focus',
            itemErrorClass: 'mp-form-error',
            inputClass: 'mp-input',
            showMessage: function (message, element) {
                this.getExplain(element).innerHTML = message;
                lib.addClass(this.getItem(element), this.get('itemErrorClass'));
            },
            hideMessage: function (message, element) {
                this.getExplain(element).innerHTML = element.getAttribute('data-explain' || '');
                lib.removeClass(this.getItem(element), this.get('itemErrorClass'));
            }
        },

        init: function () {
            Validator.superClass.init.call(this);
        },

        // 根据表单项找到父节点
        getItem: function (ele) {
            return lib.closest(ele, '.' + this.get('itemClass'));
        },
        addItem: function (config) {
            Validator.superClass.addItem.apply(this, [].slice.call(arguments));
            return this;
        },
        getExplain: function (ele) {
            var item = this.getItem(ele);

            // 返回节点数组
            var explainEle = lib.get('.' + this.get('explainClass'), item);

            // 如果没有找到该节点，则返回null
            if (!explainEle) {
                var div = document.createElement('div');
                div.className = this.get('explainClass');
                item.appendChild(div);

                return div;
            }

            return explainEle;
        }
    });

    return Validator;
});
