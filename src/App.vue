<script setup lang="ts">
import { mdiImage, mdiImageRemove, mdiMenu, mdiPlus } from '@mdi/js'
import { useRSSSource } from './stores/rss-source'
import RssContent from './components/RssContent.vue'
import { ref } from 'vue'

useRSSSource().update()

const showDrawer = ref(false)

const hideImg = ref(false)

function handleHideImage() {
  document.body.classList.toggle('hide-img')
  hideImg.value = document.body.classList.contains('hide-img')
}
handleHideImage()

function handleAddSource() {
  const addr = prompt('请输入 RSS 源地址')
  if (addr) {
    useRSSSource().add(addr)
  }
}
</script>

<template>
  <v-responsive class="border rounded">
    <v-app>
      <v-app-bar title="RSS 控制台">
        <template v-slot:prepend>
          <v-btn :icon="mdiMenu" @click="showDrawer = !showDrawer"></v-btn>
        </template>

        <template v-slot:append>
          <v-btn :icon="hideImg ? mdiImage : mdiImageRemove" @click="handleHideImage"></v-btn>
        </template>
      </v-app-bar>

      <v-navigation-drawer v-model="showDrawer">
        <v-list>
          <v-list-item
            v-for="s in useRSSSource().value"
            :title="s.title"
            :value="'/' + s.uuid"
            :to="'/' + s.uuid"
          ></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="py-6 text-center">
            <v-btn :icon="mdiPlus" size="small" @click="handleAddSource"></v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-main>
        <v-container>
          <rss-content v-model="$route.fullPath"></rss-content>
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>

<style scoped></style>
