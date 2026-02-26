<script setup lang="ts">
import { useRSSSource } from '@/stores/rss-source'
import { useSetting } from '@/stores/setting'
import { computed } from 'vue'
import DOMPurify from 'dompurify'

/**
 * @description 统一常量管理入口
 */
const RSS_CONFIG = {
  IMAGE_PROXIES: ['https://images.weserv.nl/?url=', 'https://i0.wp.com/', 'https://wsrv.nl/?url='],

  REFERRER_FREE_TAGS: new Set(['img', 'video', 'audio', 'iframe']),

  PROXY_REQUIRED_DOMAINS: ['hdslb.com', 'bilibili.com', 'zhimg.com', 'qpic.cn'],

  TRUSTED_IFRAME_DOMAINS: ['bilibili.com', 'b23.tv', 'youtube.com', 'music.163.com'],

  ALLOWED_EXTENSIONS: {
    TAGS: ['iframe', 'video', 'audio', 'source'],
    ATTRS: [
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
  },
} as const

const uuid = defineModel<string>('uuid')
const keyword = defineModel<string>('keyword')

/**
 * @description DOMPurify
 */
DOMPurify.removeAllHooks()

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const tagName = node.tagName?.toLowerCase()
  if (!tagName) return

  // 防盗链破解
  if (RSS_CONFIG.REFERRER_FREE_TAGS.has(tagName)) {
    node.setAttribute('referrerpolicy', 'no-referrer')
  }

  // 图片重定向
  if (tagName === 'img') {
    const src = node.getAttribute('src') || ''
    const isStubborn = RSS_CONFIG.PROXY_REQUIRED_DOMAINS.some((d) => src.includes(d))

    if (isStubborn) {
      const primaryProxy = RSS_CONFIG.IMAGE_PROXIES[0]
      const fallbackProxy = RSS_CONFIG.IMAGE_PROXIES[1]

      node.setAttribute('src', `${primaryProxy}${encodeURIComponent(src)}`)

      // 代理回退，最后直连
      const fallbackScript = `
          if(!this.dataset.retried){
            this.dataset.retried=true;
            this.src='${fallbackProxy}' + encodeURIComponent('${src}');
          } else if(this.dataset.retried === 'true'){
            this.dataset.retried='final';
            this.src='${src}';
          }
        `.replace(/\s+/g, ' ') // 压缩

      node.setAttribute('onerror', fallbackScript)
    }
  }

  // <iframe>白名单机制
  if (tagName === 'iframe') {
    const src = node.getAttribute('src') || ''
    const isTrusted = RSS_CONFIG.TRUSTED_IFRAME_DOMAINS.some((d) => src.includes(d))

    if (isTrusted) {
      // 播放器封面去重
      node.parentNode?.querySelectorAll('img').forEach((img) => img.remove())
    } else {
      node.remove()
    }
  }
})

// html清洗
const sanitizeHtml = (html?: string) => {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ADD_TAGS: RSS_CONFIG.ALLOWED_EXTENSIONS.TAGS,
    ADD_ATTR: RSS_CONFIG.ALLOWED_EXTENSIONS.ATTRS,
  })
}

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
        <v-card
          class="mb-4 py-2"
          :class="o.read ? 'read' : ''"
          :key="o.guid?._text || o.guid?._cdata || o.link?._text"
        >
          <v-card-title>{{ o.title?._text || o.title?._cdata || '无标题' }}</v-card-title>

          <v-card-text
            class="desp-box"
            :class="useSetting().hideImage ? 'hide-img' : ''"
            v-html="sanitizeHtml(o.description?._text || o.description?._cdata)"
          ></v-card-text>

          <v-divider class="my-2"></v-divider>

          <div class="d-flex justify-space-between">
            <v-card-subtitle>
              {{ o.author?._text || o.author?._cdata || '未知作者' }} |
              {{
                o.pubDate?._text || o.pubDate?._cdata
                  ? new Date(o.pubDate?._text || o.pubDate?._cdata).toLocaleString()
                  : '未知时间'
              }}
              添加
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
