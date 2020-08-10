// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import './common/font2/iconfont.css'

Vue.prototype.axios = axios;
Vue.config.productionTip = false

// 使用new一个对象，赋值给某一个变量，vue中不需要，所以配置这条规则，跳过校验
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
