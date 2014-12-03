/**
 * @file style
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var Dom = require('lib/dom');
    var util = require('lib/util');
    var UA = require('lib/ua');

    describe('style',function () {
        it("css works", function () {
            var elem = Dom.create('<div id="test-div" ' +
            'style="padding-left: 2px; ' +
            'background: transparent; ' +
            '' +
            'float: left; ' +
            'border: 5px solid rgb(0,0,0);">x</div>');

            document.body.appendChild(elem);

            // getter
            expect(Dom.getStyle(elem, 'float')).toEqual('left');

            expect(Dom.getStyle(elem, 'position')).toEqual('static');

            expect(Dom.getStyle(elem, 'backgroundColor')).toBe('transparent');

            expect(util.indexOf(Dom.getStyle(elem, "backgroundPosition"), ['left 0% top 0%', '0% 0%']))
                .not.toBe(-1);

            expect(Dom.getStyle(elem, 'fontSize')).toBe('16px');

           expect(Dom.getStyle(elem, 'border-right-width')).toBe('5px');

            expect(Dom.getStyle(elem, 'paddingLeft')).toBe('2px');

            expect(Dom.getStyle(elem, 'padding-left')).toBe('2px');

            expect(Dom.getStyle(elem, 'padding-right')).toBe('0px');

            expect(Dom.getStyle(elem, 'opacity')).toBe('1');

            // 不加入 dom 节点，ie9,firefox 返回 auto by computedStyle
            // ie7,8 返回负数，offsetHeight 返回0
            //alert(elem.currentStyle.height);== auto
           //expect(parseInt(Dom.getStyle(elem, 'height'), 10) - 19).toBe.within(-2, 2);

            Dom.setStyle(elem, 'float', 'right');

            expect(Dom.getStyle(elem, 'float')).toBe('right');

            Dom.setStyle(elem, 'font-size', '100%');

            expect(Dom.getStyle(elem, 'font-size')).toBe('100%');

            Dom.setStyle(elem, 'opacity', '0.2');

            expect(parseFloat(Dom.getStyle(elem, 'opacity'), 10) - 0.2).toBeGreaterThan(-0.01);
            expect(parseFloat(Dom.getStyle(elem, 'opacity'), 10) - 0.2).toBeLessThan(0.01);

            Dom.setStyle(elem, 'border', '2px dashed red');

            expect(Dom.getStyle(elem, 'borderTopWidth')).toBe('2px');

            Dom.setStyle(elem, {
                marginLeft: '20px',
                opacity: '0.8',
                border: '2px solid #ccc'
            });
            expect(parseFloat(Dom.getStyle(elem, 'opacity')) - 0.8).toBeGreaterThan(-0.01);
            expect(parseFloat(Dom.getStyle(elem, 'opacity')) - 0.8).toBeLessThan(0.01);

            Dom.addStyleSheet(".shadow {" +
            "background-color: #fff;" +
            "-moz-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;" +
            "-webkit-box-shadow: rgba(0, 0, 0, 0.2) 2px 3px 3px;" +
            "filter: progid:DXImageTransform.Microsoft.Shadow(direction = 155, Color = #dadada, Strength = 3)," +
            " progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa, OffX = -2, OffY = -2);" +
            "}");

            var testFilter = Dom.create(' <div ' +
            'id="test-filter"' +
            ' class="shadow" ' +
            'style="height: 80px; ' +
            'width: 120px; ' +
            'border:1px solid #ccc;"></div>');
            document.body.appendChild(testFilter);
            // test filter  #issue5

            Dom.setStyle(testFilter, 'opacity', 0.5);
            if (UA.ie && UA.browser.version < 9) {
                // 不加入 dom 节点取不到 class 定义的样式
                expect(testFilter.currentStyle.filter).toBe("progid:DXImageTransform.Microsoft.Shadow(direction = 155," +
                " Color = #dadada, Strength = 3), progid:DXImageTransform.Microsoft.DropShadow(Color = #22aaaaaa," +
                " OffX = -2, OffY = -2), alpha(opacity=50)");
            }

            Dom.remove([elem, testFilter]);
        });
    });

});