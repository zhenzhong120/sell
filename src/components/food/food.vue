<template>
  <transition mode="out-in" name="move" appear>
    <div v-show="showFlag" class="food" ref="foodContent">
      <div class="food-content">
        <div class="image-header">
          <img :src="food.image" />
          <div class="back" @click="hide">
            <i class="iconfont icon-fanhui"></i>
          </div>
        </div>
        <div class="content">
          <h1 class="title">{{food.name}}</h1>
          <div class="detail">
            <span class="sell-count">月售{{food.sellCount}}</span>
            <span class="rating">好评率{{food.rating}}%</span>
          </div>
          <!-- 可以抽出为组件 -->
          <div class="price">
            <span class="now">￥{{food.price}}</span>
            <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
          </div>
          <div class="cartcontrol-wrapper">
            <!-- 父组件绑定事件cart-add是为了监听子组件carcontrol触发的cart-add事件，调用foodFly方法 -->
            <cartcontrol :food="food" @cart-add="foodFly"></cartcontrol>
          </div>
          <transition mode="out-in" name="fade" appear>
            <!-- <div class="buy"  @click.stop="addFirst($event)"
            v-show="!food.count || food.count === 0" >加入购物车</div>-->
            <div class="buy" v-show="!food.count || food.count === 0">加入购物车</div>
          </transition>
        </div>
        <split v-show="food.info"></split>
        <div class="info" v-show="food.info">
          <h1 class="title">商品信息</h1>
          <p class="text">{{food.info}}</p>
        </div>
        <split></split>
        <div class="rating">
          <h1 class="title">商品评价</h1>
          <ratingSelect
            @type="changeType"
            @content="changeContent"
            :selectType="selectType"
            :onlyContent="onlyContent"
            :desc="desc"
            :ratings="food.ratings"
          ></ratingSelect>
          <div class="rating-wrapper">
            <ul v-show="food.ratings && food.ratings.length">
              <!-- v-show绑定函数的返回值，传递参数评价类型和内容，和点击事件做关联 -->
              <li
                v-show="needShow(rating.rateType,rating.text)"
                v-for="rating in food.ratings"
                class="rating-item"
              >
                <div class="user">
                  <span class="name">{{rating.username}}</span>
                  <img :src="rating.avatar" class="avatar" style="width:12px; height:12px" />
                </div>
                <!-- 将时间戳转化为时间字符串 -->
                <div class="time">{{rating.rateTime | formatDate}}</div>
                <p class="text">
                  <span
                    :class="{'iconfont icon-zan' : rating.rateType === 0,
                    'iconfont icon-cai' : rating.rateType === 1}"
                  ></span>
                  {{rating.text}}
                </p>
              </li>
            </ul>
            <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
const POSITIVE = 0; //积极评价
const NEGATIVE = 1; //消极评价
const ALL = 2; //所有评价
import BScroll from "better-scroll";
import cartcontrol from "../cartcontrol/cartcontrol";
import Vue from "vue";
import ratingSelect from "../ratingSelect/ratingSelect";
import split from "../split/split";
// 带{,}是export funciton(可引入多个函数，逗号分隔);不带{}是export default{}
import { formatDate } from "../../common/js/date";
export default {
  props: {
    // 该组件维护good中的foods里的每一个food
    food: {
      type: Object,
    },
  },
  data() {
    return {
      showFlag: false, //默认隐藏
      selectType: ALL,
      onlyContent: false,
      desc: {
        ALL: "全部",
        POSITIVE: "推荐",
        NEGATIVE: "吐槽",
      },
    };
  },
  // 父组件可以调用子组件的方法，但是子组件不可以调用父组件的方法
  // 组件方法命名规范：如果方法是可以被外部调用的采用show这种方法，如果该方法是组件私有的，前面加_
  methods: {
    show() {
      // 展示时初始化这个数据，因为这个组件会被多个商品使用，当传入不同的商品时，保持一个初始化的状态
      this.showFlag = true;
      this.selectType = ALL;
      this.onlyContent = false;
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.foodContent, {
            click: true,
          });
        } else {
          this.scroll.refresh();
        }
      });
    },
    hide() {
      this.showFlag = false;
    },

    changeType(number) {
      this.selectType = number ;//此处用逗号
        // 改变better-scroll回弹的问题
        //selectType改变的时候，dom并没有更新(created)，vue异步更新dom，会把dom放到更新队列里，
        //下一个生命周期dom/nextTick函数触发DOM才会更新（mounted），所以将refresh放在nextTick之后
        // 调用nextTick函数=》异步更新better-scroll
        this.$nextTick(() => {
          this.scroll.refresh();
        });
    },
    changeContent(content) {
      this.onlyContent = content;
        this.$nextTick(() => {
          this.scroll.refresh();
        });
    },

    //  @ratingtype-select="changeAll"
    // changeAll(type, data) {
    //   this[type] = data;
    // },
    foodFly(target) {
      // 点击加入购物车按钮，数量变为1，但是没有小球飞出
      //调用父组件goods的handlecartAdd方法，将加号点击的触发对象传递过去，实现小球动画
      this.$parent.handlecartAdd(target);
    },
    // 子组件的点击选择事件会同时触发父组件评价列表的展示隐藏
    needShow(type, text) {
      if (this.onlyContent && !text) {
        //选择只看有内容的评价并且此条评论没有文本，则不会被展示
        return false;
      }
      if (this.selectType === ALL) {
        //如果是所有的，直接展示
        return true;
      } else {
        return type === this.selectType; //当前评价的类型和选择的评价类型是否一致决定是否展示
      }
    },
    // addFirst(event) {
    //   if (!event._constructed) {
    //     return;
    //   }
    //   Vue.set(this.food, "count", 1);
    // },
  },
  filters: {
    //创建一个js模块，通用，提高复用率，传入时间戳参数，
    formatDate(time) {
      let date = new Date(time); //转化成date类型的一个对象
      //把date转化成需要的时间格式 年-月-日
      return formatDate(date, "yyyy-MM-dd bb:mm:ss");
    },
  },
  // watch: {
  //   type(type) {
  //     this.selectType = type;
  //   },
  //   content(onlycontent) {
  //     this.onlyContent = onlycontent;
  //   },
  // },
  components: {
    cartcontrol,
    split,
    ratingSelect,
  },
};
</script>
<style lang="">
.food {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 48px;
  /* 显示在底部购物车组件z-index:50 和购物车详情弹层 z-index:40 的下面 */
  z-index: 30;
  width: 100%;
  background: white;
  overflow: hidden;
}

