/**
 * @file htmlHelper
 * @author shenli
 */
define(function () {
    return {
        add: function (html){
            var div = document.createElement('div');
            div.innerHTML = html;

            document.body.appendChild(div);

            return div;
        },

        remove: function (el) {
            el.parentNode && el.parentNode.removeChild(el);
        }
    }

});
