
<template>
  <div id="home">
    <div id="caption">
      <h1>
        Today I Learned
      </h1>
      <h2>
        A nerdy list of the things I'm (not) learning on Wikipedia
      </h2>

      <div style="margin:0 auto; width: 80%">
        <Logo />
      </div>

      <div class="links">
        <a
          href="mailto:hello@todayilearned.cc"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >
          Contact
        </a>
        <a
          href="https://github.com/tseropian/todayilearned"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
      <h2>Archives</h2>
      <div id="archives" />
      <div v-for="year in years" :key="year" class="archive-links">
        <strong>{{ year }}:</strong>
        <span v-for="month in getDateRange(year)" :key="month" class="archive-link"><a :href="'/archives/' + year + '-' + formatMonth(month) ">{{ formatMonth(month) }}</a>.</span>
      </div>
    </div>
    <div id="links">
      <LinksList
        :start="startDate"
        :end="endDate"
      />
    </div>
    <div style="clear:both" />
  </div>
  </div>
</template>

<script>

import { format, subDays } from 'date-fns'
import LinksList from '~/components/LinksList'

export default {
  components: {
    LinksList
  },
  data: () => ({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    dateRange: []
  }),
  computed: {
    years () {
      const year = new Date().getFullYear()
      const years = []
      for (let i = 2019; i <= year; i++) {
        years.push(i)
      }

      return years.reverse()
    },
    months () {
      const months = []
      for (let i = 1; i <= 12; i++) {
        months.push(i)
      }
      return months
    }

  },
  created () {
    this.createDateRange()
  },
  methods: {
    formatNumber (nb) {
      return nb.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    },
    getDateRange (year) {
      const currentRange = this.dateRange.filter((f) => {
        const date = f.split('-')
        return date[0] === year.toString()
      })

      return currentRange.reverse()
    },
    createDateRange () {
      const startDate = '2019-01-01'
      const start = startDate.split('-')
      const end = this.startDate.split('-')
      const startYear = parseInt(start[0])
      const endYear = parseInt(end[0])
      const dates = []
      for (let i = startYear; i <= endYear; i++) {
        const endMonth = i !== endYear ? 11 : parseInt(end[1]) - 1
        const startMon = i === startYear ? parseInt(start[1]) - 1 : 0
        for (let j = startMon; j <= endMonth; j = j > 12 ? j % 12 || 11 : j + 1) {
          const month = j + 1
          const displayMonth = month < 10 ? '0' + month : month
          dates.push([i, displayMonth].join('-'))
        }
      }
      this.dateRange = dates.reverse()
    },
    formatMonth (month) {
      return month.split('-')[1]
    }

  }
}
</script>
