// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'babel-polyfill' // es6 API

import Vue from 'vue'
import App from './App'
import router from './router'

import fastclick from 'fastclick'
import 'common/stylus/index.styl'

fastclick.attach(document.body) // 消除移动端300ms的点击延迟
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
  // template: '<App/>',
  // components: { App }
})
