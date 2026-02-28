<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useRSSSources } from '@/stores/rss-source'

const router = useRouter()
const rssSources = useRSSSources()

if (rssSources.value.length > 0) {
  router.push('/' + rssSources.value[0]!.uuid)
}
</script>

<template>
  <v-empty-state headline="空空如也" title="Nothing at all" image="empty-state.png"></v-empty-state>
</template>

<style scoped></style>
