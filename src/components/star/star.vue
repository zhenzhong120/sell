<template>
  <!-- 组件资源就近维护
把用到的所有的星星图片用dom组合在一起，提升复用性
  提高灵活性，扩展性强-->
  <div class="star" :class="starType">
    
    <span v-for="itemClass in itemClasses" :class="itemClass" class="star-item"></span>
 
  </div>
</template>
<script>
// 编程常用技巧，定义常量引用，方便维护，代码量小
const LENGTH = 5;
const CLS_ON = "on";
const CLS_HALF = "half";
const CLS_OFF = "off";

// star组件有不同的大小，尺寸，后台接口传递星星的得分，尺寸，类型情况
export default {
  props: {
    size: {
      type: Number,
    },
    score: {
      type: Number,
    },
    // 根据传递过来的尺寸和分数，映射出来一种类型
  },
  computed: {
    starType() {
      return "star-" + this.size;
    },
    itemClasses() {
      let result = [];
      //   向下取整
      let score = Math.floor(this.score * 2) / 2;
      //   小数
      let hasDecimal = !(score % 1 == 0);
      //   全星的个数
      let integer = Math.floor(score);
      for (let i = 0; i < integer; i++) {
        result.push(CLS_ON);
      }
      if (hasDecimal) {
        result.push(CLS_HALF);
      }
    //   不足五颗星星时，用空白星星补齐
      while(result.length < LENGTH){
          result.push(CLS_OFF);
      }
      return result;
    },
  },
};
</script>
<style lang="" scoped>
.star {
  font-size: 0;
}
.star .star-item {
  display: inline-block;
  background-repeat: no-repeat;
}
.star .star-item :last-of-type{
  margin-right: 0;
}
.star-48 .star-item {
    
  width: 20px;
  height: 20px;
  margin-right: 22px;
  /* background-size: 20px 20px; */
}
/* 绑定属性itemClass，动态设置三种状态的星星的样式 on, off，half */
.star-48 .on {
  background: url(star48_on@2x.png);
    background-size: 20px 20px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-48 .on {
    background: url(star48_on@3x.png);
      background-size: 20px 20px;
  }
}
.star-48 .half {
  background: url(star48_half@2x.png);
    background-size: 20px 20px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-48 .half {
    background: url(star48_half@3x.png);
      background-size: 20px 20px;
  }
}
.star-48 .off {
  background: url(star48_off@2x.png);
    background-size: 20px 20px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-48 .off {
    background: url(star48_off@3x.png);
      background-size: 20px 20px;
  }
}
.star-36 .star-item {
  width: 15px;
  height: 15px;
  margin-right: 16px;

}
/* 绑定属性itemClass，动态设置三种状态的星星的样式 on, off，half */
.star-36 .on {
  background: url(star36_on@2x.png);
    background-size: 15px 15px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-36 .on {
    background: url(star36_on@3x.png);
      background-size: 15px 15px;
  }
}
.star-36 .half {
  background: url(star36_half@2x.png);
    background-size: 15px 15px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-36 .half {
    background: url(star36_half@3x.png);
      background-size: 15px 15px;
  }
}
.star-36 .off {
  background: url(star36_off@2x.png);
    background-size: 15px 15px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-36 .off {
    background: url(star36_off@3x.png);
      background-size: 15px 15px;
  }
}
.star-24 .star-item {
  width: 10px;
  height: 10px;
  margin-right: 3px;
  
}
/* 绑定属性itemClass，动态设置三种状态的星星的样式 on, off，half */
.star-24 .on {
  background: url(star24_on@2x.png);
  background-size: 10px 10px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-24 .on {
    background: url(star24_on@3x.png);
    background-size: 10px 10px;
  }
}
.star-24 .half {
  background: url(star24_half@2x.png);
  background-size: 10px 10px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-24.half {
    background: url(star24_half@3x.png);
    background-size: 10px 10px;
  }
}
.star-24 .off {
  background: url(star24_off@2x.png);
  background-size: 10px 10px;
}
@media (-webkit-min-device-pixel-radio: 3), (min-device-pixel-radio: 3) {
  .star-24 .off {
    background: url(star24_off@3x.png);
    background-size: 10px 10px;
  }
}
</style>