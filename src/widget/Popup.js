/**
 * @file Popup
 * @author ishenli
 */
define(function (require) {

    var lib = require('../lib');
    var util = require('../lib/util');
    var Overlay = require('./Overlay');
    var Mask = require('./Mask');
    var templateAble = require('./templateable');

    /**
     * @constructor
     * @extends module:Overlay
     * @requires Overlay
     * @requires jQuery
     * @requires Mask
     * @exports Popup
     * @example
     * new Popup ({
     *      element: '#popup',
     *      trigger: '#j-gift-btn',
     *      delegateNode:document,
     *      triggerType:'click',
     *      align:{
     *          baseElement:Position.ViEWPORT,
     *          baseXY:['50%', '50%'],
     *          selfXY: ['50%', '50%']
     *      }
     * });
     */

    var Popup = Overlay.extend({

        type: 'Popup',

        Implements: [templateAble],

        /**
         * 控件配置项
         * @name options
         * @name module:Popup#options
         * @property {string} options.trigger  触发元素
         * @property {string} options.width  浮层宽度
         * @property {string} options.height  浮层高度
         * @property {string} options.triggerType  触发类型{hover|click|focus}
         * @property {string} options.delegateNode 委托元素
         * @property {Object} options.align 默认定位信息,参照Position.pin接口
         * @property {number} options.delay hover出现的延迟
         */
        options: {
            width: '',
            height: '',
            trigger: {
                value: null,
                getter: function (val) {
                    return lib.get(val);
                }
            },
            triggerType: 'hover',

            //委托的父元素
            delegateNode: {
                value: null,
                getter: function (val) {
                    return lib.get(val);
                }
            },
            align: {
                baseXY: [0, '100%'],
                selfXY: [0, 0],
                setter: function (val) {
                    if (!val) {
                        return;
                    }
                    if (val.baseElement) {
                        this._specifiedBaseElement = true;
                    }
                    else if (this.activeTrigger) {
                        val.baseElement = this.activeTrigger;
                    }
                    return val;
                },
                getter: function (val) {
                    return util.extend({}, val, this._specifiedBaseElement ? {} : {
                        baseElement: this.activeTrigger
                    });
                }
            },
            // 是否能够触发
            disabled:false,
            delay: 70,
            effect:'none',
            template: require('./dialog/template')

        },
        /**
         * 初始化
         * @private
         */
        init: function () {

            Popup.superClass.init.call(this);

            this._initTriggers();

            this.blurHide(this.get('trigger'));

            this.activeTrigger = this.get('trigger');

            var self = this;

            // 委托的节点没有在_relativeElements中，需要重新添加
            if (this.get('delegateNode')) {
                self.before('show', function () {
                    self._relativeElements = self.get('trigger');
                    self._relativeElements.push(self.element);
                });
            }
        },
        /**
         * 销毁
         */
        dispose: function () {
            lib.off(this.element);
            Popup.superClass.dispose.call(this);

        },
        /**
         * 重写父类的render方法
         */
        render: function () {

            Popup.superClass.render.call(this);
            return this;
        },

        /**
         * 显示Popup
         */
        show: function () {
            if(this.get('disabled')) {
                return;
            }
            return Popup.superClass.show.call(this);
        },

        /**
         * 显示Popup
         */
        hide: function () {
            return Popup.superClass.hide.call(this);
        },
        /**
         * 对触发元素绑定事件
         * @private
         */
        _initTriggers: function () {
            var triggerType = this.get('triggerType');
            if (triggerType === 'click') {
                this._bindClick();
            }
            else {
                this._bindHover();
            }
        },
        /**
         * 绑定trigger的点击事件
         * @private
         */
        _bindClick: function () {
            var self = this;
            bindEvent('click', this.get('trigger'), function (e) {
                //e.stopPropagation();
                // this为trigger的元素
                // 已经在页面中显示出来了
                if (this._active === true) {
                    self.hide();
                }
                else {
                    makeActive(this);
                    self.show();
                }
            }, self.get('delegateNode'), this);


            this.before('hide', function () {
                makeActive();
            });

            function makeActive(trigger) {

                if(self.get('disabled')) {
                    return;
                }

                var item = self.get('trigger');
                if (trigger === self.get('trigger')) {
                    item._active = true;
                    self.activeTrigger = item;
                }
                else {
                    item._active = false;
                }
            }
        },
        /**
         * 绑定hover
         * @private
         */
        _bindHover: function () {
            var self = this;
            var trigger = self.get('trigger');
            var delegateNode = self.get('delegateNode');
            var delay = self.get('delay');
            var showTimer;
            var hideTimer;

            bindEvent('mouseenter', trigger, function () {
                clearTimeout(hideTimer);
                hideTimer = null;
                self.activeTrigger = lib.get(this);
                showTimer = setTimeout(function () {
                    self.show();
                }, delay);
            }, delegateNode, this);

            bindEvent('mouseleave', trigger, leaveHandler, delegateNode, this);

            //移到浮层上不消失
            this.delegateEvents('mouseenter', function () {
                clearTimeout(hideTimer);
            });

            this.delegateEvents('mouseleave', leaveHandler);

            function leaveHandler() {
                clearTimeout(showTimer);
                showTimer = null;
                if (self.get('visible')) {
                    hideTimer = setTimeout(function () {
                        self.hide();
                    }, delay);
                }
            }
        },
        /**
         * visible 属性变化的时候触发该事件
         * @param {boolean} val
         * @param {boolean} prev
         * @private
         */
        _onRenderVisible: function (val, prev) {
            if (val === !!prev) {
                return;
            }

            var fade = (this.get('effect').indexOf('fade') !== -1);
            var self = this;
            var animConfig = {};

            // fade效果
            fade && (animConfig.opacity = (val ? 'show' : 'hide'));

            var hideComplete = val ? function () {
                self.fire('animated');
            } : function () {
                self.hide();
                self.fire('animated');
            };

            if (fade) {

                // 这里需要animated的模块
                /*this.element.stop(true, true)
                    .animate(animConfig, this.get('duration'), hideComplete)
                    .css({
                        'visibility': 'visible'
                    });*/
            } else {
                lib[val ? 'show' : 'hide'](this.element);
            }
        }

    });

    /**
     * 绑定事件
     * @param {string} type 事件类型
     * @param {jQuery} element 控件的element节点
     * @param {Function} fn 监听函数
     * @param {jQuery} delegateNode 委托的节点
     * @param {Popup} instance 实例
     */
    function bindEvent(type, element, fn, delegateNode, instance) {
        var hasDelegateNode = delegateNode;
        instance.delegateEvents(
            hasDelegateNode ? delegateNode : element,
            hasDelegateNode ? type + " " + element.selector : type,
            function (e) {
                fn.call(e.currentTarget, e);
            }
        );
    }

    return Popup;
});
