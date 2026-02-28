import { ref, type Ref } from 'vue'

import { defineStore } from 'pinia'

import { useMessages } from './message'

export const useCat = defineStore(
  'cat',
  () => {
    const messages = useMessages()

    const friendly = ref(false)
    const yourNameRememberedByCat = ref('')

    setTimeout(() => {
      const n = yourNameRememberedByCat.value
      if (n) {
        messages.push({
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

    let feedMutex = Promise.resolve()
    async function feed(feed: Ref<string>) {
      if (['🐟', '🐠', '🐡', '🦈', '🐙', '🍥'].some((e) => e === feed.value) && !friendly.value) {
        await feedMutex
        feedMutex = Promise.withResolvers<void>().promise

        friendly.value = true
        feed.value = '（鱼已被衔走）'
      }
    }

    let thankCounter = ref(0)
    function thank() {
      if (friendly.value) {
        if (!thankCounter.value && yourNameRememberedByCat.value) {
          thankCounter.value = 1
        }

        switch (thankCounter.value) {
          case 0:
            messages.push({
              text: '谢谢喵~ 告诉咱你的名字吧',
              color: '#FFC0CB',
              onDismiss: (reason) => {
                if (
                  reason === 'dismissed' &&
                  (yourNameRememberedByCat.value = prompt('名字') || '')
                ) {
                  thankCounter.value++

                  messages.push({
                    text: `好的喵，${yourNameRememberedByCat.value}，咱会一直记住的`,
                    color: '#FFC0CB',
                  })
                } else {
                  messages.push({
                    text: '不说，也无妨喵',
                    color: '#FFC0CB',
                    onDismiss: () => (friendly.value = false),
                  })
                }
              },
            })
            break
          case 1:
            messages.push({
              text: '找咱作甚？要听个小故事吗？',
              color: '#FFC0CB',
              onDismiss: (reason) => {
                if (reason === 'dismissed') {
                  thankCounter.value++

                  messages.push({
                    text: '从前有座山，山里有座庙...',
                    color: '#FFC0CB',
                  })
                }
              },
            })
            break
          default:
            messages.push({
              text: '（似乎是睡着了，没有反应）',
              color: '#FFC0CB',
            })
        }
      } else {
        switch (thankCounter.value++) {
          case 0:
            messages.push('......')
            break
          case 1:
            messages.push({
              text: '不许感谢',
              color: 'pink',
            })
            break
          case 2:
            messages.push({
              text: '不许感谢！',
              color: 'red',
            })
            break
          case 3:
            messages.push({
              text: '不许感谢喵！！！（大声）',
              color: 'red',
            })
            break
          case 4:
            messages.push('哼，无礼的人类，不理你了......')
            break
        }
      }
    }

    return { friendly, yourNameRememberedByCat, feed, thankCounter, thank }
  },
  {
    persist: {
      omit: ['thankCounter'],
    },
  },
)
