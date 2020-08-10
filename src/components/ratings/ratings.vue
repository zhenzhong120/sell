<template>
  <div class="ratings" ref="ratings">
    <div class="ratings-content">
      <div class="overview">
        <div class="overview-left">
          <h1 class="score">{{seller.score}}</h1>
          <div class="title">综合评分</div>
          <div class="rank">高于周边商家{{seller.rankRate}}%</div>
        </div>
        <div class="overview-right">
          <div class="score-wrapper">
            <span class="title">服务态度</span>
            <star :size="36" :score="seller.serviceScore"></star>
            <span class="score">{{seller.serviceScore}}</span>
          </div>
          <div class="score-wrapper">
            <span class="title">商品评分</span>
            <star :size="36" :score="seller.foodScore"></star>
            <span class="score">{{seller.foodScore}}</span>
          </div>
          <div class="delivery-wrapper">
            <span class="title">送达时间</span>
            <span class="delivery-time">{{seller.deliveryTime}}分钟</span>
          </div>
        </div>
      </div>
      <split></split>
      <ratingSelect
        @type="changeType"
        @content="changeContent"
        :selectType="selectType"
        :onlyContent="onlyContent"
        :desc="desc"
        :ratings="ratings"
      ></ratingSelect>
      <div class="rating-wrapper">
        <ul v-show="ratings && ratings.length">
          <li
            v-for="rating in ratings"
            class="rating-item"
            v-show="needShow(rating.rateType,rating.text)"
          >
            <div class="avatar">
              <img :src="rating.avatar" style="width:28px;height:28px;" />
            </div>
            <div class="content">
              <h1 class="name">{{rating.username}}</h1>
              <div class="star-wrapper">
                <star :size="24" :score="rating.score"></star>
                <span class="delivery" v-show="rating.deliveryTime">{{rating.deliveryTime}}分钟送达</span>
              </div>
              <p class="text">{{rating.text}}</p>
              <div class="recommend" v-show="rating.recommend && rating.recommend.length ">
                <span class="iconfont icon-zan"></span>
                <span v-for="item in rating.recommend" class="recommend-detail">{{item}}</span>
              </div>
              <div class="time">{{rating.rateTime | formatDate}}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
const POSITIVE = 0; //积极评价 ,定义常量，方便维护，易于理解
const NEGATIVE = 1; //消极评价
const ALL = 2; //所有评价

