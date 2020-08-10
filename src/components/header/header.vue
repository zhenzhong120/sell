<template>
  <div class="header">
    <div class="content-wrapper">
      <div class="avatar">
        <img :src="seller.avatar" />
      </div>
      <div class="content">
        <div class="title">
          <span class="brand"></span>
          <span class="name">{{seller.name}}</span>
        </div>
        <div class="description">{{seller.description}}/{{seller.deliveryTime}}分钟送达</div>
        <!-- app.vue页面axios获取数据是一个异步的过程，一开始初始化上面data中seller是个空对象，所以会报错，undefined -->
        <!-- 所以加上v-if,当页面初始化是undefined的时候，就不会解析里面的dom结构，所以就不会报错undefined，当有了seller时，再解析dom -->
        <div v-if="seller.supports" class="support">
          <span class="icon" :class="classMap[seller.supports[0].type]"></span>
          <span class="text">{{seller.supports[0].description}}</span>
        </div>
      </div>
      <div v-if="seller.supports" class="support-count" @click="showDetail">
        <span class="count">{{seller.supports.length}}个</span>
        <span class="iconfont icon-jiantou"></span>
      </div>
    </div>
    <div class="bulletin-wrapper" @click="showDetail">
      <span class="bulletin-title"></span>
      <span class="bulletin-text">{{seller.bulletin}}</span>
      <span class="iconfont icon-jiantou"></span>
    </div>
    <div class="background">
      <img :src="seller.avatar" style="width:100%;height:100%" />
    </div>
    <!-- 详情弹层页动画效果，外面包裹transition标签，里面结构是div -->
    <transition mode="out-in" name="fade" appear>
      <div class="detail" v-show="detailShow">
        <div class="detail-wrapper clearfix">
          <div class="detail-main">
            <!-- 此处用h1更语义化一些 -->
            <h1 class="name">{{seller.name}}</h1>
            <!-- 引用子组件 -->
            <div class="star-wrapper">
              <star :size="48" :score="seller.score"></star>
            </div>
            <!-- 标题线居中模式 -->
            <div class="title">
              <div class="line"></div>
              <div class="text">优惠信息</div>
              <div class="line"></div>
            </div>
            <!-- 语义化标签,此处设置ul -->
            <ul v-if="seller.supports" class="supports">
              <li class="supports-item" v-for="(item,index) in seller.supports">
                <span class="icon" :class="classMap[seller.supports[index].type]"></span>
                <span class="text">{{seller.supports[index].description}}</span>
              </li>
            </ul>
            <div class="title">
              <div class="line"></div>
              <div class="text">商家公告</div>
              <div class="line"></div>
            </div>
            <div class="bulletin">
              <p class="content">{{seller.bulletin}}</p>
            </div>
          </div>
        </div>
        <div class="detail-close" @click="hideDetail">
          <span class="iconfont icon-guanbi"></span>
        </div>
      </div>
    </transition>
    <!-- 商家详情页弹性 布局结构固定 -->
  </div>
</template>
<script>
import star from "../star/star";
export default {
  // props:["seller"],
  props: {
    seller: Object,
  },
  data(){
    return {
      detailShow: false,
    }
  },
  methods: {
    showDetail() {
      this.detailShow = true;
    },
    hideDetail() {
      this.detailShow = false;
    },
  },
  created() {
    // 根据后台传过来的图片数据创建数组
    this.classMap = ["decrease", "discount", "special", "invoice", "guarantee"];
  },
  // header组件引入star.vue子组件之后，还要注册子组件
  components: {
    star,
  },
};
</script>
<style lang="" scoped>
body,
html {
  width: 100%;
  line-height: 1;
  font-weight: 200;
  /* font-family: 'Microsoft YaHei'; */
  /*微软雅黑*/
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  /*字体加上双引号或者单引号，当有多个字体的时候，中间逗号分开*/
}
img {
  width: 64px;
  height: 64px;
  border-radius: 2px;
}
.header {
  width: 100%;
  /* height:100%; */
  color: #fff;
  background: rgba(7, 17, 27, 0.5);
  position: relative;
}
/* font-size:0;去除子元素之间的默认间距 */
.header .content-wrapper {
  padding: 24px 12px 18px 16px;
  font-size: 0;
  position: relative;
}
/* 横着排列：转行内块 */
.avatar,
.content {
  display: inline-block;
  font-size: 14px;
  margin-left: 14px;
}
/* 设置图片和右边内容部分顶部对齐，上面已经转成行内块，可以应用该属性 */
.content-wrapper .avatar {
  vertical-align: top;
}
/* class类名路径的依赖性，避免和其它组件类名的重复性，样式布局混乱
id使用 */
.content-wrapper .content .title {
  margin: 2px 0 8px 0;
}
/* span定义宽高需要转块 ,设置brand图片和文字对齐：给图片添加vertical-align:top;属性*/
.content-wrapper .content .title .brand {
  width: 35px;
  height: 18px;
  display: inline-block;
  vertical-align: top;
  background: url(brand@2x.png);
  background-repeat: no-repeat;
  background-size: 30px 18px;
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .brand {
    background: url(brand@3x.png);
  }
}
.content-wrapper .content .title .name {
  font-size: 16px;
  margin-left: 6px;
  line-height: 18px;
  font-weight: 800;
}
.content-wrapper .content .description {
  font-size: 12px;
  margin-bottom: 10px;
  line-height: 12px;
}
/* 根据后端返回的不同数据，设置不同的图标=》
设置不同的class,绑定属性:class,遍历后台传过来的数据数组 */
.content-wrapper .content .support .icon {
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 4px;
  background-repeat: no-repeat;
  text-align: center;
  line-height: 12px;
  vertical-align: top;
}
.content-wrapper .content .support .decrease {
  background: url(decrease_1@2x.png);
  background-size: 12px 12px;
}
.content-wrapper .content .support .discount {
  background: url(discount_1@2x.png);
  background-size: 12px 12px;
}
.content-wrapper .content .support .special {
  background: url(special_1@2x.png);
  background-size: 12px 12px;
}
.content-wrapper .content .support .invoice {
  background: url(invoice_1@2x.png);
  background-size: 12px 12px;
}
.content-wrapper .content .support .guarantee {
  background: url(guarantee_1@2x.png);
  background-size: 12px 12px;
}
.content-wrapper .content .support .text {
  line-height: 12px;
  font-size: 10px;
}
.content-wrapper .support-count {
  position: absolute;
  right: 9px;
  bottom: 18px;
  padding: 0 8px;
  height: 24px;
  line-height: 24px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
  color: white;
}

