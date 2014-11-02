/**
 * @file file
 * @author zhangkai (zhangking520@gmail.com)
 */
define(function (require) {
    var doc = document,
        current_domain = doc.domain,
        top_domain = current_domain.match(/\w+\.\w+$/);
        top_domain = top_domain && top_domain[0] ? top_domain[0] : null;

    function cookie(name, value, hours, domain, path) {
        var date, arr, reg;

        if (typeof name != 'string') {
            return;
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
            date = new Date;
            date.setTime(date.getTime() + (hours || 24) * 3600000);

            // 默认设置到顶级域名
            domain = undefined == domain ? top_domain ? '.' + top_domain : null : domain;

            if (null == domain) {
                // domain 为 null 时 不支持
            } else {
                domain = ';domain=' + domain;
                path = undefined == path ? ';path=/' : ';path=' + path;

                doc.cookie = name + '=' + escape(value) + ';expires=' + date.toGMTString() + domain + path;
            }
        }
    }

    function getcookie(name){
        return cookie(name);
    }

    function delcookie(name){
        cookie(name,null);
    }

    function setcookie(name,value,hours,domain,path){
        cookie(name,value,hours,domain,path);
    }

    return {
        getcookie:getcookie,

        setcookie:setcookie,

        delcookie:delcookie

    };
});