/**
 * @file 侧边导航
 * @author shenli （meshenli@gmail.com）
 */

define(function (require) {

    var Widget = require('./Widget');
    var u = require('underscore');
    var lib = require('winnie/lib');

    var Blink = require('./sideNav/blink');
    var Normal = require('./sideNav/normal');

    var SideNav = Widget.extend({
        type:'SideNav',
        options: {

            /**
             * 出现的效果
             * 1.normal
             * 2.fade
             * 3.zoom
             * 4.rotate
             * 5.blur
             */
            effect: 'blink',

            duration: {
                value: 600,
                getter: function (val) {
                    return val / 1000 + 's';
                }
            },

            throttle: 500,

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

                //内容滚动到这个节点出现sideNav
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
             * 内容与导航的映射规则
             */
            map: {
                enable: false,
                currentPanelClass: 'ui-panel-current',
                currentNavClass: 'ui-nav-current',
                //映射规则，基本设计为一个key-value
                rule: {
                    '.nav-item-1': '.section-1',
                    '.nav-item-2': '.section-2',
                    '.nav-item-3': '.section-3',
                    '.nav-item-4': '.section-4',
                    '.nav-item-5': '.section-5'
                }
            }
        },
        init: function () {
            this._initSideNav();
            this._initEvent();
            this._initAnim();
            this._initReset();
            this._initWhen();
        },
        _initSideNav: function () {

            var me = this;

            //获取sideNav的宽高
            var wh = lib.getSize(this.element);
            this.navHeight = wh.height + 'px';
            this.navWidth = wh.width + 'px';

            //为了控制动画效果，添加一层wrap容器
            var wrap = document.createElement('div');
            lib.addClass(wrap, 'ui-nav-cnt-wrap');

            this.navNodeWrap = wrap;

            lib.wrap(wrap, this.element.childNodes);

            lib.setStyle(wrap, {
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

            lib.setStyle(this.element, {
                'display':'block',
                'overflow': 'visible',
                'width': this.navWidth,
                'height': this.navHeight
            });

            if (this.get('map').enable) {
                this.navNodes = [];
                this.panelNodes = [];
                u.each(this.get('map').rule, function (value, key) {
                    var domKey = lib.query(key),
                        domValue = lib.query(value);
                    if (domKey && domValue) {
                        me.navNodes.push(domKey);
                        me.panelNodes.push(domValue);
                    }
                })
            }

            //获取两个节点
            this.whenElement = lib.query(this.get('when').node);
            this.topElement = lib.query(this.get('top').node);
        },
        _initEvent: function () {
            this.delayFun = u.throttle(this._scrollCallback, this.get('throttle'));

            //绑定作用域到实例
            lib.on(window, 'scroll', this.delayFun, this);

            if (this.topElement) {
                lib.on(this.topElement, 'click', function (e) {
                    lib.preventDefault(e);
                    window.scrollTo(0, 0);
                });
            }

            if (this.get('map').enable) {
                //绑定事件
                var me = this;
                u.each(this.navNodes, function (node, i) {
                    lib.on(node, 'click', function (e) {

                        lib.preventDefault(e);

                        var panel = me.panelNodes[i],
                            top = lib.getPosition(panel).top;
                        window.scrollTo(0, top);


                        //修改对应的样式
                        var curNavCls = me.get('map').currentNavClass;
                        var curPanelCls = me.get('map').currentPanelClass;
                        lib.removeClass(lib.query('.' + curNavCls), curNavCls);
                        lib.removeClass(lib.query('.' + curPanelCls), curPanelCls);

                        lib.addClass(this, curNavCls);
                        lib.addClass(panel, curPanelCls);
                    });
                });
            }
        },

        /**
         * 滚动回调函数
         * @private
         */
        _scrollCallback: function () {

            var dir = 0;

            var scroll = lib.getScrollTop();

            //滚动一定的距离出现sideNav
            if (this.get('when').type !== 3) {
                if (this.get('when').type === 1) {
                    dir = this.get('when').top;
                }

                // 滚到指定节点出现后显示
                if (this.get('when').type === 2) {
                    dir = lib.getPosition(this.whenElement).top - lib.getViewHeight();
                }

                if (scroll > dir) {
                    this.show();
                } else {
                    this.hide();
                }
            }

            //dom节点可能会被修改，所以每次滚动map重新走一遍
            if (this.get('map').enable) {
                //讲navNode的点击和panelNodes的点击对应起来
                //这里有个细节，就是滚动的距离和序列线性的关系，所以获取边界值需要遍历
                //同事窗口内可能出现多个panel，需要选中最上方的panel,
                var minDif = 9999,
                    targetIndex = 0,
                    maxTop = 0,
                    maxIndex = 0,
                    minTop = 9999,
                    minIndex = 0;

                u.each(this.panelNodes, function (item, i) {

                    var top = lib.getPosition(item).top,

                    //元素距离窗口顶部的距离，如果>=0，元素在窗口的上方
                        difToWinTop = scroll - top;

                    //Math.abs(difToWinTop)越小，表示距离窗口最近
                    if (difToWinTop >= 0 && Math.abs(difToWinTop) <= minDif) {
                        minDif = Math.abs(difToWinTop);
                        targetIndex = i;
                    }

                    if (maxTop <= top) {
                        maxTop = top;
                        maxIndex = i;
                    }

                    if (minTop >= top) {
                        minTop = top;
                        minIndex = i;
                    }

                });

                var maxNode = this.panelNodes[maxIndex],
                    minNode = this.panelNodes[minIndex],

                //panel最底部
                    panelBottom = maxNode.clientHeight + lib.getPosition(maxNode).top,
                    panelTop = lib.getPosition(minNode).top - lib.getViewHeight();

                //修改对应的样式
                var curNavCls = this.get('map').currentNavClass;
                var curPanelCls = this.get('map').currentPanelClass;
                lib.removeClass(lib.query('.' + curNavCls), curNavCls);
                lib.removeClass(lib.query('.' + curPanelCls), curPanelCls);

                if (scroll < panelBottom && scroll > panelTop) {
                    lib.addClass(this.navNodes[targetIndex], curNavCls);
                    lib.addClass(this.panelNodes[targetIndex], curPanelCls);
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
                u.delay(function () {
                    me.show();
                }, this.get('when').delay);
            }

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

        dispose: function () {
            lib.un(window, 'scroll', this.delayFun, true);
            this.options = this.anim = null;
            return SideNav.superClass.dispose.call(this);
        }
    });

    return SideNav;
});