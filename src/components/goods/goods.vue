<template>
  <div>
    <div class="goods">
      <!-- ref命名：不能用menu-wrapper，使用大驼峰，和下面保持一致 -->
      <div class="menu-wrapper" ref="menuWrapper">
        <ul>
          <!-- 应用计算属性，当遍历的menu的index值等于currentIndex，为其绑定类名current -->
          <!--currentIndex()在computed里面定义，当计算出来的索引等于index的时候就显示高亮的样式.current-->
          <!--selectMenu(index,$event)实现点击左边的menu，右边滚动到相应的区间，index就是区间索引，$event属性表示原生DOM事件-->

          <li
            v-for="(item,index) in goods"
            calss="menu-item"
            @click="selectMenu(index,$event)"
            :class="{'current':currentIndex === index}"
          >
            <span id="text">
              <!-- v-show来确定是否显示图标，因为有的商品没有icon,通过v-show来做判断
              有的商品有，有的商品没有-->
              <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>
              {{item.name}}
            </span>
          </li>
        </ul>
      </div>
      <div class="foods-wrapper" ref="foodsWrapper">
        <ul>
          <!-- food-list-hook表明被js选中的样式，并无实际效果 -->
          <li class="food-list food-list-hook" v-for="item in goods">
            <h1 class="title">{{item.name}}</h1>
            <ul>
              <!-- 因为这块是foods-wrapper容器，所以点击时需要拿到$event这个对象 -->
              <li class="food-item" v-for="food in item.foods" @click="selectFood(food,$event)">
                <div class="icon1">
                  <img class="img" :src="food.icon" style="width:57px;height:57px" />
                </div>

                <div class="content1">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>

                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span>
                    <span>好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="now">￥{{food.price}}</span>
                    <!-- v-show来确定是否显示原价，因为的有商品没有原价 -->
                    <span v-show="food.oldPrice" class="old">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    <!-- 给子组件购物车加减按钮传递属性food,是goods里的每一个foods商品信息 -->
                    <!--父组件监听子组件触发的cart-add事件，进而调用子组件shopcart的drop方法，将点击对象传入-->
                    <cartcontrol :food="food" @cart-add="handlecartAdd"></cartcontrol>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <!--注意：绑定的方法或者属性名字不能带有连字符，可能是命令规范,否则语法会报错-->
      <!-- 引入购物车组件 父组件goods.vue给子组件shopcart.vue传递属性配送费和起送费-->
      <!-- 传递的是deliveryPrice这个自定义属性，子组件接收的也是这个自定义属性，可以直接应用该属性取值 -->
      <!-- goods组件通过ref访问子组件shopcart，ref可以访问到真实的dom结构 -->
      <shopcart
        ref="shopcart"
        :selectFoods="selectFoods"
        :deliveryPrice="seller.deliveryPrice"
        :minPrice="seller.minPrice"
      ></shopcart>
      <!-- <router-view></router-view> -->
      <!-- 给底部购物车组件绑定计算属性seleceFoods,传递返回的数组foods -->
    </div>
    <food :food="selectedFood" ref="food"></food>
  </div>
</template>
<script>
// 引入better-scroll,
import BScroll from "better-scroll";
//引入子组件
import shopcart from "../shopcart/shopcart";
import cartcontrol from "../cartcontrol/cartcontrol";
import food from "../food/food";

