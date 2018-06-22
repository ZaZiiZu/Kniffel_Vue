import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'
import Kniffel from './components/Kniffel.vue'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'kniffel',
    component: Kniffel
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
  ]
})
