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

    describe('dom', function () {
        it('判断元素的标签名',function (){
            var form = document.createElement('form');
            expect(lib.isTagElement(form ,'form')).toBeTruthy();
            var ul = container.getElementsByTagName('ul')[0];
            expect(lib.isTagElement(ul ,'ul')).toBeTruthy();
        });

        it('元素包含另一个元素',function () {
            var ul = lib.g('ulTag');
            var li = lib.g('liTag');
            expect(lib.dom.contains(ul, li)).toBeTruthy();
        });

    });
});