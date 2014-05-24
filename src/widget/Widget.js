/**
 * @file ui控件基础，封装基本的方法和属性
 * @author shenli
 */
define(function (require) {
    var lib = require('winnie/lib');
    var Control = require('./Control');

    var Widget = Control.extend({

        type: 'Widget',

        element: null,
        propsInOptions: ['element'],

        options: {
            id: null,
            template: '<div></div>',
            parentNode: document.body
        },
        /**
         * 销毁控件时执行的方法
         */
        dispose: function () {
            //注销事件
            for (var type in this._listener) {
                this.un(type);
            }

            //删除节点
            var element = this.element;
            lib.removeNode(element);

            delete  this.element;

            this.fire('dispose');

        },
        /**
         * 组件初始化执行的方法
         * @param config
         */
        initialize: function (config) {

            //因为类构建的时候只调用自己的initialize方法

            Widget.superClass.initialize.call(this, config);

            //初始化元素
            this.parseElement();

            this.init && this.init(config);
        },

        parseElement: function () {

            var element = this.element;

            //用户传入dom元素或者id
            if (element) {
                this.element = lib.g(element);
            }
            //从模板中拿
            else if (this.get('template')) {
                this.parseElementFromTemplate();
            }

            if (!this.element) {
                throw new Error('element is invalid');
            }
        },
        parseElementFromTemplate: function () {
            this.element = stringToDom(this.get('template'));
        },

        /**
         * 讲element插入到父节点中
         * @returns {Widget}
         */
        render: function () {

            if (!this.rendered) {
                this.rendered = true;
            }

            var parentNode = this.get('parentNode');

            if (parentNode && !lib.isInDocument(this.element)) {
                parentNode.appendChild(this.element);
            }

            return this;
        }
    });


    function stringToDom(str) {
        var div = document.createElement('div');
        if (typeof str === 'string') {
            div.innerHTML = str;
        }
        return div.firstChild;
    }

    return Widget;
});