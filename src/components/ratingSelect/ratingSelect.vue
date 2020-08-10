<template>
  <div>
    <div class="ratingselect">
      <div class="rating-type">
        <span
          @click="select(2,$event)"
          class="block ALL"
          :class="{'block-active-ALL' : selectType === 2}"
        >
          {{desc.ALL}}
          <span class="count">{{ratings.length}}</span>
        </span>
        <span
          @click="select(0,$event)"
          class="block POSITIVE"
          :class="{'block-active-POSITIVE' : selectType === 0}"
        >
          {{desc.POSITIVE}}
          <span class="count">{{positives.length}}</span>
        </span>
        <span
          @click="select(1,$event)"
          class="block NEGATIVE"
          :class="{'block-active-NEGATIVE' : selectType === 1}"
        >
          {{desc.NEGATIVE}}
          <span class="count">{{negatives.length}}</span>
        </span>
      </div>
      <div @click="toggleContent($event)" class="switch" :class="{'switch-on' : onlyContent }">
        <span class="iconfont icon-duigoutianchong-"></span>
        <span class="text">只看有内容的评价</span>
      </div>
    </div>
  </div>
</template>

<script>
// 声明常量，增强代码可读性，selectType一目了然
const POSITIVE = 0; //积极评价
const NEGATIVE = 1; //消极评价
const ALL = 2; //所有评价
export default {
  props: {
    ratings: {
      type: Array,
      //   数组和对象都要返回一个函数
      default() {
        return [];
      },
    },
    selectType: {
      //接收评价的类型：推荐吐槽全部
      type: Number,
      default: ALL,
    },
    onlyContent: {
      type: Boolean, //选择是否只看有内容评价
      default: false, //默认看到所有的评价
    },
    desc: {
      //是否定义评价的类型
      type: Object,
      default() {
        return {
          ALL: "全部",
          POSITIVE: "满意",
          NEGATIVE: "不满意",
        };
      },
    },
  },
  data() {
    return {
      typeSelect: this.selectType,
      contentOnly: this.onlyContent,
    };
  },
  methods: {
    // 这里传入event是因为外层有一个better-scroll，需要判断是否是better-scroll派发的点击事件
    select(type, event) {
      if (!event._constructed) {
        return;
      }
      // this.selectType = type;
      // this.$emit("type", this.selectType);

     this.typeSelect = type; //数据驱动视图的改变
      // 通知父组件改变 selectType的值
      // this.$emit("ratingtype-select", "selectType", this.typeSelect);
      // this.$parent.selectType = this.typeSelect;
      this.$emit("type", this.typeSelect);
    },
    toggleContent(event) {
      if (!event._constructed) {
        return;
      }
      //不在data中定义会报错
    //   this.onlyContent = !this.onlyContent;
    //  this.$emit("content", this.onlyContent);

      this.contentOnly = !this.contentOnly;
      // this.$emit("ratingtype-select", "onlyContent", this.contentOnly);
      // this.$parent.onlyContent = this.contentOnly;
      this.$emit("content", this.contentOnly);
    },
  },
  
  computed: {
    //使用过滤器筛选评价中的推荐和吐槽评价
    positives() {
      return this.ratings.filter((rating) => {
        return rating.rateType === POSITIVE;
      });
    },
    negatives() {
      return this.ratings.filter((rating) => {
        return rating.rateType === NEGATIVE;
      });
    },
  },
};
</script>
<style lang='css' scoped>
.ratingselect .rating-type {
  /* 伪元素解决1px边框问题，必须设置相对定位 */
  position: relative;
  padding: 18px 0; /* 优化代码思想，省去设置上面标题的下边距，直接看成评价类型的上边距 */
  margin: 0 18px;
  /*此处用margin，不用padding：
  是为了设置下边框,换成padding，整个外层盒子的宽度是100%,内部左右间距撑开；
  而设置margin，盒子的宽度视觉上是少左右两个margin值的，所以边框不会是满屏*/
  /* border-bottom: 1px solid rgba(7,17,27,0.1); */
  font-size: 0;
}

.ratingselect .rating-type::after {
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
  .ratingselect .rating-type::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .ratingselect .rating-type::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.ratingselect .rating-type .block {
  display: inline-block;
  padding: 8px 12px;
  margin-right: 8px;
  line-height: 16px;

  border-radius: 1px;
  color: rgb(77, 85, 93);
  font-size: 12px;
}
/* .ratingselect .rating-type .block-active {
  color: white !important;
} */
.ratingselect .rating-type .block .count {
  font-size: 8px;
  margin-left: 2px;
}

.ratingselect .rating-type .POSITIVE {
  background: rgba(0, 160, 220, 0.2);
}

.ratingselect .rating-type .block-active-POSITIVE,
.ratingselect .rating-type .block-active-ALL {
  background: rgb(0, 160, 220) !important;
  color: white !important;
}

.ratingselect .rating-type .ALL {
  background: rgba(0, 160, 220, 0.2);
}
.ratingselect .rating-type .NEGATIVE {
  background: rgba(77, 85, 93, 0.2);
}
.ratingselect .rating-type .block-active-NEGATIVE {
  background: rgb(77, 95, 83) !important;
  color: white !important;
}
.ratingselect .switch {
  padding: 12px 18px;
  line-height: 24px;
  /* 2px下边框，直接写1px，移动端会解析成2px */
  border-bottom: 1px solid rgba(7, 17, 27, 0.2);
  color: rgb(147, 153, 159);
  font-size: 0;
}
.ratingselect .switch .text {
  font-size: 12px;
}
.ratingselect .switch-on .icon-duigoutianchong- {
  color: #00c850;
}
/* 测试不同selectType值 */
</style>