/**
 * @file selector
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var dom = require('lib/dom');
    var util = require('lib/util');

    describe('create', function () {
        it('ceate should work', function () {
            var div = dom.create('<div>');
            var html;
            var tag;

            // 下面几个标签比较特殊
            util.each(['option', 'td', 'th', 'tr', 'tbody', 'thead', 'tfoot'], function (tag) {
                html = '<' + tag + '></' + tag + '>';
                div.appendChild(dom.create(html));
                html = div.innerHTML.toLowerCase();

                expect((html.indexOf('<' + tag + '>') === 0)).toBe(true);
                div.innerHTML = '';
            });


            html = 'script';


            // 检测script
            div.appendChild(dom.create('<script></script>'));

            html = util.trim(div.innerHTML.toLowerCase());

            expect(html.indexOf('<script>') === 0 || html.indexOf('<script')).toBe(true);

            expect(dom.create('hello world').nodeType).toBe(3);

            expect(dom.create('<img id="hello"').id).toBe('hello');

            // 多个标签返回fragment
            expect(dom.create('<p></p><div></div>').nodeType).toBe(11);
        });

        it('create option works', function () {
            var s = dom.create('<select>');
            s.appendChild(dom.create('<option>1</option>'));
            expect(s.innerHTML.toLowerCase().indexOf('option')).toBeGreaterThan(-1);
        });

        it('create style works', function () {
            var style, d;

            expect((style = dom.create('<style>.ie678{width:99px}</style>')).nodeName.toLowerCase()).toBe('style');
            document.body.appendChild(d = dom.create('<div class="ie678"></div>'));
            document.getElementsByTagName('head')[0].appendChild(style);
            expect(dom.width(d)).toBe(99);
        });

        it('html should works', function () {
            var div = document.createElement('div');
            document.body.appendChild(div);

            dom.html(div, '<p>');

            expect(div.firstChild.nodeName.toLowerCase()).toBe('p');

            dom.html(div, '<p id="test"></p>');

            expect(div.firstChild.id).toBe('test');

            var table = dom.create('<table></table>');


            expect(function () {
                dom.html(table, '2');
            }).not.toThrowError();

            // load script

            dom.html(div, '<script>window.testNum=1</script>',true);
            expect(window.testNum).toBe(1);
        });

    });
});