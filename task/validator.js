/**
 * @file validator
 * @author shenli （meshenli@gmail.com）
 */
module.exports = function (grunt) {


    return {
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
            'requirejs.$-index': {
                options: {
                    baseUrl: "<%=src%>",
                    name: "common/index",
                    paths: {
                        common:'.',
                        moye: "../../dep/moye/src/ui",
                        site: "empty:",
                        handlebars:"empty:",
                        handlebarsAll:"empty:",
                        jquery: 'empty:',
                        iwan:"empty:",
                        jqueryCookie: '../../asset/dep/jquery-cookie/jquery.cookie.amd',
                        jqueryMd5: '../../asset/dep/jquery-md5/jquery.md5.amd'
                    },

                    // optimize: 'none',
                    findNestedDepandencies: true,
                    out: "<%=asset%>/index.js",
                    preserveLicenseComments: false
                }
            }
        },

        dev: ['clean', 'copy'],
        pub: ['requirejs:common-index'],

        watch: {
            files: ['<%=src%>/**'],
            tasks: ['<%=name%>']
        },

        clean: ['<%=asset%>'],

        copy: {
            files: [{
                expand: true,
                cwd: '<%=src%>',
                src: ['**/*.js','font/*'],
                dest: '<%=asset%>',
                filter: 'isFile'
            }]
        },

        concat: {
            src: [
                '<%=src%>/js/base.js',
                '<%=src%>/js/log.js'
            ],
            dest: '<%=asset%>/index.js'
        }
    };

};
