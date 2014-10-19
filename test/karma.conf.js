// Test configuration for Karma 
// Generated on Tue Jan 07 2014 15:23:14 GMT+0800 (CST)

module.exports = function (config) {
    config.set({

        // base path, that will be used to resolve files and exclude
        basePath: '../',


        // frameworks to use
        frameworks: ['jasmine', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
//      'src/css/*.less',
            'dep/underscore/underscore.js',
            {pattern: 'src/**/*.js', included: false},
            {pattern: 'test/**/*Helper.js', included: false},
            {pattern: 'test/**/utilSpec.js', included: false},
//            {pattern: 'test/**/eventSpec.js', included: false},
//            {pattern: 'test/**/widgetSpec.js', included: false},
//      {pattern: 'test/**/stringSpec.js', included: false},
//      {pattern: 'test/**/dialogSpec.js', included: false},
//      {pattern: 'test/**/stringSpec.js', included: false},
//      {pattern: 'test/**/validatorSpec.js', included: false},
            'test/main.js'
        ],


        // list of files to exclude
        exclude: [
            '**/dep/**/test/**',
            '**/dep/**/tests/**',
            '**/dep/**/example/**',
            '**/dep/**/examples/**',
            '**/Gruntfile.js'
        ],


        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // doc not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/**/*.js': ['coverage']
//      'src/**/*.less': ['less']
        },

        // optionally, configure the reporter
        coverageReporter: {
            // text-summary | text | html | json | teamcity | cobertura | lcov
            // lcovonly | none | teamcity
            type: 'html',
            dir: 'test/coverage/'
        },

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['Chrome'],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: !true,

        plugins: [
            'karma-jasmine', 'karma-chrome-launcher', 'karma-firefox-launcher', /*'karma-safari-launcher', */'karma-phantomjs-launcher', 'karma-less-preprocessor', 'karma-requirejs', 'karma-coverage'
        ]
    });
};
