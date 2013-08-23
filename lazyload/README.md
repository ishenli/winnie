# lazyload

---

实现图片的延迟加载，常用于页面含有大量的图片请求

---

## 使用说明
本模块现为CMD的模块形式，使用者可通过seajs在页面中进行模块加载。

实例代码
```js
<script>
     seajs.use(["../src/lazyload"],function(Lazyload) {
        var lazyload=new Lazyload({
            //something api
        });
        lazyload.setup();
     });
<\/script>
```
## API
###element
进行延迟加载的图片，支持jquery选择器

###event
触发图片加载的事件

###effect
图片显示时的效果，支持jquery的效果函数。

###container
进行图片加载的区域,默认为window,支持jquery选择器

###dataAttribute
用户存放原始图片的地址，默认src,对应html中data-src属性，如果设定其他值，可在html中修改成其他值
```html
<img src="loadding.jpg" data-src="img/example.jpg"/>
```
###load
图片加载完成后执行的函数

###threshod
默认是当图片出现在屏幕区域中进行加载。通过设定threshold的值可使图片提前进行加载，默认为0。
```js
var lazyload=new Lazyload({
    threshold:200
});
```
图片在距离屏幕200px的时候进行加载

###failureLimit
在滚动页面之后，Lazyload默认对未加载的图片进行循环操作，在循环中判定图片是否已见到。默认循环是在第一张屏幕下方的图片加载完成
之后停止。这是基于图片显示顺序和图片在HTML代码中的顺序一致，但是当页面中拥有多个layer的情况下，该假设有一定的错误。
通过设定failureLimit的值对未显示在屏幕中的图片进行加载。
```js
var lazyload=new Lazyload({
    failureLimit:10
});
```
设定failureLimit为10，Lazyload将会在下载屏幕下方10个图片之后才会停止搜索。

###skipInVisible:true,
###appear:null,

