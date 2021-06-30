<template>
  <div id="home">
    <h1>Get in touch</h1>
    <ul id="example-1">
      <li v-for="(item, index) in dates" :key="index">
        <h2>{{ item }}</h2>
      </li>
    </ul>
    <Footer />
  </div>
</template>

<script>

import { format, subDays } from 'date-fns'
export default {
  data: () => ({
    dates: []
  }),
  created () {
    this.generateDates()
  },
  mounted () {
  },
  methods: {
    onClick () {
      document.getElementById('luxbar-checkbox').checked = false
      document.getElementsByClassName('luxbar-menu')[0].scrollTop = 0
    },
    generateDates () {
      for (let i = 0; i < 30; i++) {
        this.dates.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
      }
    },
    getLinks (date) {
      const startTime = 1234
      const endTime = 5678
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
