// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueAnalytics from 'vue-analytics'
import VueVisible from 'vue-visible'

Vue.config.productionTip = false

// Enable analytics
Vue.use(VueAnalytics, {
  id: 'UA-91391176-1',
  router
})

// Enable visible directive
Vue.use(VueVisible)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
