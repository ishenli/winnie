/**
 * @file widget attribute
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var util = require('../../lib/util');
    var exports = {};

    /**
     * 合并传入的配置项
     * @param {Object} config
     * @returns {*}
     */
    exports.setOptions = function (config) {

        var options = this.options = {};

        var specialOptions = this.propsInOptions || [];

        // 合并options
        mergeInheritedOptions(options, this, specialOptions);


        //  config 是实例传递进来的配置，与控件的默认配置合并
        if (config) {
            mergeUserValue(options, config);
        }

        // 对有setter的配置，要用初始值set一下
        // 这里应该所有的配置项目都已经合并完毕，每个配置项目都转为
        //  {value:'',getter:'',setter:''}
        setSetterOptions(this, options, config);

        // 某些属性需要从options中拿出来，放到实例上
        copySpecialOptions(specialOptions, this, options, true);

    };

    /**
     * 获取options中的配置
     * @param {string} key
     * @returns {*}
     */
    exports.get = function (key) {
        var option = this.options[key] || {};
        var val = option.value;

        return option.getter
            ? option.getter.call(this, val, key)
            : val;
    };
    /**
     * 设定options中的配置
     * @param {string} key 配置项
     * @param {string} val 配置值
     * @returns 实例
     */
    exports.set = function (key, val, config) {
        var options = [];

        // set('sfs',val);
        if (util.isString(key)) {
            options[key] = val;

            // set({key:'va'l,key2:'val2'},config);
        }
        else {
            options = key;
            config = val;
        }
        config || (config = {});

        var silent = config.silent;
        var override = config.override;
        var now = this.options;
        var changed = this._changedOptions || (this._changedOptions = {});

        for (key in options) {
            if (!options.hasOwnProperty(key)) {
                continue;
            }

            // 如果实例中添加的配置不存在，则添加一个新的空对象给该属性
            var option = now[key] || (now[key] = {});

            val = options[key];

            if (option.readOnly) {
                throw new Error('this options is readOnly : ' + key);
            }

            if (option.setter) {
                val = option.setter.call(this, val, key);
            }


            // 添加set时触发change的事件
            var prev = this.get(key);

            // 如果设置了overide为true，表示强制覆盖，就不去merge
            // 都是对象的时候，做merge操作，来保留先前option上没有的值
            if (!override && util.isPlainObject(prev) && util.isPlainObject(val)) {
                val = merge(merge({}, prev), val);
            }

            now[key].value = val;

            // 触发change事件
            // 初始化的时候就不用触发
            if (!this.__initializing && !isEqual(prev, val)) {
                if (silent) {
                    changed[key] = [val, prev];
                }
                else {
                    this.fire('change:' + key, val, prev, key);
                }
            }
        }
        return this;
    };


    /**
     * 调用每个属性的change方法
     */
    exports.change = function () {
        var changed = this._changedOptions;
        if (changed) {
            for (var key in changed) {
                if (changed.hasOwnProperty(key)) {
                    var args = changed[key];
                    this.fire('change:' + key, args[0], args[1], key);
                }
            }

            delete  this._changedOptions;
        }
        return this;
    };


    /**
     * 合并继承的配置
     * @param options 配置
     * @param instance 实例
     * @param specialOptions 特别的配置
     */

    function mergeInheritedOptions(options, instance, specialOptions) {
        var inherited = []; //  存储继承的属性

        // 实例的原型
        var proto = instance.constructor.prototype;
        while (proto) {

            // 不要拿到prototype上的options的值
            if (!proto.hasOwnProperty('options')) {
                proto.options = {};
            }

            // 将options中的个别配置放到实例上
            copySpecialOptions(specialOptions, proto.options, proto);

            if (!util.isEmptyObject(proto.options)) {
                inherited.unshift(proto.options);
            }

            proto = proto.constructor.superClass;
        }
        // 将所有options的值放在实例
        for (var i = 0, len = inherited.length; i < len; i++) {
            mergeOptions(options, normalize(inherited[i]));
        }
    }

    /**
     * 合并用户输入的配置
     * @param {Object} options
     * @param {Object} config
     */
    function mergeUserValue(options, config) {
        mergeOptions(options, normalize(config, true), true);
    }

    /**
     * 实例的options和继承属性的option的merge
     * @param options 父类的配置
     * @param inheritedOptions  继承过来的配置
     * @param isUserValue
     */
    var OPTION_LIST = ['setter', 'getter', 'readOnly'];

    function mergeOptions(options, inheritedOptions, isUserValue) {
        var key;
        var value;
        var option;
        for (key in inheritedOptions) {
            if (inheritedOptions.hasOwnProperty(key)) {
                value = inheritedOptions[key];
                option = options[key];
            }

            if (!option) {
                option = options[key] = {};
            }

            // 对value进行配置
            (value.value !== undefined)
            && (option.value = cloneValue(value.value, option.value));

            if (isUserValue) {
                continue;
            }

            // 继承的不是value的配置加到实例上
            for (var i in OPTION_LIST) {
                var item = OPTION_LIST[i];
                if (value[item] !== undefined) {
                    option[item] = value[item];
                }
            }
        }

    }

    /**
     * 特殊属性值
     * @const
     * @type {string[]}
     */
    var OPTION_SPECIAL_VALUES = ['value', 'setter', 'getter', 'readOnly'];

    /**
     *讲属性值转为统一的格式，便于setter 和getter函数处理,
     * 如果是用户传入的，则直接赋值
     * @param {Object} options
     * @param {boolean} isUserValue
     * @returns {{}}
     */
    function normalize(options, isUserValue) {

        var newOptions = {};

        for (var key in options) {
            var option = options[key];
            if (!isUserValue
                && util.isPlainObject(option)
                && hasOwnProperties(option, OPTION_SPECIAL_VALUES)) {
                newOptions[key] = option;
                continue;
            }

            newOptions[key] = {
                value: option
            };
        }

        return newOptions;
    }

    /**
     * 设置setter属性
     * @param {Object} host 实例
     * @param {Object} options 默认配置
     * @param {Object} config 用户传入的配置
     */
    function setSetterOptions(host, options, config) {
        host.__initializing = true; // 用于标识初始化的状态

        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                if (options[key].setter) {
                    host.set(key, config[key]);
                }
            }
        }

        delete host.__initializing;
    }


    /**
     * 对属性判断是否在自身
     * @param {Object}  object
     * @param {Object} properties
     * @returns {boolean}
     */
    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 拷贝个别特殊的属性,如elemnt和events
     * @param {Object} specialOptions
     * @param {Object} receiver
     * @param {Object} supplier
     * @param {boolean} isOption2Prop
     */
    function copySpecialOptions(specialOptions, receiver, supplier, isOption2Prop) {
        for (var i = 0, len = specialOptions.length; i < len; i++) {
            var key = specialOptions[i];

            // 讲属性放到实例上
            if (supplier.hasOwnProperty(key)) {
                receiver[key] = isOption2Prop ? receiver.get(key) : supplier[key];
            }
        }
    }

    /**
     * clone 数组和object ，其余不变
     * @param {string} value 子类的值
     * @param {string} prev 继承的值
     */
    function cloneValue(value, prev) {
        if (util.isArray(value)) {
            value = value.slice();
        }
        else if (util.isPlainObject(value)) {
            util.isPlainObject(prev) || (prev = {});

            value = merge(prev, value);
        }

        return value;
    }

    /**
     * 对两个参数进行合并
     * @param {Object} receiver
     * @param {Object} supplier
     */
    function merge(receiver, supplier) {
        var key;
        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                receiver[key] = cloneValue(supplier[key], receiver[key]);
            }
        }
        return receiver;
    }



    /**
     * 判断两者是否相等
     * @param {*} a
     * @param {*} b
     */
    function isEqual(a, b) {
        if (a === b) {
            return true;
        }

        if (isEmptyOption(a) && isEmptyOption(b)) {
            return true;
        }

        //不同类型的相等判断
        var classType = toString.call(a);

        // 两者类型不同
        if (classType !== toString.call(b)) {
            return false;
        }
        // 根据不同的类型进行判读
        switch (classType) {
            // 基本类型和相应的对象生成函数是相等的，所以 '5'是相等于 new String('5');
            case '[object String]':
                return a === String(b);

            case '[object Boolean]':
                return +a == +b;

            case '[object Array]':
                var aString = a.toString();
                var bString = b.toString();
                return aString.indexOf('[object') === -1
                    && bString.indexOf('[object') === -1
                    && aString === bString;
        }

        if (util.isPlainObject(a) && util.isPlainObject(b)) {
            if (!isEqual(util.keys(a), util.keys(b))) {
                return false;
            }


            for (var prop in a) {
                if (a[prop] !== b[prop]) {
                    return false;
                }
            }
        }
    }

    /**
     * 对于一个配置项而言，'',[],{},null,undefined都是空
     * @param o
     * @returns {boolean|*}
     */
    function isEmptyOption(o) {
        return o == null  // null,undefined
            || (util.isString(o) || util.isArray(o)) && o.length === 0 //'',[]
            || isEmptyObject(o); // {}
    }



    /**
     * 判断是否为一个空对象
     * @param o
     * @returns {boolean}
     */
    function isEmptyObject(o) {
        if(!o || toString.call(o) !== '[object Object]' // {}
            ||o.nodeType || util.isWindow(o) || !o.hasOwnProperty){
            return false;
        }

        for(var p in o) {
            if(o.hasOwnProperty(p)) {
                return false;
            }
        }

        return true;
    }

    return exports;
});