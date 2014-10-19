/**
 * @file 基础浮层组件，提供浮层显示隐藏、定位和窗口 resize 时重新定位
 * 点击页面空白处浮层消失等等特性，是所有浮层类组件的基类。
 * @author shenli
 */
define(function (require) {

    var lib = require('../lib');
    var Widget = require('./Widget');
    var Position = require('./Position');

    /**
     * @constructor
     * @extends module:Widget
     * @requires Widget
     * @requires jQuery
     * @requires Mask
     * @exports Overlay
     */

    var Overlay = Widget.extend({
        type: 'Overlay',
        /**
         * 控件配置项
         * @name options
         * @name module:Overlay#options
         * @property {string} options.width  浮层宽度
         * @property {string} options.height  浮层高度
         * @property {Object} options.align 默认定位信息,参照Position.pin接口
         * @property {number} options.delay hover出现的延迟
         * @property {boolean} options.visible 是否可见
         * @property {HTMLElement} options.parentNode 父类节点
         */
        options: {
            width: '500px',
            height: '500px',
            visible: false,
            zIndex: 99,
            align: {
                //  element 的定位点，默认为左上角
                selfXY: [0, 0],
                //  基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                //  基准定位元素的定位点，默认为左上角
                baseXY: [0, 0]
            },
            parentNode: document.body

        },
        /**
         * 显示浮层，会调用render方法
         * @returns {Overlay}
         */
        show: function () {
            if (!this.rendered) {
                this.render();
            }
            this.set('visible', true);
            // 重新计算定位
            this._setPosition();

            return this;
        },
        /**
         * 隐藏浮层
         * @returns {Overlay}
         */
        hide: function () {

            if (!this.rendered) {
                return this;
            }
            this.set('visible', false);
            return this;
        },
        init: function () {

            // 用户计算window resize的定位计算
            Overlay.allOverlays.push(this);

            this.after('render', function () {

                this.element.css({
                    width: this.get('width'),
                    height: this.get('height'),
                    zIndex: this.get('zIndex')
                });

                // 首先将元素hide
                var position = this.element.css('position');
                if (position === 'static' || position === 'relative') {
                    this.element.css({
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px'
                    });
                }

            });

            this.after('show', function () {
                this._setPosition();
            });
        },
        /**
         * 销毁
         */
        dispose: function () {
            lib.earse(this, Overlay.allOverlays);
            return Overlay.superclass.dispose.call(this);
        },

        /**
         * 计算浮层的位置
         * @param {Object} align 定位信息，参见Position
         * @see Position
         * @returns {Overlay}
         * @private
         */
        _setPosition: function (align) {

            if (!lib.isInDocument(this.element[0])) {
                return;
            }

            align || (align = this.get('align'));
            if (!align) {
                return;
            }

            // 如果起先是隐藏的
            var isHidden = this.element.css('display') === 'none';


            if (isHidden) {
                // 放入文档流中，但不可见
                this.element.css({
                    visibility: 'hidden',
                    display: 'block'
                });
            }

            // 进行定位计算
            Position.pin({
                element: this.element,
                x: align.selfXY[0],
                y: align.selfXY[1]
            }, {
                element: align.baseElement,
                x: align.baseXY[0],
                y: align.baseXY[1]
            });

            // 重新可见
            if (isHidden) {
                this.element.css({
                    visibility: 'visible'
                });
            }

            // 触发resize事件
            this.fire('resize');

            return this;
        },
        /**
         * visible 属性变化时触发的事件
         * @param {boolean} val
         * @private
         */
        _onRenderVisible:function(val) {
            this.element[val ? 'show' :'hide']();
        },
        /**
         * arr 元素数组，表示点击到这些元素上浮层不消失,需要手动调用
         * @param {HTMLElement[]} arr 元素数组
         */
        blurHide: function (arr) {
            arr.push(this.element);
            this._relativeElements = arr;
            Overlay.blurOverlays.push(this);
        }

    });

    // 存放浮层的实例
    Overlay.blurOverlays = [];

    $(document).on('click', function (e) {
        hideBlurOverlays(e);
    });


    // window resize 重新计算浮层
    var winHeight = $(window).height();
    var winWidth = $(window).width();

    Overlay.allOverlays = [];

    /**
     * 重新绘制函数resize
     */
    var resizeFun = lib.debounce(function () {
        var winNewHeight = $(window).height();
        var winNewWidth = $(window).width();

        if (winNewHeight !== winHeight || winNewWidth !== winWidth) {
            $.each(Overlay.allOverlays, function (i, item) {
                if (!item || !item.get('visible')) {
                    return;
                }
                item._setPosition();
            });
        }
        winWidth = winNewWidth;
        winHeight = winNewHeight;
    }, 200);

    $(window).on('resize', resizeFun);


    /**
     * 点击空白区域关闭浮层
     * @param {Object} e 事件对象
     */
    function hideBlurOverlays(e) {
        // blurOverlays 存放的浮层的实例
        $.each(Overlay.blurOverlays, function (index, item) {
            //  当实例为空或隐藏时，不处理
            if (!item || !item.get('visible')) {
                return;
            }
            //  遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理,如关闭的按钮
            for (var i = 0; i < item._relativeElements.length; i++) {
                var el = item._relativeElements[i];
                if (el === e.target || $.contains(el, e.target)) {
                    return;
                }
            }

            //  到这里，判断触发了元素 事件，隐藏元素
            item.hide();
        });
    }

    return Overlay;
});
