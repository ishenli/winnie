/**
 * @file file
 * @author shenli （meshenli@gmail.com）
 */
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');
    Object.keys(pkg.devDependencies).forEach(
        function (name) {
            if (
                name.indexOf('grunt-') === 0
                    && name.indexOf('grunt-template') < 0
                ) {
                grunt.loadNpmTasks(name);
            }
        }
    );

    var configs = {
        pkg: pkg,
        meta: {
            src: 'src',
            dep: 'dep',
            asset: 'asset',
            test: 'test',
            tasks: 'task'
        },
        jshint: {
            options: grunt.file.readJSON('.jshintrc'),
            all: [
                '<%=meta.src%>/**/*.js',
                '<%=meta.src%>/*.js'
//                '<%=meta.test%>/**/*Spec.js'
            ]
        },

        csslint: {
            options: {
                csslintrc: '.csslintrc'
            }
        },

        lesslint: {
            all: ['<%=meta.src%>/**/*.less']
        },

        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            all: {
                options: {
                    // files: [
                    //     '<%=meta.src%>/**/*.js',
                    //     '<%=meta.test%>/**/*Spec.js',
                    //     '<%=meta.src%>/**/*.less'
                    // ]
                }
            }
        }

    };

    var TEST_FIXTURES = {
        pattern: '<%=meta.test%>/fixtures/*.html',
        included: false
    };
    var TEST_MAIN = '<%=meta.test%>/main.js';

    // 针对任务名，增加 :name
    var appendKey = function (list, name) {
        return list.map(function (item) {

            // 包含 $ 时替换为当前文件名
            if (~item.indexOf('$')) {
                item = item.replace(/\$/g, name);
            }

            // 如果已包含 :，不再附加当前文件名
            if (~item.indexOf(':')) {
                return item;
            }

            return item + ':' + name;
        });
    };

    // 针对配置键名，把 $ 替换为当前文件名
    var fixKey = function (key, name) {
        // 包含 $ 时替换为当前文件名
        if (~key.indexOf('$')) {
            key = key.replace(/\$/g, name);
        }

        return key;
    };

    var registTask = function (name, config) {
        if (config.dev instanceof Array) {
            grunt.registerTask(name, appendKey(config.dev, name));
            delete config.dev;
        }

        if (config.pub instanceof Array) {
            grunt.registerTask(name + '-pub', appendKey(config.pub, name));
            delete config.pub;
        }

        if (config.test instanceof Array) {
            grunt.registerTask(name + '-test', appendKey(config.test, name));
            delete config.test;
        }
    };

    // 为了在子 task 中可使用元数据模板
    grunt.initConfig(configs);

    // 增加全局测试
    registTask('all', { test: ['lesslint', 'jshint', 'karma'] });
    grunt.registerTask('test', ['all-test']);

    // 读取所有子 task 文件
    fs.readdirSync(configs.meta.tasks).forEach(
        function (file) {
            file = path.resolve(configs.meta.tasks, file);
            var ext = '.js';
            if (fs.statSync(file).isFile()
                && path.extname(file).toLowerCase() === ext
                ) {
                var name = path.basename(file, ext);
                var config = require(file)(grunt);
                var meta = configs.meta;
                var templateData = {
                    name: name,
                    srcRoot: meta.src,
                    dep: meta.dep,
                    src: path.join(meta.src, name),
                    assetRoot: meta.asset,
                    asset: path.join(meta.asset, name),
                    testRoot: meta.test,
                    test: path.join(meta.test, name)
                };

                config = JSON.parse(
                    grunt.template.process(
                        JSON.stringify(config),
                        {
                            data: templateData
                        }
                    )
                );

                grunt.config(
                    'karma.' + name,
                    {
                        options: {
                            files: [
                                {
                                    pattern: '<%=meta.dep%>/**/*.js',
                                    included: false
                                },
                                {
                                    pattern: templateData.src + '/**/*.js',
                                    included: false
                                },
                                {
                                    pattern: templateData.test + '/**/*Spec.js',
                                    included: false
                                },
                                templateData.src + '/**/*.less',
                                TEST_MAIN,
                                TEST_FIXTURES
                            ],
                            lessPreprocessor: {
                                options: {
                                    paths: [
                                        templateData.src + '/css',
                                        '<%=meta.dep%>'
                                    ]
                                }
                            }
                        }
                    }
                );

                grunt.config(
                    'jshint.' + name,
                    {
                        src: [templateData.src + '/**/*.js']
                    }
                );

                grunt.config(
                    'lesslint.' + name,
                    {
                        src: [templateData.src + '/**/*.less']
                    }
                );

                // 扩展的自定义配置，扁平化的方式
                // 如在 task/wangyou.js 中配置：
                // 'watch.$-hbs': {...}
                // 其中键名会替换成：
                // 'watch.wangyou-hbs'，等同于
                // watch: { wangyou-hbs: {...} }
                var extensions = config.ext;
                if (extensions) {

                    for (var key in extensions) {

                        // 自动增加 jquery 及测试入口
                        if (!key.indexOf('karma.')) {
                            var files = extensions[key].options.files;
//                            files.unshift('dep/jquery-mockjax/jquery.mockjax.js');
//                            files.unshift('dep/jasmine-jquery/lib/jasmine-jquery.js');
                            files.unshift('dep/underscore/underscore.js');
                            files.push(TEST_MAIN);
                            files.push(TEST_FIXTURES);
                        }
                        grunt.config(fixKey(key, name), extensions[key]);
                    }
                    delete config.ext;
                }

                // 扩展的自定义 tasks
                var tasks = config.tasks;
                if (tasks) {
                    for (var key in tasks) {
                        grunt.registerTask(
                            fixKey(key, name),
                            appendKey(tasks[key], name)
                        );
                    }
                    delete config.tasks;
                }

                config.test = config.test || ['lesslint', 'jshint', 'karma'];

                for (var key in config) {

                    registTask(name, config);
                    grunt.config(key + '.' + name, config[key]);

                }
            }
        }
    );
};
