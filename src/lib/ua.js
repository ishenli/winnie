/**
 * @file user-agent检测
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {

    var u = require('underscore');
    var ua = window.navigator.userAgent.toLowerCase();
    var NA_VERSION = '-1';

    //默认检测结果,无法识别的情况下
    var NA = {name:'na', version:NA_VERSION};
    var detector;
    var reg_msie=/\b(?:mise|ie|trident\/[0-9].*rv[:])([0-9.]+)/;



    /**
     * IE检测
     * @param ua
     * @returns {*}
     * @constructor
     */
    function IEMode(ua) {
        var m,browserVersion,engineVersion,browserMode,engineMode;
        if(!reg_msie.test(ua)){
            return null;
        }

        //ie8+可以根据trident引擎来识别,并且在IE兼容模式中不会变化
        //http://msdn.microsoft.com/zh-cn/library/ie/hh869301(v=vs.85).aspx
        if(~ ua.indexOf('trident/')){
            m = /\btrident\/([0-9.]+)/.exec(ua); //如ie8 得到['trident/4.0', '4.0']
            if(m && m.length>2) {
                //获取版本号
                engineVersion = m[1];
                var v = m[1].split('.');
                v[0] = parseInt(v[0], 10) + 4;
                browserVersion = v.join('.');
            }
        }

        //返回类似['mise 8.0',8.0]，如果ie8开启IE7兼容模式，将返回mise 7.0,
        m = reg_msie.exec(ua);
        browserMode = m[1];
        if(typeof browserVersion === undefined) {
            browserVersion = browserMode;
        }

        var v_mode = m[1].split('.');

        v_mode[0] = parseInt(v_mode[0], 10) - 4;

        engineMode = v_mode.join('.');

        if(typeof engineVersion === undefined) {
            engineVersion = engineMode;
        }

        return {
            browserVersion: browserVersion,
            browserMode: browserMode,
            engineVersion: engineVersion,
            engineMode: engineMode,
            compatible: engineVersion !== engineMode //是否开始兼容模式
        }
    }

    /**
     * 浏览器信息
     * @type {*[]}
     */
    var BROWSER = [
        // Sogou.
        ['sg', / se ([0-9.x]+)/],
        ['360',function(ua){
            if(ua.indexOf("360 aphone browser") !== -1){
                return /\b360 aphone browser \(([^\)]+)\)/;
            }
            return /\b360(?:se|ee|chrome|browser)\b/;
        }],
        ['taobao', /\btaobrowser\/([0-9.]+)/],
        ['baidu', /\bbidubrowser[ \/]([0-9.x]+)/],
        // 后面会做修复版本号，这里只要能识别是 IE 即可。
        ['ie', reg_msie],
        ['mi', /\bmiuibrowser\/([0-9.]+)/],
        // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
        ['opera', function(ua){
            var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
            var re_opera_new = /\bopr\/([0-9.]+)/;
            return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
        }],
        ['chrome', / (?:chrome|crios|crmo)\/([0-9.]+)/],
        // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
        ['uc', function(ua){
            if(ua.indexOf('ucbrowser/') >= 0){
                return /\bucbrowser\/([0-9.]+)/;
            }else if(/\buc\/[0-9]/.test(ua)){
                return /\buc\/([0-9.]+)/;
            }else if(ua.indexOf('ucweb') >= 0){
                return /\bucweb[\/]?([0-9.]+)?/;
            }else{
                return /\b(?:ucbrowser|uc)\b/;
            }
        }],
        // Android 默认浏览器。该规则需要在 safari 之前。
        ['android', function(ua){
            if(ua.indexOf('android') === -1){return;}
            return /\bversion\/([0-9.]+(?: beta)?)/;
        }],
        ['safari', /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
        // 如果不能被识别为 Safari，则猜测是 WebView。
        ['webview', /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
        ['firefox', /\bfirefox\/([0-9.ab]+)/]
    ];

    /**
     * 检测函数
     * @param name
     * @param expression 检测方式，正则||检测函数
     * @param ua
     * @returns {boolean}
     */
    function detect(name,expression,ua) {
        var expr = u.isFunction(expression) ? expression.call(null, ua) : expression;
        if(!expr){
            return false
        }
        //默认信息
        var result = {
            name:name,
            version:NA_VERSION
        };

        //获取检测方式的形式
        var t = toString(expr);

        if(t === '[object RegExp]'){
            var m = expr.exec(ua);
            if(m) {
                if(m.length>=2 && m[1]) {
                    result.version = m[1];
                }
                return result;
            }
        } else if(u.isObject(t)) {
            if(expr.hasOwnProperty('version')) {
                result.version = expr.version;
            }
            return result;
        } else if (t === '[object String]'){
            if(~ua.indexOf(expr)) {
                return result;
            }
        } else if(expr === true) {
            return result;
        }
    }

    /**
     * 检测各个条件的封装
     * @param ua
     * @param patterns
     * @param factory 获取结果进行额外处理
     * @param detector 检测结果
     */
    function init(ua, patterns, factory, detector) {
        var detected = NA;
        each(patterns, function (pattern) {
            //检测项目名，检测条件，ua
            var d = detect(pattern[0], pattern[1], ua);
            //如果返回检测结果，则停止检测
            if (d) {
                detected = d;
                return false;
            }
        });
        factory.call(detector, detected.name, detected.version);
    }

    /**
     * 启动函数
     */
    function parse() {
        ua = (ua || '').toLowerCase();
        var detectResult = {};
        var ieCore = IEMode(ua);

        init(ua,BROWSER,function(name,version){
            var mode = version;
            if(ieCore){
                // IE 内核的浏览器，修复版本号及兼容模式。
                if(name === 'ie'){
                    version = ieCore.engineVersion || ieCore.engineMode;
                }
                mode = ieCore.engineMode;
            }

            //一长串的版本号变为主要版本
            //34.1.1847.13 ==> 34.1
            var v = parseFloat(version);

            detectResult.browser={
                name:name,
                version:v,
                fullVersion:version,
                mode:parseFloat(mode),
                compatible: ieCore ? ieCore.compatible : false
            };

            //浏览器name和v 为键值对，常用于判断
            detectResult[name] = v;

        },detectResult);

        return detectResult;
    }


    detector = parse(ua);

    //挂在window上，方便访问
    window.detector = detector;

    return detector;

    //helper
    function toString(object){
        return Object.prototype.toString.call(object);
    }

    function each(object, factory){
        for(var i=0,l=object.length; i<l; i++){
            if(factory.call(object, object[i], i) === false){break;}
        }
    }
});