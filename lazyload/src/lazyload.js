define(function(require, exports, module) {

    //获取相应的模块
    var $=require("$");
    var $window = $("window");
    var Lazyload=function(options) {
        if(!(this instanceof Lazyload)) {
            return new Lazyload(options);
        }

        var settings = {
            element:".lazy",
            threshod:0,
            failureLimit:0,
            event:"scroll",
            effect:"show",
            container:window,
            dataAttribute:"original",
            skipInVisible:true,
            appear:null,
            load:null
        };
//        options.failureLimit?null:delete options.failureLimit;
//        options.effectSpeed?null:delete options.effectSpeed;
        if (options) {
            $.extend(settings, options);
        }

        this.settings=settings;
        this.elements=$(settings.element);
        $container=(settings.container===undefined||settings.container===window)
            ?$window:$(settings.container);

        if(0===settings.event.indexOf("scroll")) {
            $container.on(settings.event,function(e) {
                return this.update();
            })
        }

    }

    Lazyload.prototype.update=function() {
        var counter= 0,settings=this.settings;

        $(settings.element).each(function() {
            var $this = $(this);
            if(settings.skipInVisible&&!$this.is(":visible")) {
                return;
            }

            if($.aboveTop(this,settings)|| $.isLeftOfBegin(this,settings)) {

            }else if(!$.belowFold(this,settings)&&!$.rightOfFold(this,settings)) {
                counter=0;
            }else{
                if(++counter>settings.failureLimit) {
                    return false;
                }
            }
        });
    };

    Lazyload.prototype.setup=function(){
        var settings=this.settings;
        var that=this;
        this.elements.each(function() {
            var self=this;
            var $self = $(this);
            self.loaded=false;
            $self.one("appear",function() {
                if(!this.loaded) {
                    if(settings.appear) {
                        var elementsLeft=that.elements.length;
                        settings.appear.call(self, elementsLeft, settings);
                    }
                }

                $("<img/>").on("load",function() {
                    $self.hide().attr("src",$self.data(settings.dataAttribute));
                    $self.loaded=true;

                    var temp= $.grep(that.elements,function(element) {
                        return !element.loaded;
                    })

                    that.elements = $(temp);
                    if(settings.load) {
                        var elementsLeft=that.elements.length;
                        settings.load.call(self, elementsLeft, settings);
                    }
                }).attr("src",$self.data(settings.dataAttribute));

            });

            //通过appear来触发事件载入原始的图片
            if(0!==settings.event.indexOf("srcoll")) {
                $self.on(settings.event,function(event) {
                    if(!self.loaded) {
                        $self.trigger("appear");
                    }
                })
            }
        });

        //判断当窗口resize
        $window.on("resize",function(e) {
            that.update();
        })

        $(document).ready(function() {
            that.update();
        });
    };

    //jquery空间上的方法
    $.belowFold=function(element,settings){
        var fold;
    };
    module.exports = Lazyload;

});
