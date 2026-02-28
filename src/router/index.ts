import { createRouter, createWebHashHistory } from 'vue-router'

import { useRSSSources } from '@/stores/rss-source'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.V_BASE_URL || '/'),
  routes: [
    {
      path: '/',
      component: () => import('@/views/EmptyView.vue'),
    },
    {
      path: '/:uuid',
      component: () => import('@/views/RssContentView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const rssSources = useRSSSources()

  let title = ''
  const uuid = to.params.uuid
  if (uuid) {
    const source = rssSources.value.find((e) => e.uuid === uuid)
    title += (source ? source.title : '未知源') + ' | '
  }
  title += 'RSS 控制台'

  document.title = title
})

export default router
