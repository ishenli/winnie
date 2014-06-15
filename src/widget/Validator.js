/**
 * @file validator
 * @author shenli （meshenli@gmail.com）
 * 表单验证的完整版
 */

define(function (require) {

    var ValidatorMain = require('./validator/main');
    var lib = require('winnie/lib');

    var Validator = ValidatorMain.extend({

        type: 'Validator',

        options: {
            explainClass: 'ui-form-explain',
            itemClass: 'ui-form-item',
            itemHoverClass: 'ui-form-hover',
            itemFocusClass: 'ui-form-focus',
            itemErrorClass: 'ui-form-error',
            inputClass: 'ui-input',
            showMessage: function (message, element) {
                this.getExplain(element).innerHTML = message;
                lib.addClass(this.getItem(element), this.get('itemErrorClass'));
            },
            hideMessage:function(message,element) {
                this.getExplain(element).innerHTML = element.getAttribute('data-explain' || '');
                lib.removeClass(this.getItem(element), this.get('itemErrorClass'));
            }
        },

        init: function () {
            Validator.superClass.init.call(this);
        },

        //根据表单项找到父节点
        getItem: function (ele) {
            return lib.getAncestorByClass(ele, this.get('itemClass'));
        },
        addItem:function(config) {
            Validator.superClass.addItem.apply(this, [].slice.call(arguments));
            return this;
        },
        getExplain:function(ele) {
            var item = this.getItem(ele);

            //返回节点数组
            var explainEle=lib.closest(item, this.get('explainClass'));

            //如果没有找到该节点，则返回null
            if(!explainEle || explainEle.length === 0) {
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