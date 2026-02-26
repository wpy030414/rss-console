import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDark = defineStore(
  'dark',
  () => {
    const value = ref<boolean>(false)

    function toggle() {
      value.value = !value.value
    }

    return { value, toggle }
  },
  { persist: true },
)
