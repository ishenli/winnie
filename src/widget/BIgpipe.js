/**
 * @file 类似bigpipe的前端加载方式
 * @author shenli （meshenli@gmail.com）
 */
define(function (require) {
    var $ = require('jquery');
    var lib = require('./lib');
    var Control = require('./Control');
    var template = require('common/js/template');

    var BigPipe = Control.extend({
        type: 'BigPipe',

        options: {},

        pagelets: [],

        pageletsMap:{},

        initialize: function (config) {
            // 因为类构建的时候只调用自己的initialize方法
            BigPipe.superClass.initialize.call(this, config);
        },

        /**
         * 在页面中调用该方法，传入BigPipe.asyncLoad({id: "second"});
         * @param {Object} pagelet
         * @param {String} pagelet.id 容器的id
         * @param {String} pagelet.url ajax地址
         * @param {String} pagelet.query 查询的参数
         * @param {Function} pagelet.callback 渲染之后的回调函数
         */
        asyncLoad: function (pagelet) {
            if (!pagelet instanceof Array) {
                pagelet = [pagelet];
            }

            var obj;

            for (var i = pagelet.length - 1; i > 0; i--) {
                obj = pagelet[i];
                if (!obj.id) {
                    throw new Error('the pagelet id is missing');
                }
                this.pagelets.push(pagelet);
            }

            this.process(pagelet);
        },
        renderPagelet: function (pagelet) {
            var id = pagelet.id;
            if (id in this.rendered) {
                return;
            }

            this.rendered[id] = true;

            if (pagelet.parentId) {
                this.renderPagelet(this.pagelets.pageletsMap[parentId]);
            }

            // 讲pagelet块插入到dom中
            var $pagelet = $(id);

            // 如果页面中没有pagelet块容器
            if (!$pagelet.length) {
                $pagelet = $('<div></div>');
                $pagelet.attr('id', id);
                $('body').append($pagelet);
            }

            template.load({
                containerId:id,
                templateId:pagelet.templateId,
                data:pagelet.data
            });


            if('function' === typeof pagelet.callback) {
                pagelet.callback.call($pagelet);
            }

            this.fire('pageletComplete');

        },
        /**
         * 渲染所有的pagelet
         */
        render: function (id,data) {
            var pagelets = this.pagelets;

            // 存储每个pagelet的数据
            pagelets[id].data = data;

            this.renderPagelet(pagelets[id]);

        },

        process: function (pagelets) {

            var self = this;
            $.each(pagelets, function (i, item) {
                $.getJSON(item.url, item.query)
                    .then(function (data) {
                        self.render(item.id, data);
                    });
            });
        }


    });

    return BigPipe;
});