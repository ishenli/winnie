/**
 * @file validator
 * @author shenli （meshenli@gmail.com）
 */
module.exports = function (grunt) {


    return {
        dev: ['clean', 'copy'],
        pub: ['requirejs:lib'],

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

        watch: {
            files: ['<%=src%>/**'],
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
