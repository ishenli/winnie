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
        winnie:'.',
        underscore: '../dep/underscore/underscore',
        test: '../test',
        etpl:'../dep/etpl/src/main',
        async:'../dep/async/lib/async',
        jquery:'http://s1.bdstatic.com/r/www/cache/static/jquery/jquery-1.10.2.min_f2fb5194'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
})();
