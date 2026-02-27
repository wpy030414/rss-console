import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.V_BASE_URL || '/'),
  routes: [],
})

export default router
