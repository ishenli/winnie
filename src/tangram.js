/**
 * User: shenli
 * Date: 13-8-1
 */
var T,tangram=T=function(){
    var T,tangram=T=tangram||function(q,c){return tangram.dom?tangram.dom(q,c):null;};
    tangram.version="1.0.0";
    tangram.guid="$winnie$";

    // 一些页面级别唯一的属性，需要挂载在 window[tangram.guid]上
    var  _=window[tangram.guid]=window[tangram.guid]||{};
    (_.versions||(_.versions=[])).push(tangram.version);

    //用于创建链式语法
    tangram.createChain=function(chainName,fn,constructor){
        //创建一个内部类名
        var className=chainName=="dom"?"$DOM":"$"+chainName.charAt(0).toUpperCase()+chainName.substr(1),
            slice=Array.prototype.slice,
            chain=tangram[chainName];
        if(chain){return  chain;}

        chain=tangram[chainName]=fn||function(object){
            return
        }
    };

    //
    tangram.check=tangram.check||function(){};
    return tangram;
}();