import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions.js'
import * as getters from './getters.js'
import state from './state.js'
import mutations from './mutations.js'
// vuex插件，当通过mutations修改state时，输出日志
import createLogger from 'vuex/dist/logger'

// 注册插件
Vue.use(Vuex)

// 当前环境为生产环境时，开启debug模式
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

