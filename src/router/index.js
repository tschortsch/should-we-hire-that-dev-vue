import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Token from '@/components/Token'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/:username?',
      name: 'Main',
      component: Main
    },
    {
      path: '/token/:token',
      name: 'Token',
      component: Token
    }
  ]
})