const ERR_OK = 200;
import star from "../star/star";
import split from "../split/split";
import ratingSelect from "../ratingSelect/ratingSelect";
import { formatDate } from "../../common/js/date.js";
import BScroll from "better-scroll";
export default {
  props: {
    //接收App.vue中传过来的seller
    seller: {
      type: Object,
    },
  },
  data() {
    return {
      ratings: [],
      selectType: NEGATIVE,
      onlyContent: false,
      desc: {
        ALL: "全部",
        POSITIVE: "推荐",
        NEGATIVE: "吐槽",
      },
    };
  },
  filters: {
    formatDate(time) {
      let date = new Date(time);
      return formatDate(date, "yyyy-MM-dd bb:mm:ss");
    },
  },
  components: {
    star,
    split,
    ratingSelect,
  },
  created() {
    this.axios({ method: "get", url: "http://localhost:3000/ratings" }).then(
      (response) => {
        if (response.status === ERR_OK) {
          this.ratings = response.data;
          // 拿到ratings数据之后初始化，注意在created中拿到数据之后dom并没有更新，不会实现滚动效果
          // 所以调用$nextTick函数，异步执行，在里面执行初始化，dom才会更新，
          this.$nextTick(() => {
            this.scroll = new BScroll(this.$refs.ratings, {
              click: true,
            });
            this.scroll.refresh();
          });
        }
      }
    );
  },
  methods: {
    //评价类型选项的关键一步：判断是否需要展示！！！！
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
    changeType(number) {
      this.selectType = number; //此处用逗号
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
  },
};
</script>
<style lang="" scoped>
.ratings {
  position: absolute;
  top: 174px;
  bottom: 0px;
  left: 0;
  width: 100%;
  overflow: hidden;


}
.ratings .ratings-content .overview {
  display: flex;
  padding: 18px 0;
}
.ratings .ratings-content .overview .overview-left {
  flex: 0 0 130px;
  padding: 6px 0; /*为了是overview-left的下边框向下撑高6px，撑大范围*/

  width: 130px;
  border-right: 1px solid rgba(7, 17, 27, 0.2);
  text-align: center; /*可以设置div,h1???*/
}

/* 设计方案针对的是iphone6，匹配iPhone5终端的样式 */
@media only screen and (max-width: 320px) {
  .ratings .ratings-content .overview .overview-left {
    flex: 0 0 25%;
    width: 25%;
  }

  .ratings .ratings-content .overview .overview-right {
    padding-left: 4px !important;
  }
}
.ratings .ratings-content .overview .overview-right {
  flex: 1;
  padding-left: 15px;
}
.ratings .ratings-content .overview .overview-left .score {
  line-height: 28px;
  margin-bottom: 6px;
  color: rgb(255, 153, 0);
  font-size: 24px;
}
.ratings .ratings-content .overview .overview-left .title {
  line-height: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: rgb(7, 17, 27);
}
.ratings .ratings-content .overview .overview-left .rank {
  line-height: 10px;
  color: rgb(147, 153, 159);
  font-size: 10px;
}
.ratings .ratings-content .overview .overview-right .score-wrapper {
  margin-bottom: 4px;
  font-size: 0;
}
.ratings .ratings-content .overview .overview-right .score-wrapper .title {
  display: inline-block;
  vertical-align: top;
  line-height: 18px;

  font-size: 12px;
  color: rgb(7, 17, 27);
}
.ratings .ratings-content .overview .overview-right .score-wrapper .star {
  display: inline-block;
  margin-left: 6px;
  vertical-align: top;
  line-height: 18px;
}
.ratings .ratings-content .overview .overview-right .score-wrapper .score {
  display: inline-block;
  vertical-align: top;
  line-height: 18px;

  font-size: 12px;
  color: rgb(255, 153, 0);
}
.ratings .ratings-content .overview .overview-right .delivery-wrapper {
  font-size: 0;
}
.ratings .ratings-content .overview .overview-right .delivery-wrapper .title {
  line-height: 18px;

  font-size: 12px;
  color: rgb(7, 17, 27);
}
.ratings
  .ratings-content
  .overview
  .overview-right
  .delivery-wrapper
  .delivery-time {
  margin-left: 12px;
  font-size: 12px;
  color: rgb(147, 153, 159);
}
.ratings .ratings-content .rating-wrapper {
  padding: 0 18px;
}
.ratings .ratings-content .rating-wrapper .rating-item {
  position: relative;
  display: flex;
  padding: 18px 0;
}
.ratings .ratings-content .rating-wrapper .rating-item::after {
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
  .ratings .ratings-content .rating-wrapper .rating-item::after {
    -webkit-transform: scaleY(0.33333333);
    transform: scaleY(0.33333333);
  }
}

@media (-webkit-min-device-pixel-radio: 2), (min-device-pixel-radio: 2) {
  .ratings .ratings-content .rating-wrapper .rating-item::after {
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
  }
}
.ratings .ratings-content .rating-wrapper .rating-item .avatar {
  flex: 0 0 28px;
  margin-right: 12px;
}
.ratings .ratings-content .rating-wrapper .rating-item .avatar img {
  border-radius: 50%;
}
.ratings .ratings-content .rating-wrapper .rating-item .content {
  position: relative;
  flex: 1;
}
.ratings .ratings-content .rating-wrapper .rating-item .content .name {
  margin-bottom: 4px;
  line-height: 12px;
  font-size: 10px;
  color: rgb(7, 17, 27);
}
.ratings .ratings-content .rating-wrapper .rating-item .content .star-wrapper {
  margin-bottom: 6px;
  font-size: 0;
}
.ratings
  .ratings-content
  .rating-wrapper
  .rating-item
  .content
  .star-wrapper
  .star {
  display: inline-block;
  margin-right: 6px;
  vertical-align: top;
}
.ratings
  .ratings-content
  .rating-wrapper
  .rating-item
  .content
  .star-wrapper
  .delivery {
  display: inline-block;
  vertical-align: top;
  font-size: 10px;
  color: rgb(7, 17, 27);
}
.ratings .ratings-content .rating-wrapper .rating-item .text {
  line-height: 18px;
  color: rgb(7, 17, 27);
  font-size: 12px;
  margin-bottom: 8px;
}
.ratings .ratings-content .rating-wrapper .rating-item .recommend {
  line-height: 16px;
  font-size: 0;
}
.ratings .ratings-content .rating-wrapper .rating-item .recommend span {
  display: inline-block;
  margin: 0 8px 4px 0;
  font-size: 9px;
}
.ratings
  .ratings-content
  .rating-wrapper
  .rating-item
  .recommend
  .recommend-detail {
  padding: 0 6px;
  border: 1px solid rgba(7, 17, 27, 0.2);
  border-radius: 4px;
  color: rgb(147, 153, 159);
  background: white;
}
.ratings .ratings-content .rating-wrapper .rating-item .time {
  position: absolute;
  top: 0;
  right: 4px;

  line-height: 12px;
  color: rgb(147, 153, 159);
  font-size: 10px;
}
</style>