<template>
  <div id="list">
    <div v-for="(item, index) in links" :key="index" class="single-day">
      <p>{{ getDate(item) }}</p>
      <ul id="links-per-day">
        <li v-for="(link, indexLink) in item" :key="indexLink">
          <a :href="link.url">{{ formatLink(link.url) }}</a>,
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import axios from 'axios'

export default {
  props: {
    start: {
      type: String,
      default: '2021-07-01'
    },

    end: {
      type: String,
      default: '2021-06-01'
    }
  },
  data () {
    return {
      dates: [],
      links: []
    }
  },
  created () {
    this.generateDates()
  },
  mounted () {},
  methods: {

    async generateDates () {
      const dateMove = new Date(this.end)
      let strDate = this.end
      while (strDate < this.start) {
        strDate = dateMove.toISOString().slice(0, 10)
        this.dates.push(strDate)
        dateMove.setDate(dateMove.getDate() + 1)
      };
      this.dates.reverse()

      const linksByDate = await this.getLinks(this.dates.join(','))
      this.links = linksByDate.filter(l => l.length > 0)
    },
    async getLinks (date) {
      const url = process.env.TIL_API_HOST + 'links/' + date
      const links = await axios.get(url).then(res => res.data
      )
      return links.result
    },
    getDate (item) {
      if (item.length > 0) {
        return item[0].postDate
      }
      return ''
    },

    formatLink (url) {
      console.log(url)
      const title = url.split('/wiki/')[1]
      if (title) { return decodeURI(title.replaceAll('_', ' ')) }
      return ''
    }
  }
}
</script>