export default {
  props: {
    seller: {
      type: Object,
    },
  },
  data() {
    return {
      goods: [],
      ListHeight: [],
      scrollY: 0,
      // data中关联，开始时是空对象,data中定义的变量不要和methods的方法重名，因为会覆盖，vue都可以通过this.方式访问到
      selectedFood: {},
    };
  },
  computed: {
    currentIndex() {
      for (let i = 0; i < this.ListHeight.length; i++) {
        let height1 = this.ListHeight[i];
        let height2 = this.ListHeight[i + 1];
        //如果是最后一个或者落在当前索引区间
        // 如果滚动的高度scrollY大于ListHeight[i]的可视高度，小于ListHeight[i + 2]的可视高度，则左侧索引值定位i
        // 最后一个索引i=>height1,没有后面的i+1，即height2,undefined，即为假
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          return i;
        }
      }
      // 如果没有ListHeight,返回0
      return 0;
    },
    // 实现购物车按钮的加减和底部购物车联动的效果
    selectFoods() {
      let foods = [];
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food);
          }
        });
      });
      return foods;
    },
  },
  created() {
    this.classMap = ["decrease", "discount", "special", "invoice", "guarantee"];

    this.axios({ method: "get", url: "http://localhost:3000/goods" }).then(
      (response) => {
        this.goods = response.data;
        //  this.$nextTick()函数在,拿到数据，dom更新完成之后执行，即在menu和foods列表显示之后才会创建new BScroll()
        // 否则无法实现滚动
        this.$nextTick(() => {
          this._initScroll();
          this._calculateHeight();
        });
      }
    );
  },
  methods: {
    //点击左边的menu，跳到右边相应的li

    selectMenu(index, event) {
      // better-scroll派发的点击事件执行一次，移动端，但是原生DOM,浏览器派发的点击事件是两次
      //浏览器的事件对象是没有_constructed属性，当是浏览器触发的时候就return
      //而用better-scroll自定义的事件触发的时候有这个属性，为true
      //用这个属性，就是避免在浏览器点击的时候，触发两次点击的效果
      if (!event._constructed) {
        return;
      }

      //点击左侧的菜单项的时候，右边跳到相应的内容区域
      let foodList = this.$refs.foodsWrapper.getElementsByClassName(
        "food-list-hook"
      ); //获取到右边li对象

      let el = foodList[index]; //根据index，获取到右边具体滚动到的li

      this.foodsScroll.scrollToElement(el, 300); //要滑动到右边的对象，300完成动作的时间
    },
    _initScroll() {
      // 接收两个参数，一个dom对象，一个json对象
      this.menuScroll = new BScroll(this.$refs.menuWrapper, {
        //设置此项可以点击左侧menu按钮
        click: true,
      });
      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        // 检测实时滚动的位置
        probeType: 3,
        // 配置此项购物车的加号按钮的点击事件才能生效
        click: true,
      });
      //  foodsScroll监听滚动事件scroll
      this.foodsScroll.on("scroll", (pos) => {
        // Math.round 取整数 Math.abs取绝对值，保证是正数
        this.scrollY = Math.abs(Math.round(pos.y)); // 将scrollY和左侧索引做映射 =》computed计算属性
      });
    },
    _calculateHeight() {
      let foodList = this.$refs.foodsWrapper.getElementsByClassName(
        "food-list-hook"
      );

      let height = 0;
      this.ListHeight.push(height);
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i];
        height += item.clientHeight;
        this.ListHeight.push(height);
      }
    },
    // 由父组件goods.vue接收到了cartcontrol.vue传来的一个事件，当goods组件拿到这个事件之后，它需要调用子组件shopcart.vue的一个方法,将target传出，
    //  然后在shopcart组件里处理下落的函数/动作
    _drop(target) {
      //体验优化，异步执行下落动画
      // this.$nextTick(() => {
      // goods组件访问子组件shopcart，调用它的drop方法，把target传进去
      //使用$refs的前提是需要给相关的子组件设定ref属性，属性值和这里保持一致

      this.$refs.shopcart.drop(target);
      // });
    },
    handlecartAdd(target) {
      // 点击加号按钮触发事件
      this._drop(target); // 调用_drop方法
    },
    // 点击每一个food时，触发selectFood事件，将food赋给selectedFood，传递给子组件food.vue
    selectFood(food, event) {
      if (!event._constructed) {
        return;
      }

      this.selectedFood = food;
      this.$refs.food.show();
    },
  },
  // 定义子组件
  components: {
    shopcart,
    cartcontrol,
    food,
  },
};
</script>
<style lang="">
.goods {
  display: flex;
  /*设定absolute+top+bottom那么该元素就是一个固定高度的容器了*/
  position: absolute;
  top: 176px; /*这个是header+tab组件的高度*/
  bottom: 46px; /*这个是给底部的购物车留出来的高度*/
  width: 100%;
  overflow: hidden;
}
.goods .menu-wrapper {
  /* flex的三个属性：放大flex-grow，缩放flex-shrink，占据空间flex-basis */
  /*设置左边的元素的宽度为固定值*/
  flex: 0 0 80px;
  width: 80px;
  background: #f3f5f7;
  margin-bottom:5px;
}
.goods .foods-wrapper {
  flex: 1;
  margin-bottom:5px;

}
/* 大量复用代码抽象为组件 */
#text .icon {
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 2px;
  background-repeat: no-repeat;
  text-align: center;
  line-height: 12px;
  vertical-align: top;
}
#text .decrease {
  background: url(decrease_3@2x.png);
  background-size: 12px 12px;
}
#text .discount {
  background: url(discount_3@2x.png);
  background-size: 12px 12px;
}
#text .special {
  background: url(special_3@2x.png);
  background-size: 12px 12px;
}
#text .invoice {
  background: url(invoice_3@2x.png);
  background-size: 12px 12px;
}
#text .guarantee {
  background: url(guarantee_3@2x.png);
  background-size: 12px 12px;
}
/* 标签设置样式，如果多层标签级联，效率比较低，尽量用class设置样式 */

