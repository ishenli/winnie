/**
 * @file Clipboard 跨浏览器粘贴复制
 * @author ishenli (shenli03@baidu.com)
 * 参考 https:// github.com/zeroclipboard/zeroclipboard
 */
/* jshint ignore:start */
define(function (require) {

    var Widget = require('./Widget');
    var $ = require('jquery');

    var currentElement;

    var Clipboard = Widget.extend({
        type: 'Clipboard',

        /**
         * 控件配置项
         *
         * @name options
         * @type {Object}
         * @property {string} options.moviePath 剪切板功能的swf文件地址，为避免跨域问题，应尽可能使用同域地址
         * @property {string} options.trustedOrigins 可靠的源，一般使用默认值
         * @property {string} options.text 将被复制的内容
         */
        options: {
            moviePath: 'ZeroClipboard.swf',
            trustedOrigins: null,
            text: null,
            allowScriptAccess: 'sameDomain'
        },
        init: function () {
            var self = this;

            if (Clipboard.prototype._singleton) {
                return Clipboard.prototype._singleton;
            }

            Clipboard.prototype._singleton = self;
            this.handlers = {};
            this.gluedElements = [];
            this.glue(this.element);
            if (this.detectFlashSupport) {
                _bridge();
            }
        },
        /**
         * 重置
         * @returns {Clipboard}
         */
        resetBridge: function () {
            var $hb = $(this.htmlBridge);
            $hb.css({
                left: '-9999px',
                top: '-9999px'
            });
            $hb.removeAttr('title');
            $hb.removeAttr('data-clipboard-text');
            currentElement = null;
            return this;
        },
        /**
         * 设置当前的剪切板控制器
         * @param {string|HTMLElement}ele 传入的dom节点或选择器
         * @returns {Clipboard}
         */
        setCurrent: function (ele) {
            if (typeof ele === 'string' || ele.nodeType) {
                ele = $(ele);
            }
            currentElement = ele;
            this.reposition();
            return this;
        },
        /**
         * 存储复制的内容
         * @param {string} text
         */
        setText: function (text) {
            if (text && text !== '') {
                this.flashBridge.setText(text);
            }
        },
        /**
         * 设置flash的大小
         * @param {number} width
         * @param {number} height
         */
        setSize: function (width, height) {
            this.flashBridge.setSize(width, height);
            return this;
        },
        /**
         * 将元素放入gluedElements
         * @param {HTMLElement}  elements
         */
        glue: function (elements) {
            var me = this;
            elements = this._prepGlue(elements);
            $.each(elements, function (i, el) {
                if ($.inArray(el, me.gluedElements) === -1) {
                    me.gluedElements.push(el);
                    $(el).on('mouseover', _elementMouseOver);
                }

            });

            return this;
        },
        /**
         * 将元素移出gluedElements，并off掉事件
         * @param {Array} elements
         * @returns {Clipboard}
         */
        unglue: function (elements) {
            var me = this;
            $.each(elements, function (i, ele) {
                $(ele).off('mouseover', me._mouseover);
                var arrIndex = $.inArray(ele, me.gluedElements);
                if (arrIndex !== -1) {
                    me.gluedElements.splice(arrIndex, 1);
                }
            });

            return this;
        },
        _prepGlue: function (elements) {
            if (typeof elements === 'string') {
                throw new TypeError('Clipboard does not accept query string');
            }

            if (!elements.length) {
                return [elements];
            }

            return elements;
        },
        /**
         * 该方法主要将htmlBridge的flash对象放在点击区域的上方,点击劫持
         */
        reposition: function () {
            if (!currentElement) {
                return false;
            }

            var pos = _getDOMObjectPosition();

            var $htmlBridge = $(this.htmlBridge);

            $htmlBridge.css({
                left: pos.left,
                top: pos.top,
                width: pos.width,
                height: pos.height,
                zIndex: pos.zIndex + 1
            });

            this.setSize(pos.width, pos.height);
            return this;
        },
        /**
         * 检测是否支持flash
         * @returns {boolean}
         * http:// stackoverflow.com/questions/998245
         */
        detectFlashSupport: function () {
            var hasFlash = false;
            if (typeof  ActiveXObject === 'function') {
                try {
                    if (new ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
                        hasFlash = true;
                    }
                }
                catch (error) {
                }
            }

            if (!hasFlash && window.navigator.mimeTypes['application/x-shockwave-flash']) {
                hasFlash = true;
            }

            return hasFlash;
        },
        destroy: function () {
            this.unglue(this.gluedElements);
            $(this.htmlBridge).remove();
            this.htmlBridge = this.flashBridge = null;
            delete Clipboard.prototype._singleton;
        },
        fireEvent: function (env, args) {
            var event = env.toString().toLowerCase().replace('/^on/', '');
            var element = currentElement;
            var me = this;
            switch (event) {
                case 'mouseover':
                    me.fire('mouseover', args, element);
                    break;
                case 'mouseout':
                    this.resetBridge();
                    me.fire('mouseout', args, element);
                    break;
                case 'complete':
                    me.fire('complete', args, element);
                    break;
            }
        }
    });

    /**
     * 这个是swf提供的方法，需写在对象上
     * @param {Object} env 包含flash提供的基本事件 mouseover，mousenter，complete
     * @param {Object} args
     */
    Clipboard.dispatch = function (env, args) {
        Clipboard.prototype._singleton.fireEvent(env, args);
    };
    /**
     * 创建flash
     * @private
     */
    function _bridge() {
        var client = Clipboard.prototype._singleton;
        var container = $('#global-clipboard-html-bridge');
        if (!container.length) {
            var flashVars = _vars(client);
            var html = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                'id="global-clipboard-flash-bridge" width="100%" height="100%">' +
                '<param name="movie" value="' + client.get('moviePath') + '"/>' +
                '<param name="allowScriptAccess" value="' + client.get('allowScriptAccess') + '"/>' +
                '<param name="scale" value="exactfit"/>' +
                '<param name="loop" value="false"/>' +
                '<param name="menu" value="false"/><param name="quality" value="best" />' +
                '<param name="bgcolor" value="#ffffff"/>' +
                '<param name="wmode" value="transparent"/>' +
                '<param name="flashvars" value="' + flashVars + '"/>' +
                '<embed src="' + client.get('moviePath') + '" loop="false" menu="false" quality="best" ' +
                'bgcolor="#ffffff" width="100%" height="100%" name="global-clipboard-flash-bridge"  ' +
                'allowScriptAccess="always"  allowFullScreen="false" type="application/x-shockwave-flash" ' +
                'wmode="transparent" pluginspage="http:// www.macromedia.com/go/getflashplayer"' +
                'flashvars="' + flashVars + '" scale="exactfit">' +
                '</embed>' +
                '</object>';
            // 将创建的flash对象放入dom中，并设置相关属性
            container = $('<div></div>');
            container.attr('id', 'global-clipboard-html-bridge')
                .attr('class', 'global-clipboard-container')
                .attr('data-clipboard-ready', false)
                .css({
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    zIndex: 9999,
                    width: '20px',
                    height: '20px'
                });
            container = $('<div id="global-clipboard-html-bridge"' +
                'class="global-clipboard-container" ' +
                'data-clipboard-ready="true" style="position: absolute; left: -9999px; top: -9999px; width: 15px;' +
                    ' height: 15px; z-index: 9999;">' +
                '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
                    'id="global-clipboard-flash-bridge" width="100%" height="100%">  ' +
                '<param name="movie" value="./clipboard/ZeroClipboard.swf?nocache=1405183284535">' +
                '<param name="allowScriptAccess" value="always">' +
                '<param name="scale" value="exactfit">' +
                '<param name="loop" value="false">' +
                '<param name="menu" value="false">' +
                '<param name="quality" value="best">' +
                '<param name="bgcolor" value="#ffffff">' +
                '<param name="wmode" value="transparent">' +
                '<param name="flashvars" value="">' +
                '<embed src="ZeroClipboard.swf?nocache=1405183284535" ' +
                'loop="false" menu="false" ' +
                'quality="best" bgcolor="#ffffff" width="100%" height="100%" ' +
                'name="global-clipboard-flash-bridge" allowscriptaccess="always"' +
                'allowfullscreen="false" type="application/x-shockwave-flash"' +
                ' wmode="transparent" pluginspage="http:// www.macromedia.com/go/getflashplayer" ' +
                'flashvars="" scale="exactfit">' +
                '</object></div>'
            );
            $('body').append(container);
        }
        client.htmlBridge = container[0];
        client.flashBridge = document['global-clipboard-flash-bridge'] || container.children()[0].lastElementChild;
    }

    /**
     * 获取flash object的值
     * @private
     */
    function _vars(client) {
        var str = [];
        var origins = [];
        var trustedOrigins = client.get('trustedOrigins');
        var trustedDomains = client.get('trustedDomains');
        var amdModuleId = client.get('amdModuleId');
        var cjsModuleId = client.get('cjsModuleId');
        if (trustedOrigins) {
            if (typeof trustedOrigins === 'string') {
                origins = origins.push(trustedOrigins);
            }
            else if (typeof trustedOrigins === 'object' && 'length' in trustedOrigins) {
                origins = origins.concat(trustedOrigins);
            }
        }
        if (trustedDomains) {
            if (typeof trustedDomains === 'string') {
                origins = origins.push(trustedDomains);
            }
            else if (typeof trustedDomains === 'object' && 'length' in trustedDomains) {
                origins = origins.concat(trustedDomains);
            }
        }
        if (origins.length) {
            str.push('trustedOrigins=' + encodeURIComponent(origins.join(',')));
        }
        if (typeof amdModuleId === 'string' && amdModuleId) {
            str.push('amdModuleId=' + encodeURIComponent(amdModuleId));
        }
        if (typeof cjsModuleId === 'string' && cjsModuleId) {
            str.push('cjsModuleId=' + encodeURIComponent(cjsModuleId));
        }
        return str.join('&');
    }

    /**
     * 获取点击区域的坐标和大小
     * @private
     */
    function _getDOMObjectPosition() {
        var offset = currentElement.offset();
        var width = currentElement.outerWidth();
        var height = currentElement.outerHeight();

        return {
            top: offset.top,
            left: offset.left,
            width: width,
            height: height,
            zIndex: currentElement.css('zIndex')
        };
    }

    /**
     * 鼠标移上去的监听函数
     * @param {Object} event
     * @private
     */
    var _elementMouseOver = function (event) {
        if (!Clipboard.prototype._singleton) {
            return;
        }

        var target;
        if (this !== window) {
            target = this;
        }
        Clipboard.prototype._singleton.setCurrent(target);
    };

    window.ZeroClipboard = Clipboard;

    return Clipboard;
});
/* jshint ignore:end */
