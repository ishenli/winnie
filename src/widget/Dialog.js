/**
 * @file Dialog
 * @author ishenli
 */
define(function (require) {

    var Overlay = require('./Overlay');
    var Mask = require('./Mask');
    var lib = require('../lib');
    var templateAble = require('./templateable');

    /**
     * @constructor
     * @extends module:Widget
     * @exports Dialog
     * @example
     *   new Dialog({
     *       element: '#j-tab-yeyou',
     *       container:'#j-tab-yeyou-ct',
     *   });
     */
    var Dialog = Overlay.extend({
        type: 'Dialog',

        Implements: [templateAble],

        /**
         * 控件配置项
         * @name options
         * @type {Object}
         * @property {string} options.classPrefix  样式前缀
         * @property {string} options.noScrollClass 去掉滚动条的样式
         * @property {boolean} options.hasMask 是否显示遮罩
         * @property {string} options.closeTpl 关闭文本
         * @property {string} options.content 内容选择器
         * @property {string} options.height 高度,默认100%
         * @property {string} options.imageTpl 默认的图片框架模板
         * @property {string} options.content album的内容节点
         * @property {Object} options.align 定位
         * @property {string} options.trigger 触发选择器
         * @property {string} options.closeTrigger 关闭选择器
         * @property {string} options.origin 图片的真实地址
         * @property {string} options.template 嵌入的模板
         * @private
         */
        options: {
            //  统一样式前缀

            classPrefix: 'ui-dialog',
            noScrollClass: {
                value: '',
                getter: function () {
                    return this.get('classPrefix') + '-no-scroll';
                }
            },
            hasMask: true,
            closeTpl: 'x',
            content: '',
            height: '100%',
            effect: 'none',
            // 默认定位
            align: {
                value: {
                    selfXY: ['50%', '50%'],
                    baseXY: ['50%', '50%']
                }
            },
            trigger: '',
            closeTrigger: '.j-dialog-close',
            template: require('./dialog/template')
        },
        /**
         * 初始化
         */
        init: function () {

            Dialog.superClass.init.call(this);

            this._initTriggers();

            this.parseElement();

            // 设置mask
            this._initMask();
        },

        /**
         * 重写父类的parseElement方法
         */
        parseElement: function () {

            this.set('model', {
                classPrefix: this.get('classPrefix')
            });

            // 利用模板解析元素
            Dialog.superClass.parseElement.call(this);

            this._renderContent();
        },
        show: function () {
            Dialog.superClass.show.call(this);
            return this;

        },
        hide: function () {
            Dialog.superClass.hide.call(this);
            return this;
        },

        dispose: function () {
            this._hideMask();
            return Dialog.superClass.dispose.call(this);
        },
        /**
         * 初始化交互事件
         * @private
         */
        _initTriggers: function () {
            var that = this;
            var $doc = document;

            // 委托open
            lib.on($doc, 'click', that.get('trigger'), function (e) {
                e.preventDefault();
                that.activeTrigger = e.currentTarget;
                that.show();
            });

            // 委托close
            lib.on($doc, 'click', that.get('closeTrigger'), function (e) {
                e.preventDefault();
                that.hide();
            });
        },

        /**
         * 初始化遮罩层
         * @private
         */
        _initMask: function () {

            var that = this;
            //  存放 mask 对应的对话框
            Mask._dialogs = Mask._dialogs || [];

            this.after('show', function () {

                if (!this.get('hasMask')) {
                    return;
                }
                Mask.set('zIndex', that.get('zIndex')).show();
                // 将mask节点放在dialog节点前面

                lib.before(that.element, Mask.element);

                // 去掉滚动条的滚动效果
                lib.addClass('body,html', this.get('noScrollClass'));
                //  避免重复存放
                var existed = false;
                for (var i = 0; i < Mask._dialogs.length; i++) {
                    if (Mask._dialogs[i] === that) {
                        existed = true;
                    }
                }
                //  依次存放对应的对话框
                if (!existed) {
                    Mask._dialogs.push(that);
                }

            });

            this.after('hide', this._hideMask);
        },
        /**
         * 隐藏遮罩
         * @private
         */
        _hideMask: function () {
            if (!this.get('hasMask')) {
                return;
            }
            Mask.hide();
            lib.removeClass('body,html', this.get('noScrollClass'));

        },
        /**
         * 渲染dialog的内容,内容容器节点是[data-role=content]
         * @returns {*}
         * @private
         */
        _renderContent: function () {
            var wrap = lib.get('[data-role=content]',this.element);

            if (!wrap) {
                return;
            }

            this.contentBox = wrap;

            lib.css(this.contentBox,{
                height: '100%',
                zoom: 1
            });

            var content = this.get('content');

            if (content.nodeType) {
                this.contentBox.appendChild(content);
            }
            else {
                this.contentBox.innerHTML = content
            }

        }
    });
    return Dialog;
});
