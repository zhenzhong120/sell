<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'logo-highlight':totalCount>0}">
              <i class="iconfont icon-gouwuche" :class="{'shopcart-highlight':totalCount>0}"></i>
            </div>
            <!-- v-show判断是否显示数量框 -->
            <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'price-highlight':totalCount>0}">￥{{totalPrice}}</div>
          <!-- 应用父组件传递过来的属性deliveryPrice，直接取它的属性值，即seller.deliveryPrice，属性名保持一致 -->
          <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
        </div>
        <!-- 阻止冒泡和默认事件，点击去结算，弹出窗口，点击确定，详情弹层会弹出，触发到了父元素content的点击事件toggleList -->
        <div class="content-right" @click.stop.prevent="pay">
          <!-- 通过计算属性，定义一个变量，绑定class属性为该变量，判断不同情况 -->
          <div class="pay" :class="payClass">{{payDesc}}</div>
        </div>
      </div>
      <!-- <div class="ball-container"> -->
      <!--在实现列表过渡时，如果需要过渡的元素是通过v-for渲染出来的，不能使用
      transition 包裹，需要使用 transition-group-->

      <!--若需要为 v-for 循环创建的元素设置动画，必须为每一个元素设置 :key 属性-->
      <!-- <transition-group mode="out-in" name="drop" appear> -->
      <!-- 此处遍历balls这个数组，实际上是有n个ball,列表形式，多个div元素外面不能用transition,用transition-group 
      使用transition-group，必须为每个具有动画形式的元素动态绑定key属性，如果不动态绑定，只是key="ball.num"会提示key值重复，更新出错-->
      <!-- <div calss="ball" v-for="ball in balls" v-show="ball.show" :key="ball.num">
          <div class="inner"></div>
        </div>
      </transition-group>
      </div>-->
      <div class="ball-container" v-for="ball in balls">
        <transition
          name="drop"
          @before-enter="handleBeforeEnter"
          @enter="handleEnter"
          @after-enter="handleAfterEnter"
        >
          <!-- inner-hook表示被js选中，没有真实的含义 -->
          <div class="ball" v-show="ball.show">
            <div class="inner inner-hook"></div>
          </div>
        </transition>
      </div>
      <transition name="fold" mode="out-in" appear>
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <!-- 需要实现滚动的区域，应用better-scroll组件，设置ref属性 -->
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="food in selectFoods">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price * food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <!-- 此处绑定@cart-add是为了让shopcart父组件监听子组件cartcontrol组件触发的cart-add事件，从而调用自己的drop方法，实现动画
   注意，goods为cartcontrol绑定了该事件，shopcart也要为子组件cartcontrol绑定该事件，否则无法监听它触发的cart-add事件，不能实现
                  后续接力实现的动画效果-->
                  <cartcontrol :food="food" @cart-add="cartAdd"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition mode="out-in" name="fade" appear>
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>
  </div>
</template>
<script>
import cartcontrol from "../cartcontrol/cartcontrol";
import BScroll from "better-scroll";

