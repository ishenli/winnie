/**
 * @file 幻灯片,新增图片的延迟加载
 * @author  shenli<shenli03@baidu.com>
 */
define(function (require) {

    var $ = require('jquery');
    var Effects = require('./switchable/effects');
    var Autoplay = require('./switchable/autoplay');
    var Circular = require('./switchable/circular');
    var Widget = require('./Widget');


    /**
     * @constructor
     * @extends module:Widget
     * @requires Widget
     * @requires jQuery
     * @exports Switchable
     * @example
     *   new Switchable({
     *       element: '#j-tab-yeyou',
     *       container:'#j-tab-yeyou-ct',
     *       panels: '#j-tab-yeyou .item',
     *       prevBtn: '#j-carousel-yeyou [data-role="prev"]',
     *       nextBtn: '#j-carousel-yeyou [data-role="next"]',
     *       autoplay: true,
     *       step: 5,
     *       viewSize: [1000],
     *       effect: 'scrollx'
     *       activeTriggerClass: 'active'
     *   });
     */
    var Switchable = Widget.extend({
        type: 'Switchable',
        /**
         * 控件配置项
         *
         * @name module:Switchable#options
         * @property {(string | selector)} element 控件渲染容器,用于检测是否在可视区域
         * @property {(string | selector)} container 容器,left的值变化
         * @property {(string | selector)} prevBtn 向前翻页按钮
         * @property {(string | selector)} nextBtn 向后翻页按钮
         * @property {(string | selector)} panels  翻转面板项
         * @property {(string | selector)} triggers 切换的小点
         * @property {boolean} autoplay 是否自动播放，默认为true
         * @property {string} classPrefix 控件class前缀
         * @property {string} triggerType trigger的事件，默认hover
         * @property {boolean} circular 是否循环播放
         * @property {number} step 每次滚动的切换数目
         * @property {string} easing 切换效果，现在只支持最简单的切换,就是jquery自带的
         * @property {string} activeTriggerClass 高亮的trigger的class
         * @property {string} disabledBtnClass  禁用的按钮class
         * @property {number} viewSize  用于手动指定位移距离
         * @property {number} activeIndex  初始化面板
         * @property {number} interval  循环间隔
         * @property {number} duration  动画持续
         * @property {number} delay  再次启动的间隔
         * @private
         */
        options: {
            element: '',// 整个组件，用于检测是否在可视区域
            container: {
                getter: function (val) {
                    return $(val).eq(0);
                }
            },// 发生位移偏转的容器：left
            prevBtn: {
                getter: function (val) {
                    return $(val).eq(0);
                }
            },
            nextBtn: {
                getter: function (val) {
                    return $(val).eq(0);
                }
            },
            panels: {
                getter: function (val) {
                    return $(val);
                }
            },
            triggers: {
                getter: function (val) {
                    return $(val);
                }
            },
            showPanels: '',
            autoplay: false,
            classPrefix: 'mp',
            triggerType: 'hover',
            circular: true,
            step: 1,
            effect: 'none',
            easing: 'swing',
            activeTriggerClass: 'mp-active',
            disabledBtnClass: 'mp-btn-disable',
            length: {
                readOnly: true,
                getter: function () {
                    return Math.ceil(this.get('panels').length / this.get('step'));
                }
            },
            viewSize: [],// 手动指定位移
            activeIndex: 0,
            hasTriggers: false,
            interval: 5000,
            duration: 500,
            delay: 500,
            /**
             * 阀值，为正值则提前加载
             * 默认为当前视窗（容器）高度，（两屏以外的才加载）
             * @type {number}
             */
            threshold: 'default',
            urlName: 'data-src',
            lazyLoadImg: false

        },
        init: function () {
            this.set('showPanels', this.get('showPanels') || this.get('step'));
            // 支持无缝切换
            if (this.get('showPanels') !== this.get('step')) {
                this._cloneNode();
            }

            if (this.get('lazyLoadImg')) {
                this._counter = 0;
                this._imgLength = this.get('panels').find('img').length;
                this.$window = $(window);
                this._initLazyload();
            }
            else {
                this._loadImg = $.noop;
            }
            this.setup();
        },
        setup: function () {
            this._initPanels();
            this._bindTriggers();

            // 加载插件
            this._initPlugins();
        },
        _initPanels: function () {
            var panels = this.get('panels');
            if (panels.length === 0) {
                throw new Error('panels.length is ZERO');
            }
        },
        _bindTriggers: function () {
            var that = this;
            var triggers = this.get('triggers');
            var circular = this.get('circular');
            var len = this.get('length');

            // 获取内容长度，如果只有一个，则隐藏切换按钮
            if (len === 1) {
                this.get('prevBtn').hide();
                this.get('nextBtn').hide();
                return;
            }

            function focus(ev) {
                that._onFocusTrigger(ev.type, $(this).index());
            }

            function leave() {
                clearTimeout(that._switchTimer);
            }

            if (this.get('triggerType') === 'click') {
                triggers.click(focus);
            }
            //  hover
            else {
                triggers.hover(focus, leave);
            }

            this.get('prevBtn').click(function (ev) {
                ev.preventDefault();
                if (circular || that.get('activeIndex') > 0) {
                    that.prev();
                }
            });

            this.get('nextBtn').click(function (ev) {
                ev.preventDefault();
                var len = that.get('length') - 1;
                if (circular || that.get('activeIndex') < len) {
                    that.next();
                }
            });

            //  注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
            //  circular = true 时，无需处理
            if (!circular) {
                this.on('switch', function (args) {
                    that._updateButtonStatus(args.toIndex);
                });
            }
        },
        _updateButtonStatus: function (toIndex) {
            var prevBtn = this.get('prevBtn');
            var nextBtn = this.get('nextBtn');
            var disabledBtnClass = this.get('disabledBtnClass');

            prevBtn.removeClass(disabledBtnClass);
            nextBtn.removeClass(disabledBtnClass);

            if (toIndex === 0) {
                prevBtn.addClass(disabledBtnClass);
            }
            else if (toIndex === this.get('length') - 1) {
                nextBtn.addClass(disabledBtnClass);
            }
        },
        _onFocusTrigger: function (type, index) {
            var that = this;

            //  click or tab 键激活时
            if (type === 'click') {
                this.switchTo(index);
            }
            else { //  hover
                this._switchTimer = setTimeout(function () {
                    that.switchTo(index);
                }, this.get('delay'));
            }
        },

        switchTo: function (toIndex) {
            var fromIndex = this.get('activeIndex');
            this._switchTo(toIndex, fromIndex);
            this.set('activeIndex', toIndex);
        },
        _switchTo: function (toIndex, fromIndex) {
            var args = {
                toIndex: toIndex,
                fromIndex: fromIndex

            };
            this.fire('switch', args);
            this._switchTrigger(toIndex, fromIndex);

            var panelInfo = this._getPanelInfo(toIndex, fromIndex);

            this._loadImg(panelInfo.toPanels);

            this._switchPanel(panelInfo);

            this.fire('switched', args);
            //  恢复手工向后切换标识
            this._isBackward = undefined;
        },
        _switchTrigger: function (toIndex, fromIndex) {
            var triggers = this.get('triggers');
            if (triggers.length < 1) {
                return;
            }
            triggers.eq(fromIndex).removeClass(this.get('activeTriggerClass'));
            triggers.eq(toIndex).addClass(this.get('activeTriggerClass'));
        },
        _switchPanel: function (panelInfo) {
            //  默认是最简单的切换效果：直接隐藏/显示
            panelInfo.fromPanels.hide();
            panelInfo.toPanels.show();
        },

        /**
         * 初始化延迟加载
         * @private
         */
        _initLazyload: function () {

            if (!this.get('lazyLoadImg') || this._counter === this._imgLength) {
                return;
            }
            var fromIndex = this.get('activeIndex');
            var index = (fromIndex + 1) % this.get('length');
            this._loadImg(this._getPanelInfo(index, fromIndex).fromPanels);
        },
        /**
         * 加载图片
         * @param {jQuery} panel 图片的面板
         * @private
         */
        _loadImg: function (panel) {
            if (this._counter === this._imgLength) {
                return;
            }
            var that = this;
            var $img = panel.find('img');
            var urlName = this.get('urlName');
            // 检测当前的窗口区域，用于延迟加载图片
            that._windowRegion = that._getBoundingRect();
            // 下载图片
            $img.each(function (index, img) {
                var originSrc = img.getAttribute(urlName);
                if (originSrc && elementInViewport(img, that._windowRegion)) {

                    if (img.src !== originSrc) {
                        img.src = originSrc;
                        that._counter++;
                    }

                    img.removeAttribute(urlName);
                }

            });

        },
        _getPanelInfo: function (toIndex, fromIndex) {
            var panels = this.get('panels').get();
            var step = this.get('step');

            var fromPanels;
            var toPanels;

            //  初始情况下 fromIndex 为 undefined
            if (fromIndex > -1) {
                fromPanels = panels.slice(
                    fromIndex * step,
                    (fromIndex + 1) * step
                );
            }

            toPanels = panels.slice(toIndex * step, (toIndex + 1) * step);

            return {
                toIndex: toIndex,
                fromIndex: fromIndex,
                toPanels: $(toPanels),
                fromPanels: $(fromPanels)
            };
        },
        _initPlugins: function () {
            this._plugins = [];

            this._plug(Effects);
            this._plug(Autoplay);
            this._plug(Circular);
        },
        _plug: function (plugin) {
            var pluginAttrs = plugin.options;

            if (pluginAttrs) {
                for (var key in pluginAttrs) {
                    if (pluginAttrs.hasOwnProperty(key)
                        && !(key in this.options)
                        ) {
                        //  不覆盖用户传入的配置
                        this.set(key, pluginAttrs[key]);
                    }
                }
            }
            if (!plugin.isNeeded.call(this)) {
                return;
            }

            if (plugin.install) {
                plugin.install.call(this);
            }

            this._plugins.push(plugin);
        },
        _cloneNode: function () {
            var expand = this.get('showPanels') - this.get('step');
            var expandFront = this.get('panels').length - expand - 1;
            this.get('panels').filter(':lt(' + expand + ')')
                .clone().appendTo(this.get('container'));
            this.get('panels').filter(':gt(' + expandFront + ')')
                .clone().insertBefore(this.get('container').children(':first'));
        },
        //  切换到上一视图
        prev: function () {
            //   设置手工向后切换标识, 外部调用 prev 一样
            this._isBackward = true;
            var fromIndex = this.get('activeIndex');
            var len = this.get('length');

            //  考虑循环切换的情况
            var index = (fromIndex - 1 + len) % len;
            this.switchTo(index);
            var args = {
                toIndex: index,
                fromIndex: fromIndex

            };
            this.fire('prev', args);
        },
        dispose: function () {
            var main = this.element;

            for (var type in this._listners) {
                this.un(type);
            }

            if (main) {
                main.remove();
                delete this.element;
            }
        },
        //  切换到下一视图
        next: function () {
            this._isBackward = false;
            var fromIndex = this.get('activeIndex');
            var index = (fromIndex + 1) % this.get('length');
            this.switchTo(index);
            var args = {
                toIndex: index,
                fromIndex: fromIndex

            };
            this.fire('next', args);
        },

        /**
         * 获取元素的区域坐标，默认元素为window
         * @param {HTMLElement} el
         * @returns {{left: *, right: *, top: *, bottom: *}}
         * @private
         */
        _getBoundingRect: function (el) {
            var width;
            var height;
            var left;
            var top;
            var right;
            var bottom;
            if (el) { // 传入目标元素
                var $el = $(el);
                width = $el.outerWidth();
                height = $el.outerHeight();
                var offset = $el.offset();
                left = offset.left;
                top = offset.top;
            }
            else {
                width = this.$window.width();
                height = this.$window.height();
                top = this.$window.scrollTop();
                left = this.$window.scrollLeft();
            }

            var threshold = this.get('threshold');
            var thresholdX = threshold === 'default' ? width : threshold;
            var thresholdY = threshold === 'default' ? height : threshold;

            right = left + width;
            bottom = top + height;

            left -= 0;
            right += thresholdX;
            top -= 0;
            bottom += thresholdY;

            return {
                left: left,
                right: right,
                top: top,
                bottom: bottom
            };

        }
    });


    /**
     * 判断元素是否出现在可视区域内，
     * @param {HTMLElement} ele
     * @param {Object} windowRegion
     * @param {Object} containerRegion 如果容器不是的document的有值，否则为undefined
     * @returns {*}
     */
    function elementInViewport(ele, windowRegion, containerRegion) {

        // 元素被display:none
        if (!ele.offsetWidth) {
            return false;
        }

        var eleOffset = $(ele).offset();
        var isInViewport = true;
        var inWin;
        var left = eleOffset.left;
        var top = eleOffset.top;
        var eleRegion = {
            left: left,
            top: top,
            bottom: top + getElementHeight(ele),
            right: left + getElementWidth(ele)
        };

        inWin = isCross(windowRegion, eleRegion);

        if (inWin && containerRegion) {
            isInViewport = isCross(containerRegion, eleRegion); // 也许容器有滚动条
        }

        //  确保在容器内出现并且在视窗内也出现
        return isInViewport && inWin;

    }


    function getElementHeight(ele) {
        return $(ele).outerHeight();
    }

    function getElementWidth(ele) {
        return $(ele).outerWidth();
    }

    /**
     * 两个区域是否相交
     * @param {Object} r1
     * @param {Object} r2
     */
    function isCross(r1, r2) {
        var r = {};
        r.top = Math.max(r1.top, r2.top);
        r.bottom = Math.min(r1.bottom, r2.bottom);
        r.left = Math.max(r1.left, r2.left);
        r.right = Math.min(r1.right, r2.right);

        return r.bottom >= r.top && r.right >= r.left;

    }

    return Switchable;
});
