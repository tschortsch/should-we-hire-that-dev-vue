import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Token from '@/components/Token'
import NotFoundComponent from '@/components/NotFoundComponent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/:username?',
      name: 'Main',
      component: Main,
      props: true
    },
    {
      path: '/token/:token',
      name: 'Token',
      component: Token,
      props: (route) => ({ token: route.params.token, state: route.query.state })
    },
    { path: '*', component: NotFoundComponent }
  ]
})
