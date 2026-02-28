import { ref } from 'vue'

import { defineStore } from 'pinia'

export type Msg = string | { text: string; color: string; onDismiss?: (reason: string) => void }

export const useMessages = defineStore('message', () => {
  const value = ref<Msg[]>([])

  function push(msg: Msg) {
    value.value.push(msg)
  }

  return { value, push }
})
