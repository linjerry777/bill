import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AddBill from '../views/AddBill.vue'
import Statistics from '../views/Statistics.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/add',
    name: 'AddBill',
    component: AddBill
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 