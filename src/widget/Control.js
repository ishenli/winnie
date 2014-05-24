/**
 * @file 控件基类
 * @author shenli
 */
define(function (require) {

    var u = require('underscore');
    var lib = require('winnie/lib');
    var Class = require('winnie/lib/class');
    var Aspect = require('winnie/lib/aspect');
    var Emitter = require('winnie/lib/emitter');

    var Control = Class.create({

        type: 'Control',

        Implements:[Aspect,Emitter],
        /**
         * new时执行该方法
         * @param config
         */
        initialize: function (config) {
            this.setOptions(config);
        },
        /**
         * 合并传入的配置项
         * @param config
         * @returns {*}
         */
        setOptions: function (config) {

            var options = this.options = {};

            var specialOptions = this.propsInOptions || [];

            //合并options
            mergeInheritedOptions(options, this,specialOptions);


            // config 是实例传递进来的配置，与控件的默认配置合并
            if(config ){
                mergeUserValue(options, config);
            }

            //对有setter的配置，要用初始值set一下
            //这里应该所有的配置项目都已经合并完毕，每个配置项目都转为
            // {value:'',getter:'',setter:''}
            setSetterOptions(this, options, config);

            //某些属性需要从options中拿出来，放到实例上
            copySpecialOptions(specialOptions, this, options, true);

        },

        get: function (key) {
            var option = this.options[key]||{};
            var val = option.value;

            return option.getter
                    ? option.getter.call(this, val, key)
                    : val;
        },

        set: function (key, val,config) {
            var options = [];

            //set('sfs',val,configs);
            if(lib.isString(key)){
                options[key] = val;

            //set('{key:val,key2:val2}',config);
            } else {
                options=key;
//                config = val;
            }

//            config || (config = {});

            var now = this.options;

            for(key in options) {
                if(!options.hasOwnProperty(key)) {
                    continue;
                }

                //如果实例中添加的配置不存在，则添加一个新的空对象给该属性
                var option = now[key] || (now[key] = {});

                val = options[key];

                if(option.readOnly) {
                    throw new Error('this options is readOnly : ' + key);
                }

                if(option.setter) {
                    val = option.setter.call(this, val, key);
                }

                now[key].value = val;

                return this;
            }
        }
    });

    //helpers
    function mergeInheritedOptions(options, instance,specialOptions) {
        var inherited = []; // 存储继承的属性

        //实例的原型
        var proto = instance.constructor.prototype;
        while (proto) {

            //不要拿到prototype上的options的值
            if (!proto.hasOwnProperty('options')) {
                proto.options = {};
            }

            //将options中的个别配置放到实例上
            copySpecialOptions(specialOptions, proto.options, proto);

            if (!u.isEmpty(proto.options)) {
                inherited.unshift(proto.options);
            }

            proto = proto.constructor.superClass;
        }

        //将所有options的值放在intance
        for (var i = 0, len = inherited.length; i < len; i++) {
            mergeOptions(options, normalize(inherited[i]));
        }
    }

    function mergeUserValue(options,config) {
        mergeOptions(options, normalize(config, true),true);
    }
    /**
     * 实例的options和继承属性的option的merge
     * @param options 父类的配置
     * @param inheritedOptions  继承过来的配置
     * @param isUserValue
     */
    var OPTION_LIST = ['setter', 'getter', 'readOnly'];

    function mergeOptions(options,inheritedOptions,isUserValue) {
        var key,value;
        var option;
        for(key in inheritedOptions) {
            if(inheritedOptions.hasOwnProperty(key)) {
                value = inheritedOptions[key];
                option = options[key];
            }

            if(!option) {
                option = options[key] = {};
            }

            //对value进行配置
            (value['value']!==undefined)
            && (option['value'] = cloneValue(value['value'],option['value']));

            if(isUserValue) {
                continue;
            }

            //继承的不是value的配置加到实例上
            for(var i in OPTION_LIST) {
                var item = OPTION_LIST[i];
                if(value[item]!== undefined) {
                    option[item] = value[item];
                }
            }
        }

    }
    //将所有options的值转为同一的格式
    var OPTION_SPECIAL_VALUES = ['value', 'setter', 'getter', 'readOnly'];

    //讲属性值转为统一的格式，便于setter 和getter函数处理
    //如果是用户传入的，则直接赋值
    function normalize(options,isUserValue) {

        var newOptions = {};

        for (var key in options) {
            var option = options[key];
            if (!isUserValue
                && u.isObject(option)
                && hasOwnProperties(option, OPTION_SPECIAL_VALUES)){
                newOptions[key] = option;
                continue;
            }

            newOptions[key] = {
                value: option
            };
        }

        return newOptions;
    }

    function setSetterOptions(host,options,config){
        host.__initializing= true;

        for(var key in config) {
            if(config.hasOwnProperty(key)) {
                if(options[key].setter) {
                    host.set(key, config[key]);
                }
            }
        }

        delete host.__initializing;
    }
    /**
     * 对属性判断是否在自身
     * @param object
     * @param properties
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


    function copySpecialOptions(specialOptions,receiver,supplier,isOption2Prop) {
        for(var i= 0,len = specialOptions.length;i<len;i++) {
            var key = specialOptions[i];

            //讲属性放到实例上
            if(supplier.hasOwnProperty(key)) {
                receiver[key] = isOption2Prop ? receiver.get(key) : supplier[key];
            }
        }
    }
    /**
     * clone 数组和object ，其余不变
     * @param value 子类的值
     * @param prev 继承的值
     */
    function cloneValue (value,prev) {
        if(u.isArray(value)){
            value = value.slice();
        }
        else if (lib.isPlainObject(value)) {
            u.isObject(prev) || (prev = {});

            value = merge(prev, value);
        }

        return value;
    }

    /**
     * 对两个参数进行合并
     * @param receiver
     * @param supplier
     */
    function merge(receiver,supplier) {
        var key;
        for(key in supplier) {
            if(supplier.hasOwnProperty(key)) {
                receiver[key] = cloneValue(supplier[key], receiver[key]);
            }
        }
        return receiver;
    }


    return Control;

});