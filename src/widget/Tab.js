/**
 * @file tab
 * 现在中间的tab直接用tab.js几行代码搞定了，貌似功能比较弱，所以打算独立抽成一个控件
 * 功能点:
 * 1.基本的tab切换
 * 2.数据的延迟加载
 * 3.动画效果
 * 4.切换时候的事件支持
 * 5.不支持键盘切换
 * @author  shenli<shenli03@baidu.com>
 */
define(function (require) {

    var $ = require('jquery');
    var Widget = require('./Widget');

        /**
        * @constructor
        * @extends module:Widget
        * @requires Widget
        * @requires jQuery
        * @exports Tab
        * @example
        *   new Tab({
        *       element: '#j-tab-yeyou',
        *       container:'#j-tab-yeyou-ct',
        *       panels: '#j-tab-yeyou .item',
        *       activeTriggerClass: 'active'
        *   });
        */
    var Tab = Widget.extend({
        /**
         * 控件类型标识
         *
         * @type {string}
         * @private
         */
        type: 'Tab',
        /**
         * 控件配置项
         *
         * @name module:Tab#options
         * @type {Object}
         * @property {jQuery} element 控件渲染容器,用于检测是否在可视区域
         * @property {jQuery} container 容器,left的值变化
         * @property {jQuery} panels  翻转panel项
         * @property {jQuery} lazyloadClass 延迟加载容器的class
         * @property {string} classPrefix 控件class前缀
         * @property {string} triggerType trigger的事件，默认click
         * @property {string} activeTriggerClass 高亮的trigger的class
         * @property {string} disabledBtnClass  禁用的按钮class
         */
        options: {
            element: '',// 整个组件，用于检测是否在可视区域
            container: {
                getter: function (val) {
                    return $(val).eq(0);
                }
            },
            panels: {
                value: [],
                getter: function (val) {
                    return $(val);
                }
            },
            triggers: {
                value: [],
                getter: function (val) {
                    return $(val);
                }
            },
            classPrefix: 'mp',
            triggerType: 'click',
            activeTriggerClass: 'mp-active',
            length: {
                readOnly: true,
                getter: function () {
                    return Math.ceil(this.get('panels').length / this.get('step'));
                }
            },
            lazyloadClass: '.data-lazyload',
            step: 1,
            delay: 700,
            activeIndex: 0
        },
        /**
         * 初始方法，默认实例化的时候自动调用
         * @private
         */
        init: function () {
            this._initPanels();
            this._bindTriggers();
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

        /**
         * 切换至某个panel
         * @fires module:Tab#switch 切换之前事件
         * @fires module:Tab#switched 切换完成事件
         * @param {number} toIndex panel的索引
         * @public
         */
        switchTo: function (toIndex) {
            var fromIndex = this.get('activeIndex');
            this._switchTo(toIndex, fromIndex);
            this.set('activeIndex', toIndex);
        },
        /**
         * 切换的执行函数
         * @param {number} toIndex 前一个索引
         * @param {number} fromIndex 后一个索引
         * @private
         */
        _switchTo: function (toIndex, fromIndex) {
            var args = {
                toIndex: toIndex,
                fromIndex: fromIndex

            };
            this.fire('switch', args);
            this._switchTrigger(toIndex, fromIndex);
            this.renderPanelTextarea(toIndex);
            this._switchPanel(this._getPanelInfo(toIndex, fromIndex));
            this.fire('switched', args);
        },
        _switchTrigger: function (toIndex, fromIndex) {
            var triggers = this.get('triggers');
            if (triggers.length < 1) {
                return;
            }
            triggers.eq(fromIndex).removeClass(this.get('activeTriggerClass'));
            triggers.eq(toIndex).addClass(this.get('activeTriggerClass'));
        },

        /**
         * 切换panel
         * @param {Object} panelInfo
         * @param {number} panelInfo.toIndex 下一个的索引
         * @param {number} panelInfo.fromIndex 上一个的索引
         * @param {jQuery} panelInfo.toPanels 下一个的panel
         * @param {jQuery} panelInfo.fromPanels 上一个的panel
         * @private
         */
        _switchPanel: function (panelInfo) {
            //  默认是最简单的切换效果：直接隐藏/显示
            panelInfo.fromPanels.hide();
            panelInfo.toPanels.show();
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


        /**
         * 渲染第toIndex个panel的延迟渲染的textarea
         * @param {number} toIndex panel索引
         * @public
         */
        renderPanelTextarea: function (toIndex) {
            var that = this;
            var toPanel = this.get('panels').eq(toIndex);
            if (!toPanel.length) {
                return;
            }

            var scriptCnt = toPanel.find(this.get('lazyloadClass'));
            if (scriptCnt.length) {
                scriptCnt.each(function (index, textarea) {
                    that.renderLazyData(textarea);
                });
            }
        },

        /**
         * 渲染延迟加载的数据
         * @param {HTMLElement} textarea 每个textarea的dom节点
         * @public
         */
        renderLazyData: function (textarea) {
            textarea = $(textarea);
            textarea.hide();
            if (textarea.attr('lazy-data') === '1') {
                return;
            }

            textarea.attr('lazy-data', '1');

            var cnt = textarea[0].value.replace(/&lt;/ig, '<')
                .replace(/&gt;/ig, '>');

            textarea.before($(cnt));

        },
        /**
         * 切换到上一panel
         * @public
         */
        prev: function () {
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

        /**
         * 切换到下一panel
         * @public
         */
        next: function () {
            var fromIndex = this.get('activeIndex');
            var index = (fromIndex + 1) % this.get('length');

            var args = {
                toIndex: index,
                fromIndex: fromIndex
            };

            this.fire('next', args);
        },
        /**
         * 销毁实例
         * @public
         */
        dispose: function () {
            Tab.superClass.dispose.call(this);
        }
    });

    return Tab;
});
