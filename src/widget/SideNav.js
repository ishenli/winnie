/**
 * @file 侧边导航
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Widget = require('./Widget');
    var Blink = require('./sideNav/blink');
    var Normal = require('./sideNav/normal');
    var lib = require('../lib');
    var util = require('../lib/util');

    /**
     * @constructor
     * @extends module:Widget
     * @requires Widget
     * @requires lib
     * @exports SideNav
     * @example
     *   new SideNav({
     *       element:'#j-side-nav',
     *       effect:'normal',
     *       easing:'ease-in',
     *       when:{
     *          type:1
     *       }
     *       showAlways:true,
     *       map:{
     *          enable:true,
     *          rule:{
     *             '.nav-item-1' : '.section-news',
     *             '.nav-item-2' : '.section-xinyou',
     *             '.nav-item-3' : '.section-girl',
     *             '.nav-item-4' : '.section-video',
     *          }
     *       }
     *
     *   });
     */
    var SideNav = Widget.extend({
        /**
         * 控件标识
         * @override
         * @private
         */
        type: 'SideNav',
        /**
         * 控件配置项
         *
         * @name module:SideNav#options
         * @property {HTMLElement|string} element 控件标识
         * @property {HTMLElement|string} top 回到顶部的节点
         * @property {string} [effect='normal'] 出现效果，有normal，fade
         * @property {number} [duration=600] 延迟毫秒数
         * @property {number} [throttle=100]  阀流
         * @property {boolean} [sticky=false]  是否悬浮固定
         * @property {boolean} [showAlways=false]  是否永远显示在页面上
         * @property {Object} [map]  映射对象
         * @property {boolean} map.enable  是否启用map
         * @property {string} [map.currentPanelClass='ui-panel-current']  选中面板的添加class
         * @property {string} [map.currentNavClass='ui-panel-current']  选中导航的添加class
         * @property {number} [map.gap=0]  选中面板到场口顶部的距离
         * @property {number} [map.proportion=0.8]  隐藏区域的比例，超过该区域即切换选中导航
         * @property {Object} [when]  出现形式的配置
         * @property {number} [when.top]  内容滚动到距离窗口顶部一定的距离
         * @property {string} [when.type=1]  内容的出现形式,共分为4种，具体可看代码注释
         * @property {HTMLElement|string} [when.node=null]  内容滚动到某个节点出现
         */
        options: {

            /**
             * 出现的效果
             * 1.normal
             * 2.fade
             * 3.zoom
             */
            effect: 'normal',

            duration: {
                value: 600,
                getter: function (val) {
                    return val / 1000 + 's';
                }
            },

            throttle: 1000,

            top: {
                node: '.j-back-top'
            },

            /**
             * 出场的动画函数
             */
            easing: 'ease-out',
            /**
             * 什么时候出现sideNav
             */
            when: {
                top: 300,

                // 内容滚动到这个节点出现sideNav
                node: '',
                /**
                 * type = 1: 滚动到固定高度后出场, 依赖 top 参数
                 * type = 2: 滚动到指定节点开始出现后出场, 依赖 node 参数
                 * type = 3: 过一段时间后出场, 依赖 delay 参数
                 * type = 4: 滚动到指定节点开始被卷去的时候出场, 依赖 node 参数
                 */
                type: 1
            },

            /**
             * 是否悬浮固定
             * @{type} boolean
             */
            sticky: false,
            /**
             * 一直显示
             */
            showAlways: false,
            /**
             * 内容与导航的映射规则
             */
            map: {
                enable: false,
                currentPanelClass: 'mp-panel-current',
                currentNavClass: 'mp-nav-current',
                // 转移到选中块的距离
                gap: 0,

                // 隐藏区域的比例
                proportion: 0.8,
                // 映射规则，基本设计为一个key-value
                // 提示：map内的顺序需与页面结构保持一致，否则会出现滚动的室bug
                rule: {}
            }
        },
        init: function () {
            this._initDom();
            this._initEvent();
            this._initAnim();
            this._initWhen();
            this._initReset();
        },
        _initDom: function () {
            var me = this;
            this.$window = window;

            // 为了控制动画效果，添加一层wrap容器
            var wrapperNode = lib.create('<div class="mp-sidenav-cnt-wrap"></div>');

            lib.wrapInner(this.element, wrapperNode);


            this.navNodeWrap = lib.get('.mp-sidenav-cnt-wrap', this.element);

            if (!this.get('showAlways')) {
                // 获取sideNav的宽高
                this.navHeight = lib.height(this.element);
                this.navWidth = lib.width(this.element);

                lib.css(this.navNodeWrap, {
                    'position': 'absolute',
                    'left': '0',
                    'right': '0',
                    'top': '0',
                    'bottom': '0',
                    'margin': 'auto',
                    'display': 'none',
                    'height': this.navHeight,
                    'width': this.navWidth
                });

                lib.css(this.element, {
                    'display': 'block',
                    'overflow': 'visible',
                    'width': this.navWidth,
                    'height': this.navHeight
                });
            }

            if (this.get('map').enable) {
                this.navNodes = [];
                this.panelNodes = [];

                util.each(this.get('map').rule, function (value, key) {
                    var domKey = lib.get(key, me.element);
                    var domValue = lib.get(value);
                    if (domKey && domValue) {
                        me.navNodes.push(domKey);
                        me.panelNodes.push(domValue);
                    }
                });
            }

            // 获取两个节点
            this.whenElement = lib.get(this.get('when').node);
            this.topElement = lib.get(this.get('top').node);

        },
        /**
         * 初始化事件
         * @private
         */
        _initEvent: function () {
            var me = this;
            this.delayFun = util.throttle(this._scrollCallback, this.get('throttle'));

            // 绑定作用域到实例
            lib.on(this.$window, 'scroll', util.bind(this.delayFun, this));

            if (this.topElement) {
                lib.on(this.topElement, 'click', function (e) {
                    e.preventDefault();
                    me.$window.scrollTo(0, 0);
                });
            }

            if (this.get('map').enable) {
                var self = this;
                // 绑定事件
                util.each(me.navNodes, function (node, i) {
                    lib.on(node, 'click', function (e) {
                        e.preventDefault();
                        var panel = me.panelNodes[i];
                        var top = lib.getPosition(panel).top;
                        me.isScrolling = true;
                        me.$window.scrollTo(0, top + self.get('map').gap);
                        me.isScrolling = false;
                        // 变换导航的状态
                        var curNavCls = me.get('map').currentNavClass;
                        var curPanelCls = me.get('map').currentPanelClass;
                        lib.removeClass('.' + curNavCls, curNavCls);
                        lib.removeClass('.' + curPanelCls, curPanelCls);
                        lib.addClass(this, curNavCls);
                        lib.addClass(panel, curPanelCls);
                    });
                });
            }

            //是否支持sticky的功能
            if (this.get('sticky')) {
                this._initSticky();
            }
        },

        /**
         * 滚动回调函数
         * @private
         */
        _scrollCallback: function () {
            var me = this;

            // 如果正在滚动中，则不触发滚动回调
            if (me.isScrolling) {
                return;
            }
            var dir = 0;

            var scroll = lib.getScrollTop();

            // 滚动一定的距离出现sideNav
            if (!me.get('showAlways')) {
                if (me.get('when').type !== 3) {
                    if (me.get('when').type === 1) {
                        dir = me.get('when').top;
                    }

                    //  滚到指定节点出现后显示
                    if (me.get('when').type === 2) {
                        dir = lib.getPosition(me.whenElement).top - lib.height(me.$window);
                    }

                    if (scroll > dir) {
                        me.show();
                    }
                    else {
                        me.hide();
                    }
                }

            }

            // dom节点可能会被修改，所以每次滚动map重新走一遍
            if (me.get('map').enable) {
                // navNode的点击和panelNodes的点击对应起来
                // 这里有个细节，就是滚动的距离和序列线性的关系，所以获取边界值需要遍历
                // 窗口内可能出现多个panel，需要选中最上方的panel,
                var minDif = 9999;
                var targetIndex = 0;
                var maxTop = 0;
                var maxIndex = 0;
                var minTop = 9999;
                var minIndex = 0;

                var gap = this.get('map').gap;
                util.each(me.panelNodes, function (item, i) {
                    var top = lib.getPosition(item).top;
                    var eleHeight = lib.height(item);

                    // 元素距离窗口顶部的距离，如果>=0，元素的头部在窗口的上方
                    // 即滚动的高度 > 元素距离文档顶部的距离
                    var difToWinTop = scroll - top - gap;

                    // Math.abs(difToWinTop)越小，表示距离窗口最近
//                    if (difToWinTop >= 0 && difToWinTop <= minDif) {
                    if (difToWinTop >= 0 && difToWinTop <= minDif) {
                        minDif = difToWinTop;

                        // 如果不在可视区域内的距离超过超过panel高度的proportion
                        if (difToWinTop > eleHeight * me.get('map').proportion) {
                            targetIndex = Math.min(i + 1, me.panelNodes.length - 1);
                        }
                        else {
                            targetIndex = i;
                        }
                    }

                    //最下方的节点
                    if (maxTop <= top) {
                        maxTop = top;
                        maxIndex = i;
                    }

                    //最上方的节点
                    if (minTop >= top) {
                        minTop = top;
                        minIndex = i;
                    }

                });

                var maxNode = me.panelNodes[maxIndex];
                var minNode = me.panelNodes[minIndex];

                // panel最底部
                var panelBottom = lib.height(maxNode) + lib.getPosition(maxNode).top;
                var panelTop = lib.getPosition(minNode).top - lib.height(me.$window);

                // 修改对应的样式
                var curNavCls = me.get('map').currentNavClass;
                var curPanelCls = me.get('map').currentPanelClass;

                lib.removeClass('.' + curNavCls, curNavCls);
                lib.removeClass('.' + curPanelCls, curPanelCls);

                if (scroll < panelBottom && scroll > panelTop) {
                    lib.addClass(me.navNodes[targetIndex], curNavCls);
                    lib.addClass(me.panelNodes[targetIndex], curPanelCls);
                }

            }

            return true;

        },
        _initAnim: function () {

            var effect = this.get('effect');

            if (effect === 'normal') {
                this.anim = Normal;
            }

            else if (effect === 'blink') {
                this.anim = Blink;
            }

        },
        _initReset: function () {
            this.anim.reset(this);
        },
        /**
         * 啥时候出现,在when.type=3调用
         * @private
         */
        _initWhen: function () {

            var me = this;
            if (this.get('when').type === 3) {
                util.delay(function () {
                    me.show();
                }, this.get('when').delay);
            }

        },

        /**
         * 支持导航栏悬浮固定
         * @private
         */
        _initSticky: function () {
            var scrollTop = lib.getPosition(this.element).top;
            var self = this;
            this.stickyFun = util.throttle(function () {
                var option = lib.getScrollTop() > scrollTop
                    ? 'addClass' : 'removeClass';
                lib[option](self.element, 'mp-sticky');

            }, self.get('throttle'));

            lib.on(this.$window, 'scroll', this.stickyFun);
        },
        /**
         * 出现
         */
        show: function () {
            this.anim.show(this);
        },

        /**
         * 隐藏
         */
        hide: function () {
            this.anim.hide(this);
        },

        /**
         * 销毁，解除window的滚动监听函数
         */
        dispose: function () {
            lib.off(this.$window, 'scroll', this.delayFun);
            lib.off(this.$window, 'scroll', this.stickyFun);
            this.options = this.anim = null;
            SideNav.superClass.dispose.call(this);
        }
    });

    return SideNav;
});
