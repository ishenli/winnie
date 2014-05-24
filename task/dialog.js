/**
 * @file validator
 * @author shenli （meshenli@gmail.com）
 */
module.exports = function (grunt) {


    return {
        dev: ['cptpl','less'],
        pub: ['requirejs:lib'],
        less: {
            files: {
                'src/widget/album/default.css': 'src/widget/album/default.less'
            }
        },
        ext: {
            'karma.<%=name%>': {
                options: {
                    files: [
                        {
                            pattern: '<%=dep%>/**/*.js',
                            included: false
                        },
                        {
                            pattern: '<%=src%>/**/*.js',
                            included: false
                        },
                        {
                            pattern: '<%=test%>/**/*.js',
                            included: false
                        },
                        {
                            pattern: '<%=testRoot%>/**Helper.js',
                            included: false
                        }
                    ]
                }
            },
            'requirejs.lib': {
                options: {
                    baseUrl: "<%=src%>/../",
                    name: "lib",
                    paths: {
                        underscore:'empty:'
                    },

                    // optimize: 'none',
                    findNestedDepandencies: true,
                    out: "asset/lib.js",
                    preserveLicenseComments: false
                }
            }
        },
        cptpl: {
            options: {
                // 任务特定的选项放在这里
                engine: 'etpl',
                context: '{AMD}'
            },
            files: {
                // 目标特定的文件列表放在这里
                'src/widget/dialog/': ['src/widget/dialog/template.tpl'],
                'src/widget/album/': ['src/widget/album/default-tpl.html']
            }

        },
        watch: {
//            files: ['<%=src%>/**'],
            files: ['src/widget/album/**.less'],
            tasks: ['<%=name%>']
        },

        clean: ['<%=asset%>'],

        copy: {
            files: [
                {
                    expand: true,
                    cwd: '<%=src%>',
                    src: ['**/*.js'],
                    dest: '<%=asset%>',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    cwd: '<%=src%>',
                    src: ['../lib.js'],
                    dest: '<%=asset%>',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    cwd: '<%=src%>',
                    src: ['../Widget.js'],
                    dest: '<%=asset%>',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    cwd: '<%=src%>',
                    src: ['../Control.js'],
                    dest: '<%=asset%>',
                    filter: 'isFile'
                }
            ]
        }
    };

};
