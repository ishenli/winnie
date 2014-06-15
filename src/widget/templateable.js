/**
 * @file 用于增强Widget template ,依赖于etpl
 * @author shenli （meshenli@gmail.com）
 * thanks to
 * https://github.com/ecomfe/etpl
 */
define(function (require) {
    var Etpl = require('etpl');

    var compiledTemplates = {};

    var exports ={
        parseElementFromTemplate:function() {
            var t, template = this.get('template');
            if(/^#/.test(template) && (t = document.getElementById(template.substring(1)))) {
                template = t.innerHTML;
                this.set('template', template);
            }

            this.element = stringToDom(this.compile());
        },
        compile:function(template,model){
            template = template || this.get('template');
            model = model || this.get('model') ||{};

            var filters = this.templateFilters;
            var filter;

            //添加过滤器
            if(filters) {
                for(filter in filters) {
                    if(filters.hasOwnProperty(helper)) {
                        Etpl.addFilter(filter, filters[filter]);
                    }
                }
            }

            //编译模板
            var compiledTemplate = compiledTemplates[template];

            if (!compiledTemplate) {
               this.compiledTemplate =  compiledTemplate = compiledTemplates[template] = Etpl.compile(template);
            }
            // 生成 html
            var html = compiledTemplate(model);

            //因为etpl全局，可能需要卸载filter

            return html;
        }
    };


    function stringToDom(str) {
        var div = document.createElement('div');
        if(typeof str ==='string') {
            div.innerHTML = str;
        }
        return div.firstChild;
    }
    return exports;
});