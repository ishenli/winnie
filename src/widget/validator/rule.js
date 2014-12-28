/**
 * @file validator
 */
define(function (require) {
    var lib = require('../../lib');
    var util = require('../../lib/util');
    var rules = [];
    var messages = {};

    /**
     * 规则对象
     * @param name
     * @param oper item添加，包含element，display等信息
     * @constructor
     */
    function Rule(name, oper) {
        var me = this;
        this.name = name;

        //正则
        if (oper instanceof  RegExp) {
            me.operator = function (opts, commit) {
                var result = oper.test(lib.g(opts.element).value);
                commit(
                    result ? null : opts.rule,
                    _getMsg(opts, result)
                );
            };

            //函数
        } else if (util.isFunction(oper)) {

            //这个貌似还不懂。。。。
            me.operator = function (opts, commit) {

                //这个用于异步判断，有可能需要重新设计
                var result = oper.call(this, opts, function (rs, msg) {
                    commit(
                        rs ? null : (opts.rule), //为item.execute的err
                            msg || _getMsg(opts, rs) //为item.execute 的 msg
                    );
                });

                // 当是异步判断时, 返回 undefined, 则执行上面的 commit
                if (result !== undefined) {
                    commit(result ? null : opts.rule, _getMsg(opts, result));
                }
            };
        } else {
            throw new Error('the second argument is not a regexp or a function');
        }
    }

    /**
     * 添加检验的规则
     * @param name
     * @param operator
     * @param message
     */
    function addRule(name, operator, message) {
        if (operator instanceof  Rule) {
            rules[name] = new Rule(name, operator.operator);
        } else {
            rules[name] = new Rule(name, operator);
        }
        setMessage(name, message);
    }

    /**
     *获取提示信息
     * @param opts
     * @param result 验证的结果 true or false
     * @private
     */
    function _getMsg(opts, result) {
        var rule = opts.rule;
        var msgTpl;
        if (opts.message) {
            if (util.isObject(opts.message)) {
                msgTpl = opts.message[result ? 'success' : 'failure'];
            } else {
                msgTpl = result ? 'success' : 'failure';
            }
        } else {
            msgTpl = messages[rule][result ? 'success' : 'failure'];
        }
        return msgTpl ? complieTpl(opts, msgTpl) : msgTpl;
    }

    /**
     * 设定错误提示
     * @param name
     * @param message
     * 是一个{}，如果是string，则改为{failure:message}
     */
    function setMessage(name, message) {

        if (util.isPlainObject(name)) {
            util.each(name, function (v, i) {
                setMessage(v, i);
            });
            return this;
        }

        if (util.isPlainObject(message)) {
            messages[name] = message;
        } else {
            messages[name] = {
                failure: message
            };
        }

        return this;
    }

    /**
     * 编译提示信息的模板
     * @param opts
     * @param tpl
     */
    function complieTpl(opts, tpl) {

        var result = tpl;
        var reg1 = /\{\{[^\{\}]*\}\}/g,
            reg2 = /\{\{(.*)\}\}/;

        //模板
        var arr = tpl.match(reg1);

        arr && util.each(arr, function (v) {
            var key = v.match(reg2)[1];
            var value = opts[util.trim(key)];
            result = result.replace(v, value);
        });
        return result;
    }

    function getRule(name) {
        return rules[name];
    }

    function parseRule(str) {
        var match = str.match(/([^{}:\s]*)(\{[^\{\}]*\})?/);

        // eg. { name: "valueBetween", param: {min: 1, max: 2} }
        return {
            name: match[1],
            param: parseJSON(match[2])
        };
    }

    function parseRules(str) {
        if (!str) {
            return null;
        }

        return str.match(/[a-zA-Z0-9\-\_]+(\{[^\{\}]*\})?/g);
    }

    addRule('required', function (option) {

        //要根据不同的表单类型做判断 radio，text，checkbox
        var element = lib.g(option.element);

        //暂时先支持input
        var val = element.value;

        return !!util.trim(val);

    }, '请输入{{display}}');

    addRule('email', /^\s*([a-zA-Z0-9_\+\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})\s*$/, '{{display}}的格式不正确');

    addRule('text', /.*/);

    addRule('password', /.*/);

    addRule('minlength', function (option) {
        var element = lib.g(option.element);

        var len = util.trim(element.value).length;

        return len >= option.min;

    }, '{{display}}的长度必须大于或等于{{min}}');

    addRule('maxlength', function (option) {
        var element = lib.g(option.element);

        var len = util.trim(element.value).length;

        return len <= option.max;

    }, '{{display}}的长度必须小于或等于{{max}}');


    addRule('confirmation', function (option) {
        var element = lib.g(option.element);
        var val = util.trim(element.value);

        var target = lib.g(option.target);

        var targetVal = util.trim(target.value);

        return val === targetVal;

    }, '两次输入的{{display}}不一致，请重新输入');

    //helper
    function parseJSON(str) {
        if (!str) {
            return null;
        }

        var NOTICE = 'Invalid option object "' + str + '".';

        // remove braces
        str = str.slice(1, -1);

        var result = {};

        var arr = str.split(',');
        util.each(arr, function (v, i) {
            arr[i] = util.trim(v);

            if (!arr[i]){
                throw new Error(NOTICE);
            }

            var arr2 = arr[i].split(':');

            var key = util.trim(arr2[0]),
                value = util.trim(arr2[1]);

            if (!key || !value){
                throw new Error(NOTICE);
            }

            result[getValue(key)] = util.trim(getValue(value));

        });

        // 'abc' -> 'abc'  '"abc"' -> 'abc'
        function getValue(str) {
            if (str.charAt(0) === '"'
                && str.charAt(str.length - 1) === '"'
                || str.charAt(0) === '\''
                && str.charAt(str.length - 1) === '\'') {
                return eval(str);
            }
            return str;
        }

        return result;
    }


    return {
        addRule: addRule,
        setMessage: setMessage,
        getMessage: function (opts, result) {
            return _getMsg(opts, result);
        },
        parseRules: parseRules,
        parseRule: parseRule,
        getRule: getRule,
        getOperator: function (name) {
            return rules[name].operator;
        }
    };
});