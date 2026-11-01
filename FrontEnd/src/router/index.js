import { createRouter, createWebHistory } from 'vue-router'
import GroceryListView from '../views/GroceryListView.vue'

// Exported separately so the tests can create a router with the same routes
export const routes = [
  { path: '/', component: GroceryListView },
  { path: '/dev-log', component: () => import('../views/DevLogView.vue') },
  // Any unknown URL goes back to the list
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
