import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessages } from './msg'

export const useSetting = defineStore(
  'setting',
  () => {
    const dark = ref<boolean>(false)

    const onlyShowIframe = ref<boolean>(true)

    const pinUnread = ref<boolean>(false)

    const cat = ref<boolean>(false)
    const yourNameRememberedByCat = ref('')

    setTimeout(() => {
      const n = yourNameRememberedByCat.value
      if (n) {
        useMessages().push({
          text: (() => {
            const h = new Date().getHours()
            if (h >= 5 && h < 7) {
              return '哈啊......好早啊喵，好困'
            } else if (h < 10) {
              return `早！上！好！喵！${n}！`
            } else if (h < 14) {
              return `中午好喵，${n}，外面世界天气怎么样？`
            } else if (h < 17) {
              return `下午好喵，${n}，困困......`
            } else if (h < 23) {
              return `晚！上！好！喵！${n}！`
            } else {
              return `zzz...${n}...zzz...`
            }
          })(),
          color: '#FFC0CB',
        })
      }
    })

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
      cat,
      yourNameRememberedByCat,
      toggleDark,
      toggleHideImage,
      toggleShowUnreadOnly,
    }
  },
  { persist: true },
)