export default {
  props: {
    //购物车是选择商品的映射。goods组件下，维护选择了多少商品
    // vue的数据驱动：通过改变selectFoods中的数据，来改变dom视图
    // 接收父组件传递的selectFoods属性，返回一个数组
    selectFoods: {
      type: Array,
      // vue中type如果是Array或者Object,default是一个函数
      default() {
        return [];
      },
    },
    seller: {
      type: Object,
    },
    // 把父组件goods.vue传递过来的deliveryprices属性在prop数组中定义一下，属性名保持一致 ， 这样才能使用该数据

    deliveryPrice: {
      type: Number,
      // 没有传值时采取默认值0
      default: 0,
    },
    minPrice: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      // 使用balls存放5个小球，这些小球的默认状态都是不显示的
      balls: [
        {
          show: false,
        },
        {
          show: false,
        },
        {
          show: false,
        },
        {
          show: false,
        },
        {
          show: false,
        },
      ],
      // 用dropBalls来存放掉落的小球
      dropBalls: [],
      fold: true, //判断折叠状态，默认折叠状态
    };
  },
  computed: {
    totalPrice() {
      let total = 0;
      // 此处的foo指的是 this.selectFoods这个数组中的每一个元素，里面的元素是对象类型，即每一商品信息
      this.selectFoods.forEach((foo) => {
        total += foo.price * foo.count;
      });
      return total;
    },
    totalCount() {
      let count = 0;
      this.selectFoods.forEach((foo) => {
        count += foo.count;
      });
      return count;
    },
    payDesc() {
      //  js中用全等号===判断，不能用==判断，因为js中的==有一些表达式隐式转化，二者类型不一致的话，会做一些转化，容易出错

      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送`;
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice;
        return `还差￥${diff}元起送`;
      } else {
        return "去结算";
      }
    },
    payClass() {
      if (this.totalPrice < this.minPrice) {
        return "pay-not-enough";
      } else {
        return "pay-enough";
      }
    },
    listShow() {
      if (!this.totalCount) {
        this.fold = true; //没有商品时为折叠状态，点击无效
        return false;
      }
      let show = !this.fold; //设置开关，反折叠
      //  列表展示的时候才需要给better-scroll做初始化
      // 数据变了，dom的变化并没有立即生效，而better-scroll严重依赖于dom,
      //所以需要加this.$nextTick()函数 ，异步执行，dom更新后执行
      if (show) {
        this.$nextTick(() => {
          // 当list-content里面的内容发生变化时，不用每一次都new一个BScroll,
          //做判断，如果有this.scroll不用new，直接调用this.scroll的refresh接口,不用重新实例化，会重新计算内容和它的高度是否有差，决定是否滚动；
          //没有的话再new BScroll
          if (!this.scroll) {
            // 初始化better-scroll
            this.scroll = new BScroll(this.$refs.listContent, {
              click: true,
            });
          } else {
            this.scroll.refresh();
          }
        });
      }
      return show; //返回true或者false
    },
  },
  methods: {
    drop(el) {
      //  检测事件派发是否来自于better-scroll,如果不是，就直接return返回，因为浏览器的事件会执行两次点击事件
      if (!event._constructed) {
        return;
      }
    
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i];
        // 遍历小球，找出ball.show为false(隐藏)的，将其改为true(显示)，将cartControl传过来的对象挂载到ball的el属性上，将其放到下落小球的数组中
        if (!ball.show) {
          ball.show = true;
          ball.el = el;
          this.dropBalls.push(ball);
          return;
        }
      }
    },
    // 拿到所有show为true的小球，做动画，遍历
    handleBeforeEnter: function (el) {

      let count = this.balls.length;
      while (count--) {
        let ball = this.balls[count];
        if (ball.show) {
          // getBoundingClientRect()获取小球相对于视窗的位置，屏幕左上角坐标为0，0
          let rect = ball.el.getBoundingClientRect(); //通过cartcontrol组件的对象相对于窗口的位置，获取小球运动偏移的x值和y值
          let x = rect.left - 32; //正值---小球相对于窗口的left值 - 外层盒子.ball的left值32
          let y = -(window.innerHeight - rect.top - 22); //负值---窗口的高度 - cartcontrol点击按钮相对于窗口的top值 - .ball的bottom值

          el.style.display = ""; //手动将.ball的display值设置为空，让其实现，因为上面v-show会为false不显示
          el.style.webkitTransform = `translate3d(0,${y}px,0)`;
          el.style.transform = `translate3d(0,${y}px,0)`;

          let inner = el.getElementsByClassName("inner-hook")[0]; //内层小球
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
          inner.style.transform = `translate3d(${x}px,0,0)`;
        }
      }
    },
    // 小球动画完成，进入时,重置动画效果
    handleEnter: function (el, done) {
  
      /*eslint-disable no-unused-vars */ // 加此条设置，eslint不会报错
      // 主动触发浏览器重绘,必须设置此项，才能实现正确的小球飞入效果，重绘页面
      let rf = el.offsetHeight;
      this.$nextTick(() => {
        // 让动画效果异步执行,提高性能
        el.style.webkitTransform = "translate3d(0,0,0)"; // 设置小球掉落后最终的位置
        el.style.transform = "translate3d(0,0,0)";

        let inner = el.getElementsByClassName("inner-hook")[0]; //内层小球
        inner.style.webkitTransform = "translate3d(0,0,0)";
        inner.style.transform = "translate3d(0,0,0)";
        // js设置动画效果
        // el.style.transition = "all 1s linear";
        //  inner.style.transition = "all 1s linear";

        // css设置动画效果
        el.addEventListener("transitionend", done); // Vue为了知道过渡的完成，必须设置相应的事件监听器。它可以是transitionend或 animationend，否则动画效果不会触发
      });
    },

    //动画结束后重置小球的样式，将它的show设置为false,display设置none
    handleAfterEnter: function (el) {
    
      let ball = this.dropBalls.shift(); // 完成一次动画就删除一个dropBalls的小球(数组中第一个)
      if (ball) {
        ball.show = false;
        el.style.display = "none";
      }
    },
    toggleList() {
      if (!this.totalCount) {
        //如果没有购物车里没有任何商品，直接返回，不能打开
        return;
      }

      this.fold = !this.fold; //点击事件取反
    },
    cartAdd(el) {
      this.drop(el);
    },
    //清空按钮
    empty() {
      this.selectFoods.forEach((food) => {
        food.count = 0;
      });
    },
    hideList() {
      this.fold = true;
    },
    pay() {
      if (this.totalPrice < this.minPrice) {
        return;
      }
      window.alert(`支付${this.totalPrice}元`);
    },
  },
  components: {
    cartcontrol,
  },
};
</script>
<style lang="" scoped>
.shopcart {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  height: 48px;
  background: black;
}
/* 弹性盒子布局，右侧结算菜单固定，左侧自适应flex:1 */
.content {
  display: flex;
  background: #141d27;
  font-size: 0;
}
.ball-container .ball {
  position: fixed;
  left: 32px;
  bottom: 22px;
  z-index: 200;
  transition: all 0.8s cubic-bezier(0.95, 0.12, 1, 0.62);
}
.ball-container .ball .inner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgb(0, 160, 220);
  transition: all 0.8s linear;
}

.content .content-left {
  flex: 1;
}
.content .content-right {
  flex: 0 0 95px;
  width: 95px;
}
.content-left .logo-wrapper {
  display: inline-block;
  vertical-align: top;
  position: relative;
  /* （116-96)/2 */
  top: -10px;
  margin: 0 2px;
  padding: 6px;
  /* 88/2+12=56px || (116-(16-12))/2=56px */
  /* 移动端常用布局：转成怪异盒子模型（IE盒模型），盒子的宽度=content的width+padding+border值，不用再加padding的值 */
  width: 56px;
  height: 56px;
  box-sizing: border-box;

  /* 设置圆角技巧 -border-radius:50%;*/
  border-radius: 50%;
  /* 此处不设置背景颜色，会无法显示logo-wrapper */
  background: #141d27;
}
.content-left .logo-wrapper .logo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  /* 底部本身是黑色，再给它设置背景颜色时基于黑色做透明色，无法显示，可以直接测量颜色 */
  /* background:rgba(0,0,0,0.2); */
  background: #2b343c;
  text-align: center;
}
.content-left .logo-wrapper .logo-highlight {
  background: rgb(0, 160, 220);
}
.content-left .logo-wrapper .logo-highlight .shopcart-highlight {
  color: #fff;
}
.content-left .price {
  display: inline-block;
  vertical-align: top;
  /* 此处设置垂直居中用的line-height:24px;margin-top:12px;自动挤 */
  /* 也可以用height=line-height=48px;但是它右边的border的高度就会变为48px,不是24px */
  /* height:48px; */
  line-height: 24px;
  margin-top: 12px;
  /* 转成盒模型，加上padding值和border值之后不会影响宽度 */
  padding-right: 12px;
  box-sizing: border-box;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
}
.content-left .price-highlight {
  color: white;
}
.content-left .desc {
  display: inline-block;
  vertical-align: top;

  margin: 12px 0 0 12px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 10px;
}
.content-right .pay {
  height: 48px;
  line-height: 48px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  background: #2b333b;
}
.content-right .pay-not-enough {
  background: #2b333b;
}
.content-right .pay-enough {
  background: #00b43c;
  color: #fff;
}
.logo-wrapper .num {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 16px;
  line-height: 16px;

  text-align: center;
  border-radius: 16px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: rgb(240, 20, 20);
  /* 盒子阴影：阴影离开盒子的横向距离、阴影离开盒子的纵向距离、阴影的模糊半径、阴影的延伸半径、阴影的颜色、是否使用内阴影 */
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
}
.shopcart-list {
  position: absolute;
  left: 0;
  /* 此处不能设置top为0，详情弹出来后会隐藏，实际上是因为设置的top为0，它会显示购物车组件中，z-index为-1，看上去为隐藏 
  设置bottom:48px,让其在购物车组件上方展示*/
  bottom: 48px;
  z-index: -1;
  width: 100%;
}
/* 商品详情页弹出消失的移动动画设置位置 
给进场设置y为-100%，离场设置y为0，会发现进场时，详情页进场时会弹高自身一个100%的高度，然后降落
所以需要给进场设置y的方向为0，离场y的方向为100%（向下，为正值）不起作用 */
.fold-enter-active,
/* .fold-enter-to,.fold-leave, */
.fold-leave-active {
  transition: all 1s;
  transform: translate3d(0, 0, 0);
}
.fold-enter,
.fold-leave-to {
  transition: all 1s;
  transform: translate3d(0, 100%, 0);
}
.shopcart-list .list-header {
  height: 40px;
  line-height: 40px;
  padding: 0 18px;
  background: #f3f5f7;
  border-bottom: 1px solid rgba(7, 17, 27, 0.1);
}
.shopcart-list .list-header .title {
  float: left;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.shopcart-list .list-header .empty {
  float: right;
  font-size: 12px;
  color: rgb(0, 100, 220);
}
.shopcart-list .list-content {
  padding: 0 18px;
  max-height: 217px;
  overflow: hidden;
  background: #fff;
}
.shopcart-list .list-content .food {
  position: relative;
  padding: 12px 0;
  box-sizing: border-box;
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
}
.shopcart-list .list-content .food:after {
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
  .shopcart-list .list-content .food:after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .shopcart-list .list-content .food:after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.shopcart-list .list-content .food .name {
  line-height: 24px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.shopcart-list .list-content .food .price {
  position: absolute;
  right: 90px;
  bottom: 12px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 700;
  color: rgb(240, 20, 20);
}
.shopcart-list .list-content .food .cartcontrol-wrapper {
  position: absolute;
  right: 0;
  bottom: 8px;
}
.list-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(7, 17, 27, 0.7);
  z-index: 40;
  /* iphone手机设置模糊度 */
  backdrop-filter: blur(10px);
}

.fade-enter-to,
.fade-leave {
  transition: all 1s;
  opacity: 1;
}
.fade-enter,
.fade-leave-to {
  transition: all 1s;
  opacity: 0;
}
</style>