import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMessages = defineStore('messages', () => {
  const messages = ref<(string | { text: string; color: string })[]>([])

  function push(msg: string | { text: string; color: string }) {
    messages.value.push(msg)
  }

  return { messages, push }
})
