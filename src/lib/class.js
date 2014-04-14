/**
 * @file file
 * @author shenli
 * thanks to https://github.com/aralejs/class/blob/master/src/class.js
 */
define(function (require) {

    var u = require('underscore');

    function Class(obj) {
        if (!(this instanceof Class) && u.isFunction(obj)) {
            return classify(obj);
        }
    }

    /**
     * 创建
     * @param parent 继承的父类
     * @param properties 属性
     */
    Class.create = function (parent, properties) {

        //如果parent不是一个函数，则把parent赋值给properties
        //如 create({'attr':'val','method:'foo()');
        if (!u.isFunction(parent)) {
            properties = parent;
            parent = null;
        }

        properties || (properties = {});
        parent || ( parent = properties.Extends || Class);

        properties.Extends = parent;

        function subClass() {
            parent.call(this, arguments);
            if (this.constructor === subClass && this.initialize) {
                this.initialize.apply(this, arguments);
            }
        }

        //如果传入父类
        if (parent !== Class) {
            mix(subClass, parent, parent.StaticsWhiteList);
        }

        implement.call(subClass, properties);

        return classify(subClass);
    };

    function implement(properties) {
        var key, value;
        for (key in properties) {
            value = properties[key];
            if (Class.Mutators.hasOwnProperty(key)) {
                Class.Mutators[key].call(this, value);
            } else {
                this.prototype[key] = value;
            }
        }
    }


    Class.extend = function (properties) {

        properties || (properties = {});

        properties.Extends = this;

        return Class.create(properties);

    };

    function classify(klass) {

        klass.extend = Class.extend;
        klass.implement = implement;

        return klass;
    }


    Class.Mutators = {
        'Extends': function (parent) {
            var existed = this.prototype;
            var proto = createProto(parent.prototype);

            mix(proto, existed);

            proto.constructor = this;

            this.prototype = proto;

            this.superClass = parent.prototype;
        },
        'Implements': function (items) {
            u.isArray(items) || (items = [items]);

            var proto = this.prototype, item = items.shift();


            while (item) {
                mix(proto, item.prototype || item);
                item = items.shift();
            }

        },
        'Statics': function (StaticProperties) {
            mix(this, StaticProperties);
        }


    };

    function F() {
    }

    var createProto = Object._proto_ ?
        function (proto) {
            return {_proto_: proto};
        } :
        function (proto) {
            F.prototype = proto;
            return new F();
        };


    //helpers
    //source 会覆盖target的属性
    function mix(target, source, exclude) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (exclude && u.indexOf(exclude, key) === -1){
                    continue;
                }

                target[key] = source[key];
            }
        }
    }

    return Class;
});