.move-enter-active,
.move-leave-active {
  transition: all 0.8s linear;
  /* 进入时 从右向左移动 
  如果设置离开x方向为0，进入动画x方向为-100%，无法实现预期效果，
  从右向左滑动，然后图片再刷新一下*/
  transform: translate3d(0, 0, 0);
}
.move-enter,
.move-leave-to {
  /* 离开时，从左向右移动 */

  transition: all 0.4s linear;
  transform: translate3d(100%, 0, 0);
}
.food .food-content .image-header {
  position: relative;
  width: 100%;
  height: 0;
  /*图片加载是异步过程，如果不做限制让其加载宽度，不能写死高度，因为高度跟屏幕宽度一致，屏幕宽度未知，不设置的话，整个页面加载会有抖动的过程，刚开始图片
没加载出来是没有高度的，当加载出来时会突然撑开，抖动的过程=》
优化：先提前把图片的宽高设置好

此项padding-top/bottom:100%;设置的100%是相对的width:100%;保证padding-top/bottom与盒子宽度相等，看上去是一个宽高相等的容器 */
  padding-bottom: 100%;
}
.food .food-content .image-header img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.food .food-content .image-header .back {
  position: absolute;
  top: 10px;
  left: 0;
}
.food .food-content .content {
  position: relative;
  padding: 18px;
}
.food .food-content .content .title {
  line-height: 14px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(7, 17, 27);
}
.food .food-content .content .detail {
  margin-bottom: 18px;
  line-height: 10px;
  height: 10px;
  font-size: 0;
}
.food .food-content .content .detail .sell-count,
.food .food-content .content .detail .rating {
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.food .food-content .content .detail .sell-count {
  margin-right: 12px;
}
/* price组件 */
.price {
  font-weight: 700;
  line-height: 24px;
  margin-top: 4px;
}
.price .now {
  margin-right: 8px;
  font-size: 14px;
  color: rgb(240, 20, 20);
}
.price .old {
  text-decoration: line-through;
  font-size: 10px;
  color: rgb(147, 153, 159);
}

.food .food-content .cartcontrol-wrapper {
  position: absolute;
  right: 29px;
  bottom: 15px;
}
.food .food-content .buy {
  position: absolute;
  right: 18px;
  bottom: 19px;
  z-index: 10;
  height: 24px;
  line-height: 24px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 12px;
  font-size: 10px;
  background: rgb(0, 160, 220);
  color: white;
  pointer-events: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
  opacity: 1;
}
.fade-enter,
.fade-leave-to {
  transition: all 0.2s;
  opacity: 0;
}
.food .food-content .info {
  padding: 18px;
}
.food .food-content .info .title {
  line-height: 14px;
  margin-bottom: 6px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.food .food-content .info .text {
  line-height: 24px;
  padding: 0 8px;
  font-size: 12px;
  color: rgb(77, 85, 93);
}
.food .food-content .rating {
  padding-top: 18px;
}
.food .food-content .rating .title {
  line-height: 14px;
  margin-left: 18px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.food .food-content .rating .rating-wrapper {
  padding: 0 18px;
}
.food .food-content .rating .rating-wrapper .rating-item {
  position: relative;
  padding: 16px 0;
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
}

.food .food-content .rating .rating-wrapper .rating-item::after {
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
  .food .food-content .rating .rating-wrapper .rating-item::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .food .food-content .rating .rating-wrapper .rating-item::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.food .food-content .rating .rating-wrapper .rating-item .user {
  position: absolute;
  right: 0;
  top: 16px;
  line-height: 12px;
  font-size: 0;
}
.food .food-content .rating .rating-wrapper .rating-item .user .name {
  display: inline-block;
  margin-right: 6px;
  vertical-align: top;
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.food .food-content .rating .rating-wrapper .rating-item .user .avatar {
  border-radius: 50%;
}
.food .food-content .rating .rating-wrapper .rating-item .time {
  margin-bottom: 6px;

  line-height: 16px;
  font-size: 10px;

  color: rgb(147, 153, 159);
}
.food .food-content .rating .rating-wrapper .rating-item .text {
  line-height: 16px;
  font-size: 12px;
  color: rgb(7, 17, 27);
}
.food .food-content .rating .rating-wrapper .no-rating {
  padding: 16px 0;
  font-size: 12px;
  color: rgb(147, 153, 159);
}
</style>