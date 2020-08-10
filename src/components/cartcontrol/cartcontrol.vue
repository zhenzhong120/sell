<template>
  <div class="cartcontrol">
    <transition mode="out-in" name="transform" appear>
 <!-- 应用接收的父组件传递的food属性 
 加减号按钮设置修饰符.stop，避免事件冒泡到父元素，从而使food的点击事件（弹出商品详情）和子元素的点击事件（+-）冲突，此处会同时触发--> 
      <div class="cart-decrease" v-show="food.count > 0" @click.stop.prevent="decreaseCart">
        <span class="iconfont icon-jian"></span>
      </div>
    </transition>
    <div class="cart-count" v-show="food.count > 0">{{food.count}}</div>
    <div class="cart-add" @click.stop.prevent="addCart($event)">
      <i class="iconfont icon-jia"></i>
    </div>
  </div>
</template>
<script>
// 调用Vue.set()接口
import Vue from "vue";
export default {
  // 接收父组件传递的food属性
  props: {
    food: {
      type: Object,
    },
  },
  created() {},
  methods: {
    // better-scroll派发的点击事件执行一次，移动端，但是原生DOM,浏览器派发的点击事件是两次
    //浏览器的事件对象是没有_constructed属性，当是浏览器触发的时候就return
    //而用better-scroll自定义的事件触发的时候有这个属性，为true
    //用这个属性，就是避免在浏览器点击的时候，触发两次点击的效果
    addCart(event) {
      // 检测事件派发是否来自于better-scroll
      if (!event._constructed) {
        return;
      }
      if (!this.food.count) {
// vue.js特性，当给观测对象添加一个它不存在的字段时， 直接这样赋值 this.food.count = 1;是不可以的；
 // 它的defineProperty检测不到属性的变化,所以当想要增或删属性的变化时，需要用Vue.set()这个接口，
 //通过Vue.set这个方法添加属性时，count的变化才能被观测到，这样最终能通知上面的dom发生变化
        Vue.set(this.food, "count", 1);
        // this.food.count = 1;
      } else {
        this.food.count ++;
    

      }
      // 获取小球的起始位置（left,top），首先需要拿到小球这个元素，点击它时派发事件，将小球的dom对象传出来
      // 派发事件，将dom对象作为事件参数传入-event.target，cartcontrol子组件触发父组件shopcart和goods的cart-add事件
      this.$emit('cart-add', event.target);
    
    },
    decreaseCart() {
      if (!event._constructed) {
        return;
      }
      if (this.food.count) {
        this.food.count--;

      }
      //   此处不用增加count为0的限定条件，因为上面已经限定当count>0时，才会显示该按钮
      
    },
  },
};
</script>
<style lang='css' scoped>
.cartcontrol {
  font-size: 0;
}
.cartcontrol .cart-decrease {
  display: inline-block;
  /* 移动端布局常用小技巧：设计图尺寸过小，但是需要增大用户的点击范围，设置padding值
  增加点击区域，同时不改变原样式 */
  padding: 6px;
}
.cartcontrol .cart-count {
  display: inline-block;
  vertical-align: top;
  width: 12px;
  padding-top: 6px;
  line-height: 24px;
  text-align: center;
  font-size: 10px;
  color: rgb(147, 153, 159);
}
.cartcontrol .cart-add {
  display: inline-block;

  padding: 6px;
}
.transform-enter-active,
.transform-leave-active {
  transition: all 0.4s Linear;
  opacity: 1;
  /* transform: translate3D(0, 0, 0) rotate(0deg); */
}
.transform-enter,
.transform-leave-to {
  transition: all 0.4s Linear;
  opacity: 0;
  transform: translate3d(24px, 0, 0) rotate(90deg);
}
</style>,