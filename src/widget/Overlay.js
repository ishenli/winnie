/**
 * @file 基础浮层组件，提供浮层显示隐藏、定位和窗口 resize 时重新定位
 * 点击页面空白处浮层消失等等特性，是所有浮层类组件的基类。
 * @author shenli
 */
define(function (require) {

    var lib = require('../lib');
    var util = require('../lib/util');
    var Widget = require('./Widget');
    var Position = require('./Position');
    var WIN = window;

    /**
     * @constructor
     * @extends module:Widget
     * @requires Widget
     * @requires jQuery
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

                lib.setStyle(this.element, {
                    width: this.get('width'),
                    height: this.get('height'),
                    zIndex: this.get('zIndex')
                });

                // 首先将元素hide
                var position = lib.getStyle(this.element, 'position');

                if (position === 'static' || position === 'relative') {
                    lib.setStyle(this.element,{
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
            // 销毁两个静态数组中的实例
            util.erase(this, Overlay.allOverlays);
            util.erase(this, Overlay.blurOverlays);
            return Overlay.superClass.dispose.call(this);
        },

        /**
         * 计算浮层的位置
         * @param {Object} align 定位信息，参见Position
         * @see Position
         * @returns {Overlay}
         * @private
         */
        _setPosition: function (align) {

            if (!lib.isInDocument(this.element)) {
                return;
            }

            align || (align = this.get('align'));
            if (!align) {
                return;
            }

            // 如果起先是隐藏的
            var isHidden = lib.getStyle(this.element, 'display') === 'none';


            if (isHidden) {
                // 放入文档流中，但不可见
                lib.setStyle(this.element,{
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

            // 还原
            if (isHidden) {
                lib.setStyle(this.element,{
                    visibility: '',
                    display:'none'
                });
            }

            return this;
        },
        /**
         * visible 属性变化时触发的事件
         * @param {boolean} val
         * @private
         */
        _onRenderVisible:function(val) {
            lib[val ? 'show' :'hide'](this.element);
        },

        // 用于 set 属性后的界面更新
        _onRenderWidth: function (val) {
           lib.css(this.element, 'width', val);
        },

        _onRenderHeight: function (val) {
           lib.css(this.element, 'height', val);
        },

        _onRenderZIndex: function (val) {
           lib.css(this.element, 'zIndex', val);
        },

        _onRenderAlign: function (val) {
            this._setPosition(val);
        },
        /**
         * arr 元素数组，表示点击到这些元素上浮层不消失,需要手动调用
         * @param {HTMLElement[]} arr 元素数组
         */
        blurHide: function (arr) {
            arr = util.makeArray(arr);
            arr.push(this.element);
            this._relativeElements = arr;
            Overlay.blurOverlays.push(this);
        }

    });

    // 存放浮层的实例
    Overlay.blurOverlays = [];

    lib.on(document,'click', function (e) {
        hideBlurOverlays(e);
    });


    // window resize 重新计算浮层
    var winHeight = lib.height(WIN);
    var winWidth = lib.width(WIN);

    Overlay.allOverlays = [];

    /**
     * 重新绘制函数resize
     */
    var resizeFun = util.debounce(function () {
        var winNewHeight = lib.height(WIN);
        var winNewWidth = lib.width(WIN);

        if (winNewHeight !== winHeight || winNewWidth !== winWidth) {
            util.each(Overlay.allOverlays, function (item, i) {
                if (!item || !item.get('visible')) {
                    return;
                }
                item._setPosition();
            });
        }
        winWidth = winNewWidth;
        winHeight = winNewHeight;
    }, 200);

    lib.on(window ,'resize', resizeFun);


    /**
     * 点击空白区域关闭浮层
     * @param {Object} e 事件对象
     */
    function hideBlurOverlays(e) {
        // blurOverlays 存放的浮层的实例
        util.each(Overlay.blurOverlays, function (item, index) {
            //  当实例为空或隐藏时，不处理
            if (!item || !item.get('visible')) {
                return;
            }
            //  遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理,如关闭的按钮
            for (var i = 0; i < item._relativeElements.length; i++) {
                var el = item._relativeElements[i];
                if (el === e.target || lib.contains(el, e.target)) {
                    return;
                }
            }

            //  到这里，判断触发了元素 事件，隐藏元素
            item.hide();
        });
    }

    return Overlay;
});
