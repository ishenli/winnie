/**
 * @file Waterfall
 * @author ishenli (meshenli@gmail.com)
 */
define(function (require) {

    var lib = require('winnie/lib');

    var Widget = require('./Widget');

    var Position = require('./Position');

    var u = require('underscore');

    var Waterfall = Widget.extend({
        type: 'Waterfall',
        options: {
            align: {
                // element 的定位点，默认为左上角
                selfXY: [0, 0],
                // 基准定位元素，默认为当前可视区域
                baseElement: Position.VIEWPORT,
                // 基准定位元素的定位点，默认为左上角
                baseXY: [0, 0]
            },
            parentNode: document.body

        }
    });
    return Waterfall;
});