/**
 * @file 表单检验项
 */
define(function (require) {

    var Widget = require('../Widget');
    var lib = require('winnie/lib');
    var u = require('underscore');

    var Rule = require('./rule');

    var async = require('winnie/lib/async');

    var setterConfig={
        value:null,
        setter:function(val) {
            return u.isFunction(val)?val:function(){};
        }
    };

    var Item = Widget.extend({
        type:'ValidateItem',
        options:{
            //检验规则
            rule:{
                value:'',
                getter:function(val) {
                    val = lib.trim(val);
                    if(this.get('required')) {
                        if(!val) {
                            val = lib.trim('required' + val);
                        }
                    }
                    return val;
                }
            },
            //提示信息
            display:null,

            triggerType:{
                getter:function(val){
                    if(!val) {
                        return val;
                    }
                    var element = this.element,
                        type = element.getAttribute('type');

                    //radio的blur和key转为change
                    var rs = type==='radio'||type==='checkbox';
                    if(rs && (val.indexOf('blur')>-1)||val.indexOf('key')>-1) {
                        return 'change';
                    }

                    return val;
                }
            },

            errorMessage:null,
            checkNull: true,
            onItemValidate: setterConfig,
            onItemValidated: setterConfig,
            showMessage: setterConfig,
            hideMessage: setterConfig

        },

        /**
         * item 执行方法
         * @param callback //每个item执行之后的cb，在Validator设置
         * @param context
         * @returns {Item}
         */
        execute:function(callback,context) {
            var that = this;
//            var elemDisabeld = !!that.element.getAttribute('disabled');

            context = context || {};

            this.fire('itemValidate', this.element);

            //对规则进行解析
            var rules = Rule.parseRules(that.get('rule'));

            if(rules) {
                //根据规则列表进行判断
                _metaValidate(that,rules,function(err,msg) {

                   //验证完成后根据验证结果进行相应的操作,
                   that.fire('itemValidated',err,msg,that.element, context,event);

                   callback && callback(err, msg, that.element);

                });
            } else {
                callback && callback(null, '', that.element);
            }

            return that;
        }



    });

    function _metaValidate(self,rules,callback){


        //rules 是一个数组
        if(!u.isArray(rules)) {
            throw new Error('No validation rule specified or not specified as an array.');
        }

        var tasks = [];

        u.each(rules,function(rule,i) {
           //解析每个规则
            var obj = Rule.parseRule(rule),
                ruleName = obj.name,
                param = obj.param;

            var operator = Rule.getOperator(ruleName);

            if(!operator){
                throw new Error('Validation rule with name "' + ruleName + '" cannot be found.');
            }

            var options = getMsgOptions(param, ruleName, self);

            //cb是rule的operator的commit函数
            tasks.push(function(cb) {
                // cb 为 async.series 每个 tasks 函数 的 callback!!
                // callback(err, results)
                // self._validator 为当前 Item 对象所在的 Validator 对象
                operator.call(self._validator, options, cb);
            });

        });

        // form.execute -> 多个 item.execute -> 多个 rule.operator
        // 多个 rule 的校验是串行的, 前一个出错, 立即停止
        // async.series 的 callback fn, 在执行 tasks 结束或某个 task 出错后被调用
        // 其参数 results 为当前每个 task 执行的结果
        // 函数内的 callback 回调给后一项校验

        async.series(tasks,function(err,results) {
            callback && callback(err, results[results.length - 1]);
        });
    }

    /**
     * 获取规则的message，如设置display
     * @param param
     * @param ruleName
     * @param self item的实例
     * @returns {*}
     */
    function getMsgOptions(param,ruleName,self) {

        var options = u.extend({}, param, {
            element: self.element,
            display: (param && param.display) || self.get('display'),
            rule: ruleName
        });

        var message = self.get('errormessage')
                        || self.get('errormessage'
                        + upperFirstLetter(ruleName));
        if (message && !options.message) {
            options.message = {
                failure: message
            };
        }

        return options;
    }

    function upperFirstLetter(str) {
        str = str + ' ';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    return Item;
});