.menu-wrapper ul li {
  /* 垂直居中的小技巧，单行多行都可以实现 */
  display: table;
  height: 54px;
  width: 56px;
  line-height: 14px;

  /* 设置li水平居中的方法,设置ul的padding:0 12px也可以，但是无法实现.current的整个背景区域为白色的效果，只能是menu-item的范围*/
  padding: 0 12px;
}
/* .menu-wrapper ul { */
/* 宽度固定，无法实现居中的情况下，用（总宽度80-li的宽度56）/ 2= 12px; */
/* padding: 0 12px; */
/* } */

#text {
  display: table-cell;
  width: 56px;
  height: 54px;
  vertical-align: middle;
  font-size: 12px;
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
  position: relative;
}

#text:after {
  position: absolute;
  content: "";
  width: 56px;
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  border-top: 1px solid rgba(7, 17, 27, 0.2);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  #text::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  #text::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}

.menu-wrapper .current {
  position: relative;
  z-index: 10;
  /* 遮住上面的边框 */
  margin-top: -1px;
  background: #fff;
  font-weight: 700;
}
/* 去除利用伪元素设置的下边框 */
.menu-wrapper .current #text:after {
  border: none;
}
.foods-wrapper .food-list .title {
  padding-left: 14px;
  height: 26px;
  line-height: 26px;
  border-left: 2px solid #d9dde1;
  font-size: 12px;
  color: rgb(147, 153, 159);
  background: #f3f5f7;
}
.foods-wrapper .food-list .food-item {
  display: flex;
  margin: 10px;
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
  position: relative;
  padding-bottom: 18px;
}

.foods-wrapper .food-list .food-item:after {
  position: absolute;
  content: "";
  width: 100%;
  bottom: 0;
  left: 0;
  -webkit-transform: scaleY(0.5);
  transform: scaleY(0.5);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  border-top: 1px solid rgba(7, 17, 27, 0.3);
}

@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .foods-wrapper .food-list .food-item::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .foods-wrapper .food-list .food-item::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.foods-wrapper .food-list .food-item:last-of-type {
  border: none;
  margin-bottom: 0;
}
.img {
  flex: 0 0 57px;
  margin-right: 8px;
}
.content1 {
  flex: 1;
}
.content1 .name {
  margin: 2px 0 8px 0;
  height: 14px;
  line-height: 12px;
  font-size: 14px;
  color: rgb(7, 17, 27);
}
.content1 .desc {
  margin-bottom: 8px;
  line-height: 12px;
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.content1 .extra {
  line-height: 10px;
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.content1 .extra .count {
  margin-right: 8px;
}
.price {
  font-weight: 700;
  line-height: 24px;
  margin-top: 4px;
}
.cartcontrol-wrapper {
  position: absolute;
  right: 0;
  bottom: 12px;
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
</style>
