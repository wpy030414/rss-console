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
import { useRSSSource } from './stores/rss-source'
import RssContent from './components/RssContent.vue'
import { ref } from 'vue'
import { useMessages } from './stores/msg'
import { useSetting } from './stores/setting'
import router from './router'

useRSSSource().update()
if (router.currentRoute.value.fullPath == '/' && useRSSSource().value.length > 0) {
  router.push('/' + useRSSSource().value[0]!.uuid)
}

const showDrawer = ref(false)

const keyword = ref('')

async function handleRefresh() {
  await useRSSSource().update()
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
  useMessages().push('已刷新')
}

function handleAddSource() {
  const addr = prompt('请输入 RSS 源地址')
  if (addr) {
    useRSSSource().add(addr)
    useMessages().push('已添加')
  }
}

function handleRemoveSource() {
  const uuid = router.currentRoute.value.fullPath.slice(1)
  if (uuid) {
    const source = useRSSSource().value.find((s) => s.uuid === uuid)
    if (!source) {
      useMessages().push('当前 RSS 源不存在')
      return
    }

    if (confirm('真的要移除当前 RSS 源吗？')) {
      useRSSSource().value = useRSSSource().value.filter((s) => s.uuid !== uuid)
      useMessages().push('已移除')
    }
  }
}

function handleSubscribe() {
  useMessages().push('还没有做好这个功能......')
}

const version = import.meta.env.VITE_APP_VERSION

let counter = 0
function handleThank() {
  switch (counter++) {
    case 0:
      useMessages().push('不许感谢')
      break
    case 1:
      useMessages().push({ text: '不许感谢！', color: 'pink' })
      break
    case 2:
      useMessages().push({ text: '不许感谢！！', color: 'red' })
      break
    case 3:
      useMessages().push({ text: '不许感谢呱！！！（大声）', color: 'red' })
      break
    case 4:
      useMessages().push('哼，不理你了......')
      break
  }
}
</script>

<template>
  <v-theme-provider :theme="useSetting().dark ? 'dark' : 'light'">
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
            <div class="py-6 text-center">
              <v-btn
                :icon="useSetting().dark ? mdiWeatherNight : mdiWhiteBalanceSunny"
                size="small"
                class="mr-6"
                @click="useSetting().toggleDark()"
              ></v-btn>

              <v-btn
                :icon="useSetting().hideImage ? mdiImageRemove : mdiImage"
                size="small"
                class="mr-6"
                @click="useSetting().toggleHideImage()"
              ></v-btn>

              <v-btn
                :icon="useSetting().showUnreadOnly ? mdiMessageBadge : mdiMessage"
                size="small"
                @click="useSetting().toggleShowUnreadOnly()"
              ></v-btn>
            </div>
          </template>

          <v-divider></v-divider>

          <v-list>
            <v-list-item
              v-if="useRSSSource().value.length"
              v-for="s in useRSSSource().value"
              :title="s.title"
              :active="'/' + s.uuid === $route.fullPath"
              :to="'/' + s.uuid"
            ></v-list-item>

            <v-empty-state v-else text="您需要先新增 RSS 源"></v-empty-state>
          </v-list>

          <template v-slot:append>
            <div class="py-6 text-center">
              <v-btn :icon="mdiPlus" size="small" class="mr-6" @click="handleAddSource"></v-btn>

              <v-btn :icon="mdiBellRing" size="small" class="mr-6" @click="handleSubscribe"></v-btn>

              <v-btn :icon="mdiDelete" size="small" color="red" @click="handleRemoveSource"></v-btn>
            </div>

            <v-divider></v-divider>

            <div class="d-flex justify-space-between px-4">
              <div class="text-label-small">
                <p class="my-0 mt-2">由<b>杏仁鹿</b>强力驱动！</p>

                <p class="my-0 mb-2">Ver. {{ version }}</p>
              </div>

              <div class="d-flex align-center">
                <v-btn :color="counter > 4 ? 'grey' : 'pink'" size="x-small" @click="handleThank"
                  >感谢</v-btn
                >
              </div>
            </div>
          </template>
        </v-navigation-drawer>

        <v-main>
          <v-container>
            <rss-content v-model:uuid="$route.fullPath" v-model:keyword="keyword"></rss-content>
          </v-container>
        </v-main>
      </v-app>

      <v-snackbar-queue
        v-model="useMessages().messages"
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
  background-image: url('https://media.prts.wiki/9/96/%E7%AB%8B%E7%BB%98_%E8%B5%A4%E5%88%83%E6%98%8E%E9%9C%84%E9%99%88_1.png');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: -1;
}
</style>
