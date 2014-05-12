/**
 * @file 浮层
 * @author shenli
 */
define(function (require) {

    var lib = require('winnie/lib');

    var Widget = require('./Widget');

    var Position = require('./Position');

    var u = require('underscore');

    var Overlay = Widget.extend({
        type:'Overlay',
        options:{
            width:'500px',
            height:'500px',
            visible:false,
            zIndex:99,
            align: {
                // element 的定位点，默认为左上角
                selfXY: [0, 0],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [0, 0]
            },
            parentNode:document.body

        },
        show:function() {
            if(!this.rendered) {
                this.render();
            }
            this.set('visible', true);
            lib.show(this.element);
            //重新计算定位
            this._setPosition();

            return this;
        },

        hide:function() {
            if(!this.rendered) {
                return this;
            }
            this.set('visible', false);
            lib.hide(this.element);
            return this;
        },
        init:function(){

            //用户计算window resize的定位计算
            Overlay.allOverlays.push(this);
        },
        render:function() {
            var template =this.get('template');

            if(lib.g(this.element)){
                this.element = lib.g(this.element);
                template && (this.element.innerHTML = template);
            } else {
//                var frag = document.createDocumentFragment();
                var div = document.createElement('div');
                if(template){
                    div.innerHTML = template;
                    this.element = div.children[0]
                } else {
                    this.element = div;
                }
                this.get('parentNode').appendChild(this.element);
            }



            lib.setStyle(this.element,{
                width:this.get('width'),
                height:this.get('height'),
                zIndex:this.get('zIndex')
            });

            //首先将元素hide
            var position = lib.getStyle(this.element, 'position');
            if(position === 'static' || position === 'relative') {
                lib.setStyle(this.element,{
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
            }

            this.rendered = true;
        },
        dispose:function() {
            lib.earse(this, Overlay.allOverlays);
            return Overlay.superclass.dispose.call(this);
        },
        _setPosition:function(align) {

            if(!isInDocument(this.element)){
                return;
            }

            align || (align = this.get('align'));
            if(!align) {
                return;
            }

            //如果起先是隐藏的
            var isHidden = lib.getStyle(this.element, 'display') === 'none';


            if(isHidden) {
                //放入文档流中，但不可见
                lib.setStyle(this.element,{
                    visibility:'hidden',
                    display:'block'
                });
            }

            //进行定位计算
            Position.pin({
                element: this.element,
                x:align.selfXY[0],
                y:align.selfXY[1]
            },{
                element:align.baseElement,
                x:align.baseXY[0],
                y:align.baseXY[1]
            });

            //重新可见
            if(isHidden) {
                lib.setStyle(this.element, {
                    visibility: 'visible'
                });
            }

            return this;
        },
        /**
         * arr 元素数组，表示点击到这些元素上浮层不消失
         * @param arr
         * @private
         */
        _blurHide:function(arr) {
            arr.push(this.element);
            this._relativeElements = arr;
            Overlay.blurOverlays.push(this);
        }

    });

    Overlay.blurOverlays = [];
    lib.on(document ,'click', function(e) {
        hideBlurOverlays(e);
    });


    //window resize 重新计算浮层
    var timeout;
    var winHeight = lib.getViewHeight();
    var winWidth = lib.getViewWidth();
    Overlay.allOverlays = [];

    lib.on(window,'resize',function() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(function(){
            var winNewHeight = lib.getViewHeight();
            var winNewWidth = lib.getViewWidth();

            if(winNewHeight !== winHeight || winNewWidth !== winWidth) {
                u.each(Overlay.allOverlays,function(item,i) {
                    if(!item || !item.get('visible')) {
                        return;
                    }
                    item._setPosition();
                });
            }
            winWidth = winNewWidth;
            winHeight = winNewHeight;
        },80);
    });
    //helpers
    function isInDocument(element) {
        return lib.contains(document.documentElement,element);
    }


    function hideBlurOverlays(e) {
        u.each(Overlay.blurOverlays,function(item,index) {
            // 当实例为空或隐藏时，不处理
            if(!item || !item.get('visible')) {
                return;
            }
            // 遍历 _relativeElements ，当点击的元素落在这些元素上时，不处理,如关闭的按钮
            for(var i=0; i<item._relativeElements.length; i++) {
                var el = item._relativeElements[i];
                if (el === e.target || lib.contains(el, e.target)) {
                    return;
                }
            }
            // 到这里，判断触发了元素的 blur 事件，隐藏元素
            item.hide();
        });
    }
    return Overlay;
});