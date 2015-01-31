/**
 * @file 控件基类
 * @author shenli
 */

define(function (require) {
    var util = require('../lib/util');
    var Class = require('../lib/class');
    var Aspect = require('../lib/aspect');
    var Emitter = require('../lib/emitter');
    var Attribute = require('./base/attribute');
    var Status = require('./base/status');

    var Control = Class.create({

        type: 'Control',

        Implements: [Aspect, Emitter, Attribute, Status],
        /**
         * new时执行该方法
         * @param {Object} config
         */
        initialize: function (config) {
            this.setOptions(config);
            parseEventsFromInstance(this, this.options);
        },

        /**
         * 控件销毁
         */
        dispose: function () {
            // 注销所有的事件
            this.off();

            // 删除所有属性
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }

            this.dispose = util.noop;
        }

    });

    function parseEventsFromInstance(instance,options) {
        for(var option in options) {
            if(options.hasOwnProperty(option)) {
                var fn = '_onChange' + util.ucFirst(option);
                if(instance[fn]) {
                    instance.on('change:' + option, instance[fn]);
                }
            }
        }
    }

    return Control;

});
