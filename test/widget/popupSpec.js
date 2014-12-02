/**
 * @file Popup test
 * @author ishenli （meshenli@gmail.com）
 */
define(function (require) {

    var Popup = require('widget/Popup');
    var Position = require('widget/Position');
    var lib = require('lib');
    var $ = require('jquery');

    var tpl;
    $.ajax({
        url: './base/test/widget/popup/template.html',
        async: false,
        success: function (d) {
            tpl = d;
        }
    });
    describe('popup', function () {

        var globalVar = {};

        beforeEach(function () {
            document.body.appendChild(lib.create(tpl));
        });

        afterEach(function () {
            lib.remove(lib.get('#popup-test'));
            for (var v in globalVar) {
                globalVar[v].dispose();
            }
            globalVar = {}
        });

        it('instance', function () {
            var popup = globalVar.popup = new Popup({
                trigger:'#trigger1',
                element:'#popup1'
            });

            var trigger = popup.get('trigger');
            expect(trigger.id).toBe('trigger1');
            expect(popup.element.id).toBe('popup1');
            expect(popup.get('align').baseElement.id).toBe('trigger1');

        });

        it('click event', function () {
            var popup = globalVar.popup = new Popup({
                trigger:'#trigger1',
                element:'#popup1',
                triggerType:'click'
            });

            var trigger = popup.get('trigger');

            expect(lib.isShow(popup.element)).toBe(false);
            lib.fire(lib.get('#trigger1'), 'click');
            expect(lib.isShow(popup.element)).toBe(true);
            lib.fire(lib.get('#trigger1'), 'click');
            expect(lib.isShow(popup.element)).toBe(false);

        });

        it('change algin baseElement after show', function () {
            var popup = globalVar.popup = new Popup({
                trigger:'#trigger1',
                element:'#popup1',
                triggerType:'click',
                align:{
                    baseElement:'body'
                }
            });

            popup.show();
            var align = popup.get('align');

            expect(align.baseElement).toEqual('body');

        });

        it('disabled', function () {
            var popup = globalVar.popup = new Popup({
                trigger:'#trigger1',
                element:'#popup1',
                triggerType:'click',
                disabled:true
            });

            var trigger = popup.get('trigger');

            expect(lib.isShow(popup.element)).toBe(false);
            lib.fire(lib.get('#trigger1'), 'click');
            expect(lib.isShow(popup.element)).toBe(false);

            // 紧用一下disabled
            popup.set('disabled', false);

            lib.fire(lib.get('#trigger1'), 'click');

            expect(lib.isShow(popup.element)).toBe(true);

        });
    });
});
