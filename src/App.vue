<script setup lang="ts">
import {
  mdiBellRing,
  mdiDelete,
  mdiImage,
  mdiImageRemove,
  mdiMenu,
  mdiMessage,
  mdiMessageBadge,
  mdiPlus,
  mdiSync,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js'

import { ref, watch } from 'vue'

import { useRoute, useRouter } from 'vue-router'

import { useCat } from './stores/cat'
import { useMessages } from './stores/message'
import { useRSSSources } from './stores/rss-source'
import { useSetting } from './stores/setting'

const router = useRouter()
const route = useRoute()
const cat = useCat()
const messages = useMessages()
const rssSources = useRSSSources()
const setting = useSetting()

rssSources.update()

const showDrawer = ref(false)

const keyword = ref('')

watch(
  keyword,
  (n) => {
    cat.feed(keyword)

    router.push({
      query: {
        ...route.query,
        keyword: n || undefined,
      },
    })
  },
  { immediate: true },
)

async function handleRefresh() {
  await rssSources.update()
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  messages.push('已刷新')
}

function handleAddSource() {
  const addr = prompt('请输入 RSS 源地址')
  if (addr) {
    rssSources.add(addr)
    messages.push('已添加')
  }
}

function handleRemoveSource() {
  const uuid = route.params.uuid
  const source = rssSources.value.find((s) => s.uuid === uuid)
  if (!source) {
    messages.push('当前 RSS 源不存在')
    return
  }

  if (confirm('真的要移除当前 RSS 源吗？')) {
    rssSources.value = rssSources.value.filter((s) => s.uuid !== uuid)
    messages.push('已移除')
  }
}

function handleSubscribe() {
  messages.push('还没有做好这个功能......')
}

const author = import.meta.env.APP_AUTHOR
const version = import.meta.env.APP_VERSION
</script>

<template>
  <v-theme-provider :theme="setting.dark ? 'dark' : 'light'">
    <v-responsive>
      <v-app>
        <v-app-bar>
          <template v-slot:prepend>
            <v-btn :icon="mdiMenu" @click="showDrawer = !showDrawer"></v-btn>
          </template>

          <v-text-field
            v-model="keyword"
            label="搜索关键字"
            variant="solo-inverted"
            density="compact"
            hide-details
          ></v-text-field>

          <template v-slot:append>
            <v-btn :icon="mdiSync" @click="handleRefresh"></v-btn>
          </template>
        </v-app-bar>

        <v-navigation-drawer v-model="showDrawer" class="drawer">
          <template v-slot:prepend>
            <div class="py-4 text-center">
              <v-btn
                :icon="setting.dark ? mdiWeatherNight : mdiWhiteBalanceSunny"
                size="small"
                class="mr-6"
                @click="setting.toggleDark"
              ></v-btn>

              <v-btn
                :icon="setting.onlyShowIframe ? mdiImageRemove : mdiImage"
                size="small"
                class="mr-6"
                @click="setting.toggleHideImage"
              ></v-btn>

              <v-btn
                :icon="setting.pinUnread ? mdiMessageBadge : mdiMessage"
                size="small"
                @click="setting.toggleShowUnreadOnly"
              ></v-btn>
            </div>
          </template>

          <v-divider></v-divider>

          <v-list>
            <v-list-item
              v-if="rssSources.value.length"
              v-for="s in rssSources.value"
              :active="s.uuid === $route.params.uuid"
              :to="'/' + s.uuid"
            >
              <p class="my-0 force-marquee">{{ s.title }}</p>
            </v-list-item>

            <v-empty-state v-else text="您需要先新增 RSS 源"></v-empty-state>
          </v-list>

          <template v-slot:append>
            <div class="py-4 text-center">
              <v-btn :icon="mdiPlus" size="small" class="mr-6" @click="handleAddSource"></v-btn>

              <v-btn :icon="mdiBellRing" size="small" class="mr-6" @click="handleSubscribe"></v-btn>

              <v-btn :icon="mdiDelete" size="small" color="red" @click="handleRemoveSource"></v-btn>
            </div>

            <v-divider></v-divider>

            <div class="d-flex justify-space-between px-4 py-1">
              <div class="text-label-small">
                <p class="my-0 mt-2">
                  由<b>{{ author }}</b
                  >强力驱动！
                </p>

                <p class="my-0 mb-2">Ver. {{ version }}</p>
              </div>

              <div class="d-flex align-center">
                <v-btn
                  :color="cat.thankCounter > 4 ? 'grey' : 'pink'"
                  size="x-small"
                  @click="cat.thank"
                  >感谢</v-btn
                >
              </div>
            </div>
          </template>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <router-view></router-view>
          </v-container>
        </v-main>
      </v-app>

      <v-snackbar-queue
        v-model="messages.value"
        :total-visible="5"
        closable
        close-text="嗷"
        location="top"
      ></v-snackbar-queue>
    </v-responsive>
  </v-theme-provider>
</template>

<style scoped>
.drawer {
  position: relative;
  z-index: 1;
}

.drawer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/drawer.png');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: -1;
}

.force-marquee {
  white-space: nowrap;
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  0% {
    opacity: 0;
    transform: translateX(0);
  }

  15% {
    opacity: 1;
    transform: translateX(0);
  }

  20% {
    transform: translateX(0);
  }

  80% {
    transform: translateX(-100%);
  }

  85% {
    opacity: 1;
    transform: translateX(-100%);
  }

  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
}
</style>
