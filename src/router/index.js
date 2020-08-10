import Vue from 'vue'
import Router from 'vue-router'
import goods from '@/components/goods/goods'
import ratings from '@/components/ratings/ratings'
import seller from '@/components/seller/seller'
// import shopcart from '@/components/shopcart/shopcart'
Vue.use(Router)

export default new Router({
  // 注意单词写法的规范性，component不加s,加上对应的路由会报未定义的错误
  routes: [
    {
      // path 设置为 “/” ，默认显示该页面
      path: '/',
      name: 'goods',
      component: goods,
      // children: [
      //   {
      //     path: '/shopcart',
      //     name: 'shopcart',
      //     component: shopcart
      //   }
      // ]
    },
    {
      path: '/ratings',
      name: 'ratings',
      component: ratings
    },
    {
      path: '/seller',
      name: 'seller',
      component: seller
    },

  ],
  // router-link-active 将获取类名改为自定义类名
  linkActiveClass: 'myactive',
  // mode:"history" 
  // 去掉地址栏上的 # 号
})
