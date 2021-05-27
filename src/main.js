// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueAnalytics from 'vue-analytics'
import VueVisible from 'vue-visible'

// build custom FontAwesome library
import { library } from '@fortawesome/fontawesome-svg-core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faSignOutAlt, faCoffee, faCouch, faCode, faCodeBranch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { faClock, faCalendarAlt, faMoon, faSun, faStar, faHeart } from '@fortawesome/free-regular-svg-icons'

library.add(
  faGithub,
  faSignOutAlt,
  faClock,
  faCalendarAlt,
  faMoon,
  faSun,
  faCoffee,
  faCouch,
  faStar,
  faCode,
  faCodeBranch,
  faMapMarkerAlt,
  faHeart
)

Vue.config.productionTip = false

const gaTrackingId = process.env.GA_TRACKING_ID || 'UA-XXXXX-Y'
// Enable analytics
Vue.use(VueAnalytics, {
  id: gaTrackingId,
  router,
  debug: {
    // enable analytics only on production
    sendHitTask: process.env.NODE_ENV === 'production'
  }
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
