import { ref } from 'vue'

import { defineStore } from 'pinia'

export const useSetting = defineStore(
  'setting',
  () => {
    const dark = ref(false)

    const onlyShowIframe = ref(true)

    const pinUnread = ref(false)

    function toggleDark() {
      dark.value = !dark.value
    }

    function toggleHideImage() {
      onlyShowIframe.value = !onlyShowIframe.value
    }

    function toggleShowUnreadOnly() {
      pinUnread.value = !pinUnread.value
    }

    return {
      dark,
      onlyShowIframe,
      pinUnread,
      toggleDark,
      toggleHideImage,
      toggleShowUnreadOnly,
    }
  },
  { persist: true },
)
