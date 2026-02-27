import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Msg = string | { text: string; color: string; onDismiss?: (reason: string) => void }

export const useMessages = defineStore('messages', () => {
  const messages = ref<Msg[]>([])

  function push(msg: Msg) {
    messages.value.push(msg)
  }

  return { messages, push }
})
