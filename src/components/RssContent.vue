<script setup lang="ts">
import { useRSSSource } from '@/stores/rss-source'
import { useSetting } from '@/stores/setting'
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const uuid = defineModel<string>('uuid')
const keyword = defineModel<string>('keyword')

;(() => {
  DOMPurify.removeAllHooks()

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const tagName = node.tagName?.toLowerCase()
    if (!tagName) return

    if (['img', 'video', 'audio', 'iframe'].includes(tagName)) {
      node.setAttribute('referrerpolicy', 'no-referrer')
    }

    if (tagName === 'img') {
      const src = node.getAttribute('src') || ''
      const isStubborn = (import.meta.env.C_PROXY_REQUIRED_DOMAINS as string)
        .split(',')
        .some((d) => src.includes(d))

      if (isStubborn) {
        const primaryProxy = import.meta.env.C_IMAGE_PROXIES.split(',')[0]
        const fallbackProxy = import.meta.env.C_IMAGE_PROXIES.split(',')[1]

        node.setAttribute('src', `${primaryProxy}${encodeURIComponent(src)}`)

        const fallbackScript = `
          if (!this.dataset.retried) {
            this.dataset.retried = true
            this.src = '${fallbackProxy}' + encodeURIComponent('${src}')
          } else if (this.dataset.retried === 'true') {
            this.dataset.retried = 'final'
            this.src = '${src}'
          }
        `

        node.setAttribute('onerror', fallbackScript)
      }
    }
  })
})()

function sanitizeHtml(html?: string) {
  if (!html) {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'video', 'audio', 'source'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'controls',
      'autoplay',
      'muted',
      'poster',
      'referrerpolicy',
    ],
  })
}

const items = computed(() => {
  const s = useRSSSource().value.find((s) => '/' + s.uuid === uuid.value)
  if (!s) {
    return []
  }

  const d = s.dataCache.filter((e) => JSON.stringify(e).includes(keyword.value || ''))
  if (useSetting().pinUnread) {
    return d.toSorted((a, b) => Number(a.read) - Number(b.read))
  } else {
    return d
  }
})

function handleGo(url: string) {
  window.open(url, '_blank')
}
</script>

<template>
  <v-virtual-scroll v-if="items.length" :items="items" class="px-1 py-1" smooth-scroll>
    <template v-slot:default="{ item: o }">
      <transition tag="div" name="list">
        <v-card
          class="mb-4 pt-2 pb-3"
          :class="o.read ? 'read' : ''"
          :key="o.guid?._text || o.link?._text"
        >
          <v-card-title>{{ o.title?._text || '无标题' }}</v-card-title>

          <v-card-subtitle>
            {{ o.author?._text || '未知作者' }} |
            {{ o.pubDate?._text ? new Date(o.pubDate?._text).toLocaleString() : '未知时间' }}
            添加
          </v-card-subtitle>

          <v-card-text
            class="desp-box"
            :class="useSetting().onlyShowIframe ? 'only-show-iframe' : ''"
            v-html="sanitizeHtml(o.description?._text)"
          ></v-card-text>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex justify-space-between">
            <v-btn class="mx-4" size="x-small" @click="handleGo(o.link?._text)">查看原文</v-btn>

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
    image="/表情套组_虫动_很快就好！.png"
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