.support-count span {
  display: inline-block;
  font-size: 10px;
}
.support-count .count {
  vertical-align: top;
}
.bulletin-wrapper {
  /* width: 100%; */
  height: 28px;
  line-height: 28px;
  position: relative;
  padding: 0 22px 0 12px;

  /* white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; */
  background: rgba(7, 17, 27, 0.2);
  /* 图片和文字之间默认有空白间隙，但是设置font-size为0之后，文字后面的省略号不见了，
所以取消设置font-size:0;改为将两个span写在同一行上，不换行就不会有留白了 */
  /* font-size:0; */
}
.bulletin-wrapper .bulletin-title {
  display: inline-block;
  width: 22px;
  height: 12px;
  background: url(bulletin@2x.png);
  background-size: 22px 12px;
  background-repeat: no-repeat;
  /* 设置垂直居中，vertical-align:text-top;然后设置margin-top=（28-12）/2 */
  vertical-align: top;

  margin-top: 8px;
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .bulletin-wrapper .bulletin-title {
    background: url(brand@3x.png);
  }
}
.bulletin-wrapper .bulletin-text {
  display: inline-block;
  width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  font-weight: 200;
  margin: 0 4px;
  height: 28px;
  line-height: 28px;
}
/* header背景图的设置，宽高为100%；在header下方显示，设置模糊状态 */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  filter: blur(10px);
}
/* 利用编译器sass创建公共模板引入 */
.clearfix {
  display: inline-block;
}
.clearfix:after {
  display: block;
  content: "";
  height: 0;
  line-height: 0;
  /* 清除浮动 */
  clear: both;
  /* 隐藏 */
  visibility: hidden;
}
.detail {
  /* 脱离文档流 */
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 文本溢出时出现滚动条 */
  overflow: auto;
  background: rgba(7, 17, 27, 0.7);
  
/* ios上实现背景模糊状态 iPhone */
  backdrop-filter:blur(10px);
}

.detail-wrapper {
  min-height: 100%;
  width: 100%;
}
.detail-wrapper .detail-main {
  margin-top: 64px;
  padding-bottom: 64px;
}
.detail-close {
  position: absolute;
  width: 32px;
  height: 32px;
  /* detail-close和detail-wrapper是平级关系，满屏100%的情况下不会显示，设置margin-top为负值 */
  margin: -64px 50% 0 50%;
  clear: both;
  font-size: 12px;
}
.detail-main .name {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
}
.star-wrapper {
  margin-top: 16px;
  padding: 2px 0;
  text-align: center;
}

/* 经典标题模式布局，flex布局，宽度自适应，中间文字设置留白，两侧填满剩余空间flex:1,
线的另外一种设置方法，空白标签，设置下边框border-bottom */
.detail .title {
  display: flex;
  width: 80%;
  margin: 28px auto 24px auto;
}
.detail .title .line {
  flex: 1;
  position: relative;
  top: -6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.detail .title .text {
  padding: 0 12px;
  font-size: 14px;
  font-weight: 800;
}
.supports {
  width: 80%;
  margin: 0 auto;
  /* height:16px; */
}
.supports .supports-item {
  padding: 0 12px;
  margin-bottom: 12px;
  font-size: 0;
}
.supports .supports-item:last-of-type {
  margin-bottom: 0;
}
.supports-item .icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  vertical-align: top;
  margin-right: 6px;
  background-repeat: no-repeat;
}

.supports-item .decrease {
  background: url(decrease_2@2x.png);
  background-size: 16px 16px;
}
.supports-item .discount {
  background: url(discount_2@2x.png);
  background-size: 16px 16px;
}
.supports-item .special {
  background: url(special_2@2x.png);
  background-size: 16px 16px;
}
.supports-item .invoice {
  background: url(invoice_2@2x.png);
  background-size: 16px 16px;
}
.supports-item .guarantee {
  background: url(guarantee_2@2x.png);
  background-size: 16px 16px;
}
.supports-item .text {
  font-size: 12px;
  line-height: 16px;
}
.bulletin {
  width: 80%;
  margin: 0 auto;
}
.bulletin .content {
  padding: 0 12px;
  line-height: 24px;
  font-size: 12px;
}
/* 添加详情弹层页过渡效果 */
/* 离开的第一帧和进入的最后一帧是能看到的，二者中间的状态也能看到 */
/* .fade-enter-to,
.fade-leave {
  transition: all 2s;
  opacity: 1;
  background: rgba(7, 17, 27, 0.8);
} */
.fade-enter-active,
.fade-leave-active {
  transition: all 2s;
  opacity: 1;
  background: rgba(7, 17, 27, 0.8);
}
/* 离开后的最后一帧和进入的第一帧是看不到的 */
.fade-enter,
.fade-leave-to {
  transition: all 2s;
  opacity: 0;
  background: rgba(7, 17, 27, 0);
}

</style>