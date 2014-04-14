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

    describe('event', function () {
        it('事件处理',function (){
            var ul = container.getElementsByTagName('ul')[0];
            var result;

            lib.on(ul,'click',function(e) {
                result = 'click done';
            });

            expect(result).not.toBe('click done');

            lib.fire(ul,'click');

            expect(result).toBe('click done');

        });

    });
});