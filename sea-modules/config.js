/**
 * User: shenli
 * Date: 13-8-23
 * Time: 下午2:20
 */
seajs.config({
    plugins: ['shim'],
    alias: {
        "$":{
            src: 'jquery/jquery/1.10.1/jquery.js',
            exports: 'jQuery'
        }
    }
});
