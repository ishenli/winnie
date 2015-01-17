/**
 * @file 浏览器特征检测
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var propertyPrefixes = [
        'Webkit',
        'Moz',
        'O',
        // ms is special .... !
        'ms'
    ];
    var propertyPrefixesLength = propertyPrefixes.length;
    var REG_PREFIX = /-([a-z])/ig;

    var documentElement = document && document.documentElement;

    var documentStyle = documentElement.style;

    var vendorInfos = {};


    var REG_TRANSFORM = /([^(]+)\(([^)]+)\)/g;
    /**
     * 将css的属性值转为DOM中的属性 如 -webkit-xxx => WebkitXxx
     * @param {string} name
     */
    function getVendorInfo(name) {

        // animate-name => animateName
        if (name.indexOf('-') !== -1) {
            name = name.replace(REG_PREFIX, upperCase);
        }

        if (vendorInfos[name]) {
            return vendorInfos[name];
        }

        if (name in documentStyle) {
            vendorInfos[name] = {
                propertyName: name,
                propertyNamePrefix: ''
            };
        }
        else {
            // 需要加前缀的
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1);
            var vendorName;
            var propertyNamePrefix;

            // 遍历style
            for (var i = 0; i < propertyPrefixesLength; i++) {
                propertyNamePrefix = propertyPrefixes[i];
                vendorName = propertyNamePrefix + upperFirstName;
                if (vendorName in documentStyle) {
                    vendorInfos[name] = {
                        propertyName: vendorName,
                        propertyNamePrefix: propertyNamePrefix
                    };
                }
            }
        }


        // name没有则设为null
        vendorInfos [name] = vendorInfos[name] || null;

        return vendorInfos[name];
    }

    function upperCase() {
        return arguments[1].toUpperCase();
    }

    var exports = {};


    exports.getCssVendorInfo = function (name) {
        return getVendorInfo(name);
    };


    exports.detectProperty = function(property) {
        var vendorInfo = exports.getCssVendorInfo(property);
        if (vendorInfo.propertyNamePrefix) {
            property = '-' + vendorInfo.propertyNamePrefix.toLowerCase()
                    + '-' + property;
        }
        return property;
    };


    /**
     * 获取transform的值
     * @param {string} str
     */
    exports.parseTransform = function(str) {
        var res = {};

        str.replace(REG_TRANSFORM, function ($0, $1, $2) {
            res[$1.trim()] = $2.trim();
        });

        return res;
    };


    /**
     * 字符串化transform属性
     *
     * @inner
     * @param {Object} obj
     * @return {string}
     */
    exports.stringifyTransform = function (obj) {
        var res = [];

        Object.keys(obj).forEach(function (key) {
            res.push(key + '(' + obj[key] + ')');
        });

        return res.join(' ');
    };

    return exports;
});
