/**
 * @file Dialog
 * @author ishenli
 */
define(function (require) {

    var Overlay = require('./Overlay');
    var Mask = require('./Mask');
    var lib = require('./lib');
    var aop = require('./lib/aop');

    var Dialog = Overlay.extend({
        options: {
            // 统一样式前缀
            classPrefix: 'ui-dialog',
            hasMask: true,
            closeTpl: 'x',
            content: {
                value: '',
                setter: function (val) {
                    //
                }
            },
            height: null,
            effect: 'none',
            //自适应高度
            autoFix: true,
            //默认定位
            align: {
                value: {
                    selfXY: ['50%', '50%'],
                    baseXY: ['50%', '50%']
                }
            },
            trigger:'',
            closeTrigger:'.j-dialog-close'
        },
        init: function () {
            Dialog.superClass.init.call(this);
            this._initTriggers();
            this.parseElement();
            //设置mask
            this._initMask();
        },
        parseElement:function() {
            this.set("model", {
                classPrefix: this.get('classPrefix')
            });

            this.contentElement = lib.query('[data-role=content]');

            lib.setStyle(this.contentElement, {
                height:'100%',
                zoom:1
            });

        },
        show: function () {
            Dialog.superClass.show.call(this);
            return this;

        },
        hide:function() {
            Dialog.superClass.hide.call(this);
            return this;
        },
        dispose: function() {
            this._hideMask();
            return Dialog.superclass.dispose.call(this);
        },
        _initTriggers: function () {
            var that = this;
            //委托open
            lib.bind(document, that.get('trigger'), 'click', function (e) {
                lib.preventDefault(e);
                that.activeTrigger = e.currentTarget;
                that.show();
            });

            //委托close
            lib.bind(document, that.get('closeTrigger'), 'click',function(e) {
                that.hide();
            });
        },
        _initMask: function () {

            var that = this;
            // 存放 mask 对应的对话框
            Mask._dialogs = Mask._dialogs || [];

            this.after('show', function () {
                if (!this.get('hasMask')) {
                    return;
                }
                Mask.set('zIndex', that.get('zIndex')).show();
                //将mask节点放在dialog节点前面
                lib.insertBefore(Mask.element,that.element);

                // 避免重复存放
                var existed = false;
                for (var i = 0; i < Mask._dialogs.length; i++) {
                    if (Mask._dialogs[i] === that) {
                        existed = true;
                    }
                }
                // 依次存放对应的对话框
                if (!existed) {
                    Mask._dialogs.push(that);
                }

            });

            this.after('hide', this._hideMask);
        },
        _hideMask:function(){
            if (!this.get('hasMask')) {
                return;
            }
            Mask.hide();
        }
    });
    return Dialog;
});