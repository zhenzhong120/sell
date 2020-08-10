<template>
  <div class="seller" ref="SellerWrapper">
    <!-- better-scroll应用结构：外层是一个容器wrapper=》div.seller,它有一个固定的视口高度
    内层是一个div=》div.seller-wrapper,它是可以被内容自动撑高的，所以当内层容器的高度超过视口的高度时，是可以滚动的-->
    <div class="seller-wrapper">
      <div class="overview">
        <h1 class="title">{{seller.name}}</h1>
        <div class="desc">
          <star :size="36" :score="seller.score"></star>
          <span class="text">({{seller.ratingCount}})</span>
          <span class="text">月售{{seller.sellCount}}单</span>
        </div>
        <ul class="remark">
          <li class="block">
            <h2>起送价</h2>
            <div class="content">
              <span class="stress">{{seller.minPrice}}</span>元
            </div>
          </li>
          <li class="block">
            <h2>商家配送</h2>
            <div class="content">
              <span class="stress">{{seller.deliveryPrice}}</span>元
            </div>
          </li>
          <li class="block">
            <h2>平均配送时间</h2>
            <div class="content">
              <span class="stress">{{seller.deliveryTime}}</span>分钟
            </div>
          </li>
        </ul>
        <div class="favorite" @click="toggleFavorite($event)" ref="Favorite">
          <span class="iconfont icon-zan" :class="{'active' : favorite}"></span>
          <span class="text">{{favoriteText}}</span>
        </div>
      </div>
      <split></split>
      <div class="bulletin">
        <h1 class="title">公告与活动</h1>
        <div class="content-wrapper">
          <p class="content">{{seller.bulletin}}</p>
        </div>
        <ul v-if="seller.supports" class="supports">
          <li class="supports-item" v-for="(item,index) in seller.supports">
            <span class="icon" :class="classMap[seller.supports[index].type]"></span>
            <span class="text">{{seller.supports[index].description}}</span>
          </li>
        </ul>
      </div>
      <split></split>
      <div class="pics">
        <h1 class="title">商家实景</h1>
        <!-- 此处用pic-wrapper包装ul，是为了滚动的实现，给外层wrapper固定一个视口宽度，ul中的内容宽度超出它时，可以滚动，溢出部分隐藏 -->
        <div class="pic-wrapper" ref="PicWrapper">
          <ul class="pic-list" ref="PicList">
            <li class="pic-item" v-for="pic in seller.pics">
              <img :src="pic" style="width:120px;height:90px;" />
            </li>
          </ul>
        </div>
      </div>
      <split></split>
      <div class="info">
        <h1 class="title">商家信息</h1>
        <ul>
          <li class="info-item" v-for="info in seller.infos">{{info}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import star from "../star/star";
import split from "../split/split";
import BScroll from "better-scroll";
import { saveToLocal, loadFromLocal } from "../../common/js/store.js";
export default {
  props: {
    //接收router-view传递过来的seller
    seller: {
      type: Object,
    },
  },
  data() {
    return {
      favorite: (() => {
        //立即执行函数，传入id,变量favorite,及默认值false；
        //此处传入默认值会影响红心class和样式的初始设置，默认是false，但是样式是true的样式
        //不传入默认值，本身也是false的状态   
        return loadFromLocal(this.seller.id, "favorite");
      })(),
    };
  },
  computed: {
    favoriteText() {
      return this.favorite ? "已收藏" : "收藏";
    },
  },
  created() {
    this.classMap = ["decrease", "discount", "special", "invoice", "guarantee"];
    // this.id = getUrlKey("id");
    // localStorage.clear();
  },
  watch: {
    seller() {
      this._initScroll(); //页面刷新，请求后台数据seller
      this._initPics(); //需要在watch中监听才可以实现滚动，当请求后台，seller发生改变时初始化
    },
  },
  mounted() {
    // seller异步获取，初始化的时候内容区小于可视高度，seller是个空对象，
    //在watch中监听，当seller的内容发生变化（请求到）后，初始化better-scroll，抽象为方法
    this._initScroll();
    this._initPics(); //初始化，组件切换=》此处并不能准确的计算better-scroll的宽度，不能滚动，需要调用watch监听seller的改变
  },
  methods: {
    _initScroll() {
      this.$nextTick(() => {
        // 接收两个参数，一个dom对象，一个json对象
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.SellerWrapper, {
            click: true,
          });
        } else {
          this.scroll.refresh();
        }
      });
    },
    _initPics() {
      if (this.seller.pics) {
        let picWidth = 120;
        let Margin = 6;
        let Width = (picWidth + Margin) * this.seller.pics.length - Margin;
        //this.$refs驼峰访问，手动设置ul的宽度,需要添加px单位，否则只是一个数字，无法和外层wrapper的容器宽度进行比较
        this.$refs.PicList.style.width = Width + "px";
        this.$nextTick(() => {
          //if (!this.scroll) { //判断是否应用了scroll,应用了就不再初始化了
          this.scroll = new BScroll(this.$refs.PicWrapper, {
            scrollX: true,
            click: true, //滚动过程中会有点击收藏的事件
            eventPassthrough: "vertical", //外层区块竖向滚动
          });
          // } else {
          //   this.scroll.refresh();
          // }
        });
      }
    },
    toggleFavorite(event) {
      if (!event._constructed) {
        return;
      }
      this.favorite = !this.favorite;
      //将商家收藏情况存储到localStorage中
      saveToLocal(this.seller.id, "favorite", this.favorite);
      // this.$refs.Favorite.style.textAlign = "center";
    },
  },
  components: {
    star,
    split,
  },
};
</script>
<style lang="" scoped>
.seller {
  position: absolute;
  top: 174px;
  left: 0;
  bottom: 0;
  width: 100%;
  overflow: hidden;
}
.seller .seller-wrapper .overview {
  position: relative;
  padding: 18px;
}

.seller .seller-wrapper .overview .title {
  margin-bottom: 8px;
  line-height: 14px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .overview .desc {
  position: relative;
  padding-bottom: 18px;
  font-size: 0;
}
.seller .seller-wrapper .overview .desc::after {
  position: absolute;
  content: "";
  width: 100%;
  /* top:0; */
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  /* border-top: 1px solid rgba(7, 17, 27, 0.2); */
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .seller .seller-wrapper .overview .desc::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .seller .seller-wrapper .overview .desc::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.seller .seller-wrapper .overview .desc .star {
  display: inline-block;
  vertical-align: top;
  /* margin-right: 8px; */
  font-size: 0;
}
.seller .seller-wrapper .overview .desc .text {
  display: inline-block;
  vertical-align: top;
  margin-right: 12px;
  line-height: 18px;

  font-size: 10px;
  color: (77, 85, 93);
}

.seller .seller-wrapper .overview .remark {
  display: flex;
  padding-top: 18px;
}
.seller .seller-wrapper .overview .favorite {
  position: absolute;
  width: 50px; /*通过限定宽度让其居中，偏浮范围减小 （50-24）/2=13 ， 18-13=right值 */
  right: 11px;
  top: 18px;
  text-align: center;
}
.seller .seller-wrapper .overview .favorite span:first-of-type {
  display: block;
  line-height: 24px;
  margin-bottom: 4px;
  color: #d4d6d9;
  font-size: 20px;
}

.seller .seller-wrapper .overview .favorite .active {
  color: red !important;
}
.seller .seller-wrapper .overview .favorite .text {
  line-height: 10px;
  font-size: 10px;
  color: rgb(77, 85, 93);
}
.seller .seller-wrapper .overview .remark .block {
  flex: 1;
  text-align: center;
  border-right: 1px solid rgba(7, 17, 27, 0.1);
}
.seller .seller-wrapper .overview .remark .block:last-of-type {
  border-right: none;
}
.seller .seller-wrapper .overview .remark .block h2 {
  margin-bottom: 4px;
  line-height: 10px;
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.seller .seller-wrapper .overview .remark .block .content {
  line-height: 24px;
  font-size: 10px;
  font-weight: 700;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .overview .remark .block .content .stress {
  font-size: 24px;
}
.seller .seller-wrapper .bulletin {
  padding: 18px 18px 0 18px;
}
.seller .seller-wrapper .bulletin .title {
  margin-bottom: 8px;
  line-height: 14px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .bulletin .content-wrapper {
  position: relative;
  padding: 0 12px 16px 12px;
}
.seller .seller-wrapper .bulletin .content-wrapper::after {
  position: absolute;
  content: "";
  width: 100%;
  /* top:0; */
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  /* border-top: 1px solid rgba(7, 17, 27, 0.2); */
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .seller .seller-wrapper .bulletin .content-wrapper::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .seller .seller-wrapper .bulletin .content-wrapper::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.seller .seller-wrapper .bulletin .content-wrapper .content {
  line-height: 24px;
  font-size: 12px;
  color: rgb(240, 20, 20);
}
.supports-item .icon {
  display: inline-block;
  vertical-align: top;
  margin-right: 6px;
  width: 16px;
  height: 16px;

  background-repeat: no-repeat;
}

.supports-item .decrease {
  background: url(decrease_4@2x.png);
  background-size: 16px 16px;
}
.supports-item .discount {
  background: url(discount_4@2x.png);
  background-size: 16px 16px;
}
.supports-item .special {
  background: url(special_4@2x.png);
  background-size: 16px 16px;
}
.supports-item .invoice {
  background: url(invoice_4@2x.png);
  background-size: 16px 16px;
}
.supports-item .guarantee {
  background: url(guarantee_4@2x.png);
  background-size: 16px 16px;
}
.seller .seller-wrapper .supports .supports-item {
  position: relative;
  padding: 16px 12px;
  font-size: 0;
}
.seller .seller-wrapper .supports .supports-item::after {
  position: absolute;
  content: "";
  width: 100%;
  /* top:0; */
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  /* border-top: 1px solid rgba(7, 17, 27, 0.2); */
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}
.seller .seller-wrapper .supports .supports-item:last-of-type::after {
  border-top: none;
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .seller .seller-wrapper .supports .supports-item::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .seller .seller-wrapper .supports .supports-item::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}

.seller .seller-wrapper .supports .supports-item .text {
  line-height: 16px;
  font-size: 12px;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .pics {
  padding: 18px;
}
.seller .seller-wrapper .pics .title {
  margin-bottom: 12px;
  line-height: 14px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .pics .pic-wrapper {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
.seller .seller-wrapper .pics .pic-wrapper .pic-list {
  font-size: 0;
}
.seller .seller-wrapper .pics .pic-wrapper .pic-list .pic-item {
  display: inline-block;
  margin-right: 6px;
  width: 120px;
  height: 90px;
}
.seller .seller-wrapper .pics .pic-wrapper .pic-list .pic-item :last-of-type {
  margin-right: 0;
}
.seller .seller-wrapper .info {
  padding: 18px 18px 0 18px;
}
.seller .seller-wrapper .info .title {
  position: relative;
  padding-bottom: 12px; /*此处用padding不用margin是为了设置下边框*/
  line-height: 14px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.seller .seller-wrapper .info .title::after {
  position: absolute;
  content: "";
  width: 100%;
  /* top:0; */
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  /* border-top: 1px solid rgba(7, 17, 27, 0.2); */
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .seller .seller-wrapper .info .title::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .seller .seller-wrapper .info .title::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.seller .seller-wrapper .info .info-item {
  position: relative;
  padding: 16px 12px;
  line-height: 16px;
  color: rgb(7, 17, 27);
  font-size: 12px;
}

.seller .seller-wrapper .info .info-item::after {
  position: absolute;
  content: "";
  width: 100%;
  /* top:0; */
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  /* border-top: 1px solid rgba(7, 17, 27, 0.2); */
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .seller .seller-wrapper .info .info-item::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .seller .seller-wrapper .info .info-item::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.seller .seller-wrapper .info .info-item:last-of-type::after {
  border-top: none;
}
</style>
