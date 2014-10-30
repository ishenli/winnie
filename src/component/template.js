/**
 * @file file
 * @author zhangkai (zhangking520@gmail.com)
 */
define(function (require) {

    var template = function(){
        var args = [].slice.call(arguments);

        if(args.length == 1){
            //默认是模版字符串，若是穿模版id，待处理
            template.compile.apply(template,args);
        }

        if(args.length == 2){
            template.tohtml.apply(template,args);
        }
    };

    template._cache = {};

    template.setoptions = function(options){


    };

    template.options = {
        cache:true,  //缓存开启
        escape:true  //html编码

    };

    template.compile = function(tmp){
        var options = this.options;

        if(this._cache[tmp]){
            return this._cache[tmp];
        }else{
            return options.cache?this._cache[tmp] = this.handle(tmp):this.handle(tmp);
        }

    };

    template.tohtml = function(tmp,data){
        return this.compile(tmp).render(data);

    };
    //模版主处理函数
    template.handle = function(tmp){
        var _this = this;



    }

    return {
        template:template
    };
});