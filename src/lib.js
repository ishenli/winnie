/**
 * User: shenli
 * base lib
 */
define(function (require, exports, module) {
    /**
     *  The package provides common utility functions
     *  @export lib
     */

    var lib = {};

    var toString = Object.prototype.toString();

    var hasOwnProperty = Object.prototype.hasOwnProperty();

    /**
     * 方法静态化
     *
     * 反绑定、延迟绑定
     * @inner
     * @param {Function} method 待静态化的方法
     *
     * @return {Function} 静态化包装后方法
     */
    function generic(method) {
        return function () {
            return Function.call.apply(method, arguments);
        };
    }


    /**
     * 功能降级处理
     *
     * @inner
     * @param {boolean} conditioin feature 可用的测试条件
     * @param {Function} implement feature 不可用时的降级实现
     * @param {Function} feature 可用的特性方法
     *
     * @return {Function} 静态化后的 feature 或 对应的降级实现函数
     */

    function fallback(condition, implement, feature) {
        return condition ? generic(feature || condition) : implement;
    }

    /**
     * 类型判断
     *
     * @param {*} obj 待判断类型的输入
     *
     * @return {string} 类型判断结果
     */
    var typeOf = lib.typeOf = function (obj) {
        var type = toString.call(obj).slice(8, -1).toLowerCase();
        return typeof obj === 'object' && 'nodeType' in obj
            ? 'dom'
            : (obj == null ? null : type);
    };

    /**
     * forEach
     * @param {Array} obj 待遍历的数组或类数组
     * @param {Function} iterator 迭代方法
     * @param {Object=} bind 迭代方法中绑定的 this
     */

    var each = lib.each = fallback(Array.prototype.forEach, function (obj, iterator, bind) {
        for (var i = 0, l = (obj.length >>> 0); i < l; i++) {
            if (i in obj) {
                iterator.call(bind, obj[i], i, obj);
            }
        }
    });

    // 生成lib命名空间下的 isString、isArray、isFunctoin、isDate 和 isObject 方法

    each(['String','Array','Function','Date','Object'],function(type){
        var lowerType=type.toLowerCase();
        lib[lowerType === 'function' ? 'fn' : lowerType] = {};

        lib['is' + type]=function(obj) {
            return obj!=null&&toString.call(obj).slice(8,-1)===type;
        };
    })

    //遍历数组的方法
    lib.array.each=each;

    /**
    * 数组的 map 方法
    *
    * 现代浏览器中数组 map 方法静态化
    * @method module:lib.map
    * @param {Array} obj 待处理的数组或类数组
    * @param {Function} iterator 迭代方法
    * @param {Object=} bind 迭代方法中绑定的 this
    * @return {Array} map 处理后的原数组
    */

    var map=lib.map=lib.array.map=fallback(
        Array.prototype.map,
        function(obj,iterator,bind) {
            for(var i =l=obj.length>>>0;i<l;i++) {
                if(i in obj) {
                    obj[i] = iterator.call(bind, obj[i], i, obj);
                }
            }
        }
    );

    /**
     * 查询数组中指定元素的索引位置
     *
     * @method module:lib.array.indexOf
     * @param {Array} source 需要查询的数组
     * @param {*} item 查询项
     * @param {number} from 初始的查询位置
     * @return {number} 指定元素的索引位置，查询不到时返回-1
     */

    var indexOf=lib.indexOf=lib.array.indexOf=fallback(
        Array.prototype.indexOf,
        function(source,item,from){
            var length=this.length>>>0;
            var i=(from<0)?Math.max(0,length+from):from||0;
            for(;i<length;i++){
                if(source[i]===item) {
                    return i;
                }
            }
            return -1;
        }
    );

    /**
     * 数组切片方法
     *
     * @method module:lib.array.slice
     * @param {Array} array 输入数组或类数组
     * @param {number} startIndex 切片的开始索引
     * @param {number} endIndex 切片的结束索引
     *
     * @return {Array} 新的数组
     */
    var slice = lib.slice = lib.array.slice = generic(Array.prototype.slice);

    /**
     * 将对象转换为数组
     *
     * @method module:lib.array.toArray
     * @param {*} source 任意对象
     *
     * @return {Array}
     */

    lib.toArray=lib.array.toArray=function(source) {
        if(source==null) {
            return [];
        }

        if(lib.isArray(source)) {
            return source;
        }

        var l=source.length;
        if(typeof l==="number"&&typeOf(source)!=="string"){
            var array=[];
            while(l--) {
                array[l] = source[l];
            }

            return array;
        }

        return[source];
    };
    /**
     * 扩展对象
     *
     * @method module:lib.object.extend
     * @param {Object} target 被扩展的目标对象
     * @param {Object} source 扩展的源对象
     *
     * @return {Object} 被扩展后的 `target` 对象
     */

    var extend=lib.extend=lib.object.extend=function(target,source){
        for(var name in source) {
            if(hasOwnProperty.call(source,name)){
                if(lib.isObject(target[name])){
                    extend(target[name], source);
                }
                else{
                    target[name] = source[name];
                }
            }
        }

        return target;
    };

    /**
     * 深层复制
     *
     * @method module:lib.object.clone
     * @param {*} source 被复制的源
     *
     * @return {*} 复制后的新对象
     */

    var clone=lib.clone=lib.object.clone=function(source){
        if(!source||typeof source!=="object"){
            return source;
        }

        var cloned=source;

        if(lib.isArray(source)) {
            cloned = map(slice(source), clone);
        }
        else if(lib.isObject(source)&&'isPrototypeOf' in source){
            cloned={};
            for(var key in source) {
                if(hasOwnProperty.call(source,key)) {
                    cloned[key] = clone(source[key]);
                }
            }
        }
    }
    /**
     * 为函数提前绑定参数（柯里化）
     *
     * @see http://en.wikipedia.org/wiki/Currying
     * @method module:lib.fn.curry
     * @param {Function} fn 要绑定的函数
     * @param {...args=} args 函数执行时附加到执行时函数前面的参数
     *
     * @return {Function} 封装后的函数
     */
    var curry = lib.curry = lib.fn.curry = function (fn) {
        var args = slice(arguments, 1);
        return function () {
            return fn.apply(this, args.concat(slice(arguments)));
        };
    };

    /**
     * 为对象绑定方法和作用域
     *
     * @method module:lib.fn.bind
     * @param {Function} fn 要绑定的函数
     * @param {Object} scope 执行运行时this，如果不传入则运行时this为函数本身
     * @param {...args=} args 函数执行时附加到执行时函数前面的参数
     *
     * @return {Function} 封装后的函数
     */
    lib.bind = lib.fn.bind = fallback(
        Function.bind,
        function (fn, scope) {
            var args = arguments.length > 2 ? slice(arguments, 1) : null,
                F = function(){};

            var bound = function(){
                var context = scope, length = arguments.length;

                // 处理构造函数的 bind
                if (this instanceof bound){
                    F.prototype = fn.prototype;
                    context = new F();
                }
                var result = (!args && !length)
                    ? fn.call(context)
                    : fn.apply(
                    context,
                    args && length
                        ? args.concat(slice(arguments))
                        : args || arguments
                );
                return context === scope ? result : context;
            };
            return bound;
        }
    );
    module.exports=lib;
});
