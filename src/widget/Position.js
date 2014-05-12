/**
 * @file 定位工具
 * @author shenli
 */
define(function (require) {

    var lib = require('winnie/lib');

    var VIEWPORT = { _id: 'VIEWPORT', nodeType: 1 };
    var Position = {};
    var isPosFixed = false; //是否fixed
    var isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('mise 6') !== -1;

    Position.pin = function (target, base) {
        target = normalize(target);
        base = normalize(base);

        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        if(lib.getStyle(target.element,'position') !== 'fixed' || isIE6) {
            lib.setStyle(target.element,{
                position:'absolute'
            });

            isPosFixed = false;
        } else {
            isPosFixed = true;
        }

        // 将位置属性归一化为数值
        // 注：必须放在上面这句 `css('position', 'absolute')` 之后，
        //    否则获取的宽高有可能不对
        posConverter(target);
        posConverter(base);


        var parentOffset = getParentOffset(target);
        var baseOffset = base.offset();

        var top = baseOffset.top + base.y - target.y - parentOffset.top;
        var left = baseOffset.left + base.x - target.x - parentOffset.left;

        lib.setStyle(target.element,{
            left:left+'px',
            top:top+'px'
        });

    };


    // 这是当前可视区域的伪 DOM 节点
    // 需要相对于当前可视区域定位时，可传入此对象作为 element 参数
    Position.VIEWPORT = VIEWPORT;

//    helpers

    function numberize(s) {
        return parseFloat(s, 10) || 0;
    }
    /**
     * 转为标准的位置对象格式{ element: a, x: 0, y: 0 }
     * @param posObj
     * element传入是id选择器或者是dom元素
     * @returns {*|{}}
     */
    function normalize(posObj) {

        posObj = posObj || {};

        var element = typeof  posObj.element === 'string' ? lib.g(posObj) : posObj.element;

        element = element || VIEWPORT;
        if (!element || element.nodeType !== 1) {
            throw  new Error('posObj.element is invalid.');
        }

        var result = {
            element: element,
            x: posObj.x || 0,
            y: posObj.y || 0
        };

        var isVIEWPORT = (element === VIEWPORT || element['_id'] === 'VIEWPORT');

        result.offset= function() {
            if(isPosFixed) {
                return {
                    left:0,
                    top:0
                };
            } else if (isVIEWPORT) {
                return {
                    top:lib.getScrollTop(),
                    left:lib.getScrollLeft()
                };
            } else {
                return lib.getPosition(element);
            }
        };

        //计算图形尺寸
        result.size = function() {
            if(isVIEWPORT) { //获取窗口的宽高
                return {
                    width:lib.getViewWidth(),
                    height:lib.getViewHeight()
                };
            } else{
                return {
                    width:element.clientWidth,
                    height:element.clientHeight
                };
            }
        };

        return result;
    }

    function posConverter(posObj) {
        posObj.x = xyConverter(posObj.x, posObj, 'width');
        posObj.y = xyConverter(posObj.y, posObj, 'height');
    }

    function xyConverter(x,posObj,type) {
        //转为string
        x = x + '';

        //去掉px
        x = x.replace(/px/gi, '');

        if(/\D/.test(x)) {
            x = x.replace(/(?:top|left)/gi,'0%')
                 .replace(/(?:bottom|right)/gi,'100%')
                 .replace(/center/gi,'50%');

        }

        // 将百分比转为像素值
        if (x.indexOf('%') !== -1) {
            //支持小数
            x = x.replace(/(\d+(?:\.\d+)?)%/gi, function(m, d) {
                return posObj.size()[type] * (d / 100.0);
            });
        }


//        处理100%+20px的情况
       /* if(/[+\-*\/]/.test(x)){ //匹配加减乘除
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = (new Function('return ' + x))();
            } catch (e) {
                throw new Error('Invalid position value: ' + x);
            }
        }*/

        return parseFloat(x, 10) || 0;
    }

    /**
     * 获取最近的祖先定位元素的offset
     * @param pinObj
     */
    function getParentOffset(pinObj) {
       var parent = pinObj.element.offsetParent;

        if(parent === document.documentElement) {
            parent = document.body;
        }

        if(isIE6) {
            lib.setStyle(parent,{
               zoom:1
            });
        }

        var offset;
        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent === document.body &&
            lib.getStyle(parent,'position') === 'static') {
            offset = { top:0, left: 0 };
        } else {
            offset = lib.getPosition(parent);
        }

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += numberize(lib.getStyle(parent,'border-top-width'));
        offset.left += numberize(lib.getStyle(parent,'border-left-width'));


        return offset;

    }
    return Position;
});