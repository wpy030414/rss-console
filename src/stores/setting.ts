import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSetting = defineStore(
  'setting',
  () => {
    const dark = ref<boolean>(false)

    const hideImage = ref<boolean>(true)

    const showUnreadOnly = ref<boolean>(false)

    function toggleDark() {
      dark.value = !dark.value
    }

    function toggleHideImage() {
      hideImage.value = !hideImage.value
    }

    function toggleShowUnreadOnly() {
      showUnreadOnly.value = !showUnreadOnly.value
    }

    return { dark, hideImage, showUnreadOnly, toggleDark, toggleHideImage, toggleShowUnreadOnly }
  },
  { persist: true },
)
