<script setup lang="ts">
import { useRSSSource } from '@/stores/rss-source'
import { computed } from 'vue'

const uuid = defineModel<string>()

const source = computed(() => useRSSSource().value.find((s) => '/' + s.uuid === uuid.value))
</script>

<template>
  <v-card
    v-if="source"
    v-for="o of source.dataCache"
    :key="o.title"
    class="mb-4 py-2"
    :class="o.read ? 'read' : ''"
  >
    <v-card-title>{{ o.title._text }}</v-card-title>

    <v-card-text class="desp-box" v-html="o.description._text"></v-card-text>

    <v-divider class="my-2"></v-divider>

    <div class="d-flex justify-space-between">
      <v-card-subtitle>
        {{ o.author._text }} | {{ new Date(o.pubDate._text).toLocaleDateString() }} 添加
      </v-card-subtitle>

      <v-btn
        class="mx-4"
        size="x-small"
        :color="o.read ? 'green' : 'red'"
        @click="o.read = !o.read"
        >{{ o.read ? '等待再阅' : '已阅' }}</v-btn
      >
    </div>
  </v-card>

  <v-empty-state v-else headline="空空如也" title="Nothing at all"></v-empty-state>
</template>

<style scoped>
.read {
  opacity: 0.6;
}

.desp-box {
  & * {
    max-width: 100%;
  }
}
</style>
