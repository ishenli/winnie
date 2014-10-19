define(['handlebars'], function(Handlebars) {

return Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"";
  if (stack1 = helpers.classPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.classPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n    <a href=\"javascript:;\" class=\"";
  if (stack1 = helpers.classPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.classPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-close j-dialog-close\">x</a>\n    <div class=\"";
  if (stack1 = helpers.classPrefix) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.classPrefix); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-content ui-album\">\n        <div class=\"handlers\">\n            <span class=\"prev handler\"><i class=\"iconfont\">&#xf016e;</i></span>\n            <span class=\"next handler\"><i class=\"iconfont\">&#x359e;</i></span>\n        </div>\n        <div class=\"j-album-content\" data-role=\"content\">\n\n        </div>\n    </div>\n</div>";
  return buffer;
  })

});