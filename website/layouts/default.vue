<template>
  <div id="home">
    <h1>Get in touch</h1>
    <ul id="example-1">
      <li v-for="(item, index) in dates" :key="index">
        <h2>{{ item.date }}</h2>
        <ul id="links-per-day">
          <li v-for="(link, indexLink) in item.links" :key="indexLink">
            <a :href="link.url">{{ formatLink(link.url) }}</a>
          </li>
        </ul>
      </li>
    </ul>
    <Footer />
  </div>
</template>

<script>

import { format, subDays } from 'date-fns'
import axios from 'axios'

export default {
  data: () => ({
    dates: []
  }),
  created () {
    this.generateDates()
  },
  mounted () {
    // console.log(process.env.TIL_API_HOST)
  },
  methods: {

    async generateDates () {
      for (let i = 0; i < 4 * 30; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
        this.dates.push(
          {
            date,
            links: await this.getLinks(date)
          }
        )
        // console.log(this.dates)
      }
    },
    async getLinks (date) {
      const url = process.env.TIL_API_HOST + 'links/' + date
      // console.log(url)
      const links = await axios.get(url).then(res => res.data
      )
      return links.result[0]
    },

    formatLink (url) {
      const title = url.split('/wiki/')[1]
      return title.replaceAll('_', ' ')
    }

  }
}
</script>

<style>
html {
  font-family:
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
