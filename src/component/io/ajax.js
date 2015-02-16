/**
 * @file ajax
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Promise = require('../../lib/promise');
    var assert = require('../../lib/assert');
    var util = require('../../lib/util');
    var Emitter = require('../../lib/emitter');

    var TIMESTAMP = '_';


    /**
     * 创建xhr
     */
    function createXHR() {
        var xhr = window.XMLHttpRequest
            ? new XMLHttpRequest()
            : new window.ActiveXObject('Microsoft.XMLHTTP');

        return xhr;
    }


    function serializeArray(prefix, array) {
        var encodeKey = prefix ? encodeURIComponent(prefix) : '';
        var encoded = [];
        var item;

        for (var i = 0; i < array.length; i++) {
            item = array[i];
            encoded[i] = serializeData('', item);
        }

        return encodeKey
            ? encodeKey + '=' + encoded.join(',')
            : encoded.join(',');
    }

    /**
     * 序列化请求的数据
     * @param {string} prefix
     * @param {object|string|array}data
     * @return {string}
     */
    function serializeData(prefix, data) {
        if (arguments.length === 1) {
            data = prefix;
            prefix = '';
        }

        if (data == null) {
            data = '';
        }

        var getKey = serializeData.getKey;
        var encodeKey = prefix ? encodeURIComponent(prefix) : '';

        var type = Object.prototype.toString.call(data);

        switch (type) {
            case '[object Array]':
                return serializeArray(prefix, data);
            case '[object Object]':
                var result = [];
                var name;
                var propertyKey;
                var propertyValue;
                for (name in data) {
                    propertyKey = getKey(name, prefix);
                    propertyValue = serializeData(propertyKey, data[name])
                    result.push(propertyValue);
                }
                return result.join('&');
            default :
                return encodeKey
                    ? encodeKey + '=' + encodeURIComponent(data)
                    : encodeURIComponent(data);
        }
    }

    serializeData.getKey = function (propertyName, parentKey) {
        return parentKey ? parentKey + '.' + propertyName : propertyName;
    };


    /**
     * Ajax类
     *
     * 通过`require('component/io/ajax').Ajax`访问该类构造函数，
     * 其中`require('component/io/ajax')`是该类的全局实例
     * @constructor
     */
    function Ajax() {

        this.hooks = {
            serializeData: serializeData,
            serializeArray: serializeArray
        };

        this.config = {
            cache: false,
            timeout: 0,
            charset: ''
        };

    }

    /**
     * 发送请求
     * @param {object} options
     */
    Ajax.prototype.request = function (options) {

        assert.hasProperty(options, 'url', 'url property is required');

        var defaultOptions = {
            method: 'POST',
            data: {},
            cache: this.config.cache,
            timeout: this.config.timeout,
            charset: this.config.charset
        };

        options = util.extend(defaultOptions, options);

        var xhr = createXHR();

        var fakeXHR = {};

        var xhrWrapper = {
            abort: function () {
                xhr.onreadystatechange = null;
                try {
                    xhr.abort();
                }
                catch (e) {

                }

                if (!fakeXHR.status) {
                    fakeXHR.status = 0;
                }

                fakeXHR.readyState = xhr.readyState;
                fakeXHR.responseText = '';
                fakeXHR.responseXML = '';
                ajaxPromise.reject(fakeXHR);
            },
            setRequestHeader: function (name, value) {
                xhr.setRequestHeader(name, value);
            },
            getAllResponseHeaders: function () {
                return xhr.getAllResponseHeaders();
            },
            getRequestHeader: function () {
                return xhr.getRequestHeader();
            },
            getRequestOption: function (key) {
                return options[key];
            }
        };


        util.extend(fakeXHR, xhrWrapper);

        var eventObject = {
            xhr: fakeXHR,
            options: options
        };

        var ajaxPromise = new Promise(function (resolve, reject) {
            /**
             * 对xhr的各种状态进行处理
             * @see https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest
             */
            var processRequestState = function () {

                // 整个请求过程已经完毕
                if (xhr.readyState === 4) {
                    var status = fakeXHR.status || xhr.status;

                    // https://github.com/jquery/jquery/blob/master/src/ajax/xhr.js#L20

                    if (status === 1223) {
                        status = 204;
                    }

                    // 原生xhr的属性转到fadeXHR上
                    fakeXHR.status = xhr.status || status;
                    fakeXHR.readyState = xhr.readyState;
                    fakeXHR.responseText = xhr.responseText;
                    fakeXHR.responseXML = xhr.responseXML;

                    // 如果请求跪了
                    if (status < 200 || (status > 300 && status !== 304)) {
                        reject(fakeXHR);
                        return;
                    }

                    var data = xhr.responseText;

                    if (options.dataType === 'json') {
                        try {
                            data = util.parseJSON(data);
                        }
                        catch (e) {
                            fakeXHR.error = e;
                            reject(fakeXHR);
                            return;
                        }

                    }

                    // 数据处理成功之后，进行回调
                    resolve(data);

                }

            };

            xhr.onreadystatechange = util.bind(processRequestState, this);
        });


        ajaxPromise.then(
            /**
             * @event done
             * 任意一个请求成功时触发
             *
             * @param {object} options 请求的配置信息
             * @param {fakeXHR} xhr 请求对象
             */
            util.bind(this.fire, this, 'done', eventObject),

            /**
             * @event fail
             * 任意一个请求失败时触发
             *
             * @param {object} options 请求的配置信息
             * @param {fakeXHR} xhr 请求对象
             */
            util.bind(this.fire, this, 'fail', eventObject)
        );



        var method = options.method.toUpperCase();

        var data = {};
        var query;

        if (method === 'GET') {
            util.extend(data, options.data);
        }

        if (options.cache === false) {
            data[TIMESTAMP] = +new Date();
        }

        query = this.hooks.serializeData('', data, 'application/x-www-form-urlencoded');

        var url = options.url;

        if (query) {
            var delimiter = url.indexOf('?') >= 0 ? '&' : '?';
            url += delimiter + query;
        }

        // https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest#open
        xhr.open(method, url, true);

        if (method === 'GET') {
            xhr.send();
        }
        else {
            var contentType = options.contentType || 'application/x-www-form-urlencoded';
            query = this.hooks.serializeData('', options.data, contentType, fakeXHR);

            if (options.charset) {
                contentType += ';charset' + options.charset;
            }

            xhr.setRequestHeader('Content-Type', contentType);
            xhr.send(query);
        }

        if (options.timeout > 0) {
            var notifyTimeout = function () {

                this.fire('timeout', {
                    xhr: fakeXHR,
                    options: options
                });

                fakeXHR.status = 408;
                fakeXHR.abort();
            };

            var timer = setTimeout(util.bind(notifyTimeout, this), options.timeout);

            ajaxPromise.ensure(function () {
                clearTimeout(timer);
            });

        }


        mixPromise(fakeXHR, ajaxPromise);

        return fakeXHR;

    };

    function mixPromise(xhr, promise) {

        xhr.then = function (onFulFilled, onRejected) {
            return promise.then(onFulFilled, onRejected);
        };

        xhr.fail = function (callback) {
            return promise.fail(callback);
        };

        xhr.done = function (callback) {
            return promise.done(callback);
        };

        xhr.ensure = function (callback) {
            return promise.ensure(callback);
        };
    }

    /**
     * 发起一个`GET`请求
     *
     * @param {string} url 请求的地址
     * @param {Object} [data] 请求的数据
     * @param {boolean} [cache] 决定是否允许缓存
     * @return {fakeXHR}
     */
    Ajax.prototype.get = function (url, data, cache) {
        var options = {
            method: 'GET',
            url: url,
            data: data,
            cache: cache || this.config.cache
        };
        return this.request(options);
    };

    /**
     * 发起一个`GET`请求并获取JSON数据
     *
     * @param {string} url 请求的地址
     * @param {Object} [data] 请求的数据
     * @param {boolean} [cache] 决定是否允许缓存
     * @return {fakeXHR}
     */
    Ajax.prototype.getJSON = function (url, data, cache) {
        var options = {
            method: 'GET',
            url: url,
            data: data,
            dataType: 'json',
            cache: cache || this.config.cache
        };
        return this.request(options);
    };


    /**
     * 发起一个`POST`请求
     *
     * @param {string} url 请求的地址
     * @param {Object} [data] 请求的数据
     * @param {string} [dataType="json"] 指定响应的数据格式
     * @return {fakeXHR}
     */
    Ajax.prototype.post = function (url, data, dataType) {
        var options = {
            method: 'POST',
            url: url,
            data: data,
            dataType: dataType || 'json'
        };
        return this.request(options);
    };


    Emitter.mixTo(Ajax.prototype);

    var instance = new Ajax();

    instance.Ajax = Ajax;


    return instance;
});
