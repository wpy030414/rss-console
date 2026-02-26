<script setup lang="ts">
import { useRSSSource } from '@/stores/rss-source'
import { useSetting } from '@/stores/setting'
import { computed } from 'vue'

const uuid = defineModel<string>('uuid')
const keyword = defineModel<string>('keyword')

const items = computed(() => {
  const s = useRSSSource().value.find((s) => '/' + s.uuid === uuid.value)
  if (!s) {
    return []
  }

  const d = s.dataCache.filter((e) => JSON.stringify(e).includes(keyword.value || ''))
  if (useSetting().showUnreadOnly) {
    return d.toSorted((a, b) => Number(a.read) - Number(b.read))
  } else {
    return d
  }
})
</script>

<template>
  <v-virtual-scroll v-if="items.length" :items="items" class="px-1 py-1" smooth-scroll>
    <template v-slot:default="{ item: o }">
      <transition tag="div" name="list">
        <v-card class="mb-4 py-2" :class="o.read ? 'read' : ''" :key="o.guid._text">
          <v-card-title>{{ o.title._text }}</v-card-title>

          <v-card-text
            class="desp-box"
            :class="useSetting().hideImage ? 'hide-img' : ''"
            v-html="o.description._text"
          ></v-card-text>

          <v-divider class="my-2"></v-divider>

          <div class="d-flex justify-space-between">
            <v-card-subtitle>
              {{ o.author._text }} | {{ new Date(o.pubDate._text).toLocaleString() }} 添加
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
      </transition>
    </template>
  </v-virtual-scroll>

  <v-empty-state
    v-else
    headline="空空如也"
    title="Nothing at all"
    image="https://media.prts.wiki/4/4b/%E8%A1%A8%E6%83%85%E5%A5%97%E7%BB%84_%E8%99%AB%E5%8A%A8_%E5%BE%88%E5%BF%AB%E5%B0%B1%E5%A5%BD%EF%BC%81.png"
  ></v-empty-state>
</template>

<style scoped>
.read {
  opacity: 0.6;

  & .desp-box {
    padding: 0;
    max-height: 0px;
    opacity: 0;
  }
}

.desp-box {
  overflow-y: auto;
  max-height: 75vh;
  opacity: 1;
  transition: all 0.5s;

  & * {
    max-width: 100%;
  }
}

.list-enter-active,
.list-leave-active {
  max-height: 100vh;
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateX(60px);
}
</style>
