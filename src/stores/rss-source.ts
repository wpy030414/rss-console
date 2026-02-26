import { ref } from 'vue'
import { defineStore } from 'pinia'
import { xml2json } from 'xml-js'

export interface RSSSource {
  uuid: string
  addr: string
  title: string
  dataCache: (any & {
    read?: boolean
  })[]
}

export const useRSSSource = defineStore(
  'rss-source',
  () => {
    const value = ref<RSSSource[]>([])

    let maintainingMutex = Promise.resolve()

    async function url2RSSSource(addr: string, uuid?: string): Promise<RSSSource> {
      const _ = JSON.parse(
        xml2json(await (await fetch(addr)).text(), {
          compact: true,
          spaces: 2,
          trim: true,
        }),
      )

      return {
        uuid:
          uuid ||
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          }),
        title: _.rss.channel.title._text,
        addr,
        dataCache: Array.from(_.rss.channel.item || []).map((e) =>
          Object.assign({}, e, { read: false }),
        ),
      }
    }

    async function add(addr: string) {
      await maintainingMutex

      const { promise, resolve } = Promise.withResolvers<void>()
      maintainingMutex = promise

      try {
        const rssSource = await url2RSSSource(addr)

        value.value.unshift(rssSource)
      } catch (e) {
        alert(e)
      }

      resolve()
    }

    async function update() {
      await maintainingMutex

      const { promise, resolve } = Promise.withResolvers<void>()
      maintainingMutex = promise

      for (let i = 0; i < value.value.length; i++) {
        const s = value.value[i]!
        try {
          const updated = await url2RSSSource(s.addr, s.uuid)
          const readMap = new Map(s.dataCache.map((e) => [e.guid._text, e.read]))
          s.dataCache = updated.dataCache.map((e) => {
            const read = readMap.get(e.guid._text)
            return Object.assign({}, e, { read })
          })
        } catch {}
      }

      resolve()
    }

    setInterval(() => console.debug(maintainingMutex), 1000)

    return { value, add, update }
  },
  { persist: true },
)
