<template>
  <div id="app">
    <v-header :seller="seller"></v-header>
    <div class="tab border-1px">
      <div class="tab-item">
        <!-- 注意路径的写法：跳转路径直接写根路径；引入路径写相对路径 -->
        <!-- 默认显示商品页路由 -->
        <router-link to="/">商品</router-link>
        <!-- <a v-link="{path:'/goods'}">商品</a> -->
      </div>
      <div class="tab-item">
        <router-link to="/seller">商家</router-link>
      </div>
      <div class="tab-item">
        <router-link to="/ratings">评论</router-link>
        <!-- <a v-link="{path:'/seller'}">商家</a> -->
      </div>
    </div>
    <keep-alive>
    <!-- 此处需要将用ajax访问到的seller组件传递给各个路由组件，
    goods组件才能接收到seller,它才能继续将seller中的配送费等数据转给它的子组件shopcart.vue-->
    <router-view :seller="seller"></router-view>
    </keep-alive>
  </div>
</template>

<script>
// 不能用双引号，注意路径的写法，不加./报错
import header from "./components/header/header.vue";
import { getUrlKey } from "./common/js/url.js";

export default {
  // 定义为函数可以复用
  data() {
    return {
      seller: {
        id: (() => {
          let queryParam = getUrlKey("id");
          //  console.log(queryParam);
          return queryParam;
        })(),
      },
      id: "",
    };
  },
  components: {
    "v-header": header, // 不能用关键字header,会和h5标签重复
  },  
  created() {
    this.axios({
      method: "get",
      url: "http://localhost:3000/seller?id=" + this.seller.id,
    }).then((response) => {
      // this.seller = response.data;
      // ES6语法给对象赋值,上面那种方法seller.id输出为空，因为response.data中没有id
      this.seller = Object.assign({},this.seller,response.data);
      // console.log(this.seller.id);
    });
  },
};
</script>

<style lang="" scoped>
/* 设置scoped，必须同时设置lang属性 */
#app .tab {
  display: flex;
  width: 100%;
  height: 40px;
  line-height: 40px;
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
  position: relative;
  /* pc端的1px边框到了移动端会变得很宽，因为dpr的存在，会放大2/3倍 
   解决办法：设置
    */
  /* pc开发，手机预览方法：不能用localhost域名-指的是本机
   window系统 查看ip设置 ipconfig 
   Mark ifconfig*/
}
#app .tab:after {
  position: absolute;
  content: "";
  width: 100%;
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  border-top: 1px solid rgba(7, 17, 27, 0.1);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  border-1px::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  border-1px::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.tab-item {
  /* 4、css布局技巧：
  所有display布局或者positon这种影响布局的写在前面；
  宽高，会触发reflow重绘的，不可被继承的css属性写在后面
  最后设置字体，颜色，可以被继承的，重绘会重排的 */
  /* 1、等分技巧：flex:1，相当于justify-content:space-sround;子元素设置width=33%;
  2、移动端根据dpr设置尺寸，ui给的设计图尺寸/dpr(2/3)=布局尺寸；
  3、垂直居中 直接给父元素设置height=lineheight 相当于给子元素设置height=lineheight=父元素的height值 */
  flex: 1;
  text-align: center;
  height: 40px;
  line-height: 40px;
}
.tab-item > a {
  /* a标签转块，自动撑满所在区域，所在区域每一块都可以实现跳转 */
  display: block;
  font-size: 14px;
  color: rgb(77, 85, 93);
}
/* 默认显示的页面一直处于高亮状态，router-link-active类名都有 */
.tab-item > .router-link-exact-active {
  color: red;
}
/* .tab-item  .myactive{
  color:red;
}  */
</style>
