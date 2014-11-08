/**
 * @file Template
 * @author zhangkai （zhangking520@gmail.com）
 */
define(function (require) {
    var Template = require('component/template');
    var $ = require('jquery');

    describe('template', function () {
        var data = {
            list: [
                {name:' guokai', show: true},
                {name:' benben', show: false},
                {name:' dierbaby', show: true}
            ],
            blah: [
                {num: 1},
                {num: 2},
                {num: 3, inner:[
                    {'time': '15:00'},
                    {'time': '16:00'},
                    {'time': '17:00'},
                    {'time': '18:00'}
                ]},
                {num: 4}
            ]
        };

        $.ajax({
            url: './base/test/component/template.html',
            async: false,
            success: function (d) {
                var html = Template(d, data);
                $('body').append(html);
            }
        });
    });
});