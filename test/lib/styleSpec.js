/**
 * @file lib test
 * @author shenli （meshenli@gmail.com）
 */
define(function(require) {

    var lib = require('lib');

    var htmlHelper = require('test/htmlHelper');

    var container;

    beforeEach(function () {
        container = htmlHelper.add(''
            + '<ul class="list" id="ulTag">'
            +   '<li class="list-item" id="liTag">'
            +       '<span>列表内容</span>'
            +   '</li>'
            + '</ul>'
            + '<a id="aTag">'
            +   '<span>标签内容</span>'
            + '</a>'
        );
    });

    afterEach(function () {
        htmlHelper.remove(container);
    });

    describe('style', function () {
        it('判断是否支持某个样式',function (){
            var r = lib.detectProperty('transform');

            expect(r).toBe('-webkit-transform');
        });

        it('设置css3的属性',function (){
            var css3={
                    transform:'scale(1.3)'
                };
            lib.setStyle(lib.g('ulTag'), css3);

            console.log(lib.getStyle(lib.g('ulTag'),'transform'));
        });


    });
});