/**
 * @file 验证组件的核心模块
 */
define(function (require) {

    var Widget = require('../Widget');
    var u = require('underscore');
    var lib = require('../lib');
    var Item = require('./item');
    var async = require('../lib/async');

    var validators = [];

    var setterConfig = {
        value: function(){},
        setter: function (val) {
            return u.isFunction(val) ? val : function(){};
        }
    };
    var ValidatorMain = Widget.extend({
        type: 'ValidatorMain',
        options: {
            triggerType: 'blur',
            checkOnSubmit: true,    // 是否在表单提交前进行校验，默认进行校验。
            autoSubmit: true,       // When all validation passed, submit the form automatically.
            checkNull: true,        // 除提交前的校验外，input的值为空时是否校验。
            autoFocus: true,           // Automatically focus at the first element failed validation if true.
            showMessage: setterConfig,
            hideMessage: setterConfig
        },
        init: function () {
            this.setup();

        },
        setup: function () {
            var that = this;
            this.items = [];

            if (this.element.tagName === 'FORM') {
                that['_novalidate_old'] = this.element.getAttribute('novalidate');
                try {
                    this.element.setAttribute('novalidate', 'novalidate');
                } catch (e) {

                }

                if (that.get('checkOnSubmit')) {
                    lib.on(that.element, 'submit', function (e) {
                        //阻止默认提交事件
                        lib.preventDefault(e);

                        that.execute(function (err) {
                            !err && that.get('autoSubmit') && that.element.submit();
                        });
                    });
                }
            }


            validators.push(that);
        },

        /**
         * 添加表单校验项
         * @param config
         */
        addItem: function (config) {

            var that = this;

            if (u.isArray(config)) {
                u.each(config, function (item, i) {
                    that.addItem(item);
                });
                return this;
            }

            //每个item的配置
            config = u.extend({
                triggerType: that.get('triggerType'),
                displayHelper: that.get('displayHelper'),
                showMessage: that.get('showMessage'),
                hideMessage: that.get('hideMessage')
            }, config);


            var item = new Item(config);

            that.items.push(item);
            // 关联 item 到当前 validator 对象
            item._validator = that;

            item.on('itemValidated', function (err, message, element) {
                //每个Item的showMessage||hideMessage
                that.query(element).get(err ? 'showMessage' : 'hideMessage')
                    .call(that, message, element);
            });

            lib.on(item.element,item.get('triggerType'),function(e) {
                if(!item.get('checkNull')) {
                    return;
                }
                item.execute(null);
            });

            return that;
        },
        /**
         *
         * @param selector selector是一个item实例或者item的element
         */
        removeItem: function (selector) {
            var that = this;
            var target = selector instanceof  Item
                ? selector
                : findItemBySelector(selector, that.items);
            if (target) {
                target.get('hideMessage').call(that, null, target.element);
                lib.erase(target, that.items);
                target.dispose();
            }


            return that;
        },
        /**
         * main 执行模块，对整个表单的验证事件进行处理
         * @param callback
         * @returns {ValidatorMain}
         */
        execute: function (callback) {
            var that = this,
                results = [],
                hasError = false,
                firstElem = null;

//            hide所有提示信息
            u.each(that.items, function (item, i) {
                item.get('hideMessage').call(that, null, item.element);
            });

//            触发表单验证前的事件
            that.fire('formValidate', that.element);

            //遍历执行Item的execute事件
            async.each(that.items, function (item, cb) {

                     // err，如果用户没有设置，则为规则名称
                    item.execute(function (err, message, ele) {

                        if (err || !hasError) {
                            hasError = true;
                            firstElem = ele;
                        }
                        //存储错误信息
                        results.push([].slice.call(arguments, 0));

                        cb(that.get('stopOnError') ? err : null);
                    });
                }, function () {

                    //校验全部通过
                    that.fire('formValidated', hasError, results, that.element);

                    callback && callback(hasError, results, that.element);
                }
            );

            return that;
        },

        dispose: function () {
            var that = this;

            if (that.element.tagName=== 'FORM') {
                try{
                    if(that['_novalidate_old'] === undefined) {
                        that.element.removeAttribute('novalidator');
                    } else {
                        that.element.setAttribute('novalidator', that['_novalidate_old']);
                    }
                }catch (e){}
                that.element.un('submit');
            }

            u.each(that.items,function(items) {
                that.removeItem(items);
            });

            lib.erase(that, validators);

            ValidatorMain.superClass.dispose.call(this);
        },
        query: function (selector) {
            return findItemBySelector(selector, this.items);
        }


    });


    //helper
    /**
     * 根据Item的element 在item数组中找到item
     * @param selector Item的element对象
     * @param array    Item数组对象
     */
    function findItemBySelector(selector, array) {
        var ret;
        selector = lib.g(selector);
        u.each(array, function (item, i) {
            if (item.element === selector) {
                ret = item;
            }
        });

        return ret;
    }

    return ValidatorMain;

});