import Vue from 'vue'
import App from './App.vue'
import router from './router'
import JJCom from './service/components/index.js'
Vue.use(JJCom)
Vue.config.productionTip = false
Vue.prototype.$_c="https://github.com/sunny-world/jj-vue-echarts/tree/master/src/components"

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
