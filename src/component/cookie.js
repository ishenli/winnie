/**
 * @file file
 * @author zhangkai (zhangking520@gmail.com)
 */
define(function (require) {
    var doc = document,
        current_domain = doc.domain,
        top_domain = current_domain.match(/\w+\.\w+$/);
        top_domain = top_domain && top_domain[0] ? top_domain[0] : null;

    function cookie(name, value, expire, domain, path) {
        var date, arr, reg;

        if (typeof name != 'string') {
            return null;
        } else if (undefined === value) {
            // get cookie
            value = null;
            reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');

            if(arr = doc.cookie.match(reg)){
                value = unescape(arr[2]);
            }

            return value;
        } else if (null === value) {
            // delete cookie
            cookie(name, '', -1);
        } else {
            // set cookie
            if(expire instanceof Date){
                //日期
                date = expire;
            }else{
                //小时

                date = new Date();
                date.setTime(date.getTime() + (expire?expire:expire == 0?0:24) * 3600000);
            }

            var ret = name + '=' + escape(value) + ';expires=' + date.toGMTString();

            // 默认设置到顶级域名
            domain = undefined == domain ? top_domain ? '.' + top_domain : null : domain;
            domain = domain?';domain=' + domain:null;

            path = undefined == path ? null : ';path=' + path;

            domain?ret+=domain:0;
            path?ret+=path:0;

            doc.cookie =ret;

        }
    }

    function getcookie(name){
        return cookie(name);
    }

    function delcookie(name){
        cookie(name,null);
    }

    function setcookie(name,value,expire,domain,path){
        cookie(name,value,expire,domain,path);
    }

    return {
        get:getcookie,

        set:setcookie,

        remove:delcookie

    };
});