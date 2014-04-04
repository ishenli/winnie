(function() {

var tests = [];

window.__karma__.files[tests[0]] = +new Date();
for (var file in window.__karma__.files) {
    if (/Spec\.js$/.test(file)) {
        tests.push(file);
    }
}



requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {
        underscore: '../dep/underscore/underscore',
//        moye: '../dep/moye/src/ui',
        test: '../test'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
})();
