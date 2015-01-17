/**
 * @file user-agent检测
 * @author shenli <meshenli@gmail.com>
 */
define(function (require) {

    var util = require('./util');
    var ua = window.navigator.userAgent.toLowerCase();
    var NA_VERSION = '-1';

    // 默认检测结果,无法识别的情况下
    var NA = {name: 'na', version: NA_VERSION};
    var uaDetectResult;
    var REG_MISE = /\b(?:mise|ie|trident\/[0-9].*rv[:])([0-9.]+)/; // 检测IE的正则


    /**
     * IE检测
     * @param {string} ua
     * @returns {null|Object} ie浏览器的相关信息
     */
    function getIeMode(ua) {
        var match;
        var browserVersion; // 浏览器版本
        var engineVersion; // 引擎版本
        var browserMode; // 浏览器模式
        var engineMode; // 引擎模型

        if (!REG_MISE.test(ua)) {
            return null;
        }

        // ie8+可以根据trident引擎来识别,并且在IE兼容模式中不会变化
        // http://msdn.microsoft.com/zh-cn/library/ie/hh869301(v=vs.85).aspx
        if (~ua.indexOf('trident/')) {
            match = /\btrident\/([0-9.]+)/.exec(ua); //如ie8 得到['trident/4.0', '4.0']
            if (match && match.length > 2) {
                //获取版本号
                engineVersion = match[1];
                var v = match[1].split('.');
                v[0] = parseInt(v[0], 10) + 4;
                browserVersion = v.join('.');
            }
        }

        //返回类似['mise 8.0',8.0]，如果ie8开启IE7兼容模式，将返回mise 7.0,
        match = REG_MISE.exec(ua);

        browserMode = match[1];
        if (typeof browserVersion === undefined) {
            browserVersion = browserMode;
        }

        var v_mode = match[1].split('.');

        v_mode[0] = parseInt(v_mode[0], 10) - 4;

        engineMode = v_mode.join('.');

        if (typeof engineVersion === undefined) {
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
     * @type {Object.<Array>}
     */
    var BROWSER = [
        // Sogou.
        ['sg', / se ([0-9.x]+)/],
        ['360', function (ua) {
            if (ua.indexOf("360 aphone browser") !== -1) {
                return /\b360 aphone browser \(([^\)]+)\)/;
            }
            return /\b360(?:se|ee|chrome|browser)\b/;
        }],
        ['taobao', /\btaobrowser\/([0-9.]+)/],
        ['baidu', /\bbidubrowser[ \/]([0-9.x]+)/],
        // 后面会做修复版本号，这里只要能识别是 IE 即可。
        ['ie', REG_MISE],
        ['mi', /\bmiuibrowser\/([0-9.]+)/],
        // Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
        ['opera', function (ua) {
            var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
            var re_opera_new = /\bopr\/([0-9.]+)/;
            return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
        }],
        ['chrome', / (?:chrome|crios|crmo)\/([0-9.]+)/],
        // UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
        ['uc', function (ua) {
            if (ua.indexOf('ucbrowser/') >= 0) {
                return /\bucbrowser\/([0-9.]+)/;
            }
            else if (/\buc\/[0-9]/.test(ua)) {
                return /\buc\/([0-9.]+)/;
            }
            else if (ua.indexOf('ucweb') >= 0) {
                return /\bucweb[\/]?([0-9.]+)?/;
            }
            else {
                return /\b(?:ucbrowser|uc)\b/;
            }
        }],
        // Android 默认浏览器。该规则需要在 safari 之前。
        ['android', function (ua) {
            if (ua.indexOf('android') === -1) {
                return;
            }
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
    function detect(name, expression, ua) {
        var expr = util.isFunction(expression) ? expression.call(null, ua) : expression;
        if (!expr) {
            return false
        }
        // 默认信息
        var result = {
            name: name,
            version: NA_VERSION
        };

        // 获取expression执行结果的类型
        var type = toString(expr);

        if (type === '[object RegExp]') {
            var m = expr.exec(ua);
            if (m) {
                if (m.length >= 2 && m[1]) {
                    result.version = m[1];
                }
                return result;
            }
        }
        else if (util.isPlainObject(type)) {
            if (expr.hasOwnProperty('version')) {
                result.version = expr.version;
            }
            return result;
        }
        else if (type === '[object String]') {
            if (~ua.indexOf(expr)) {
                return result;
            }
        }
        else if (expr === true) {
            return result;
        }
    }

    /**
     * 遍历检测各个条件
     * @param {string} ua
     * @param {Object} patterns
     * @param {Function}factory 获取结果进行额外处理
     * @param {Object} detector 检测结果
     * @param {string} detector.name 检测结果
     * @param {string} detector.version 版本
     * @param {string} detector.fullVersion 全部信息
     * @param {string} detector.mode IE内核
     * @param {string} detector.compatible 兼容模型
     */
    function init(ua, patterns, factory, detector) {
        var detected = NA;

        util.each(patterns, function (pattern) {
            var result = detect(pattern[0], pattern[1], ua);
            // 如果返回检测结果，则停止检测
            if (result) {
                detected = result;
                return false;
            }
        });

        factory.call(detector, detected.name, detected.version);
    }

    /**
     * 启动函数
     */
    function getDetectResult() {
        ua = (ua || '').toLowerCase();
        var detectResult = {};
        var ieCore = getIeMode(ua);

        init(ua, BROWSER, function (name, version) {
            var mode = version;
            if (ieCore) {
                // IE 内核的浏览器，修复版本号及兼容模式。
                if (name === 'ie') {
                    version = ieCore.engineVersion || ieCore.engineMode;
                }
                mode = ieCore.engineMode;
            }

            // 一长串的版本号变为主要版本
            // 34.1.1847.13 ==> 34.1
            var v = parseFloat(version);

            detectResult.browser = {
                name: name,
                version: v,
                fullVersion: version,
                mode: parseFloat(mode),
                compatible: ieCore ? ieCore.compatible : false
            };

            // 浏览器名字和版本，如 detectResult.chrome = 38

            detectResult[name] = v;

        }, detectResult);

        return detectResult;
    }


    uaDetectResult = getDetectResult(ua);

    // 挂在window上，方便访问
    window.detector = uaDetectResult;

    return uaDetectResult;

    // helper
    function toString(object) {
        return Object.prototype.toString.call(object);
    }

});