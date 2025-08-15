
<template>
  <div id="home">
    <div id="caption">
      <div style="margin:0 auto; width: 80%">
        <Logo />
        <div class="title-content">
          <h1>
            Today I Learned
          </h1>
          <h2>
            A nerdy list of the things I'm (not) learning on Wikipedia
          </h2>
        </div>
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
    </div>
    <div id="links">
      <LinksList
        :start="startDate"
        :end="endDate"
      />
    </div>
    <div id="archives-section">
      <h2>Archives</h2>
      <div id="archives" />
      <div v-for="year in years" :key="year" class="archive-links">
        <strong>{{ year }}:</strong>
        <span v-for="month in getDateRange(year)" :key="month" class="archive-link">
          <NuxtLink :to="'/archives/' + year + '-' + formatMonth(month)">{{ formatMonth(month) }}</NuxtLink>.
        </span>
      </div>
    </div>
    <div style="clear:both" />
  </div>
</template>

<script setup>
import { format, subDays } from 'date-fns'

const startDate = format(new Date(), 'yyyy-MM-dd')
const endDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
const dateRange = ref([])

const years = computed(() => {
  const year = new Date().getFullYear()
  const years = []
  for (let i = 2019; i <= year; i++) {
    years.push(i)
  }
  return years.reverse()
})

const formatNumber = (nb) => {
  return nb.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
}

const getDateRange = (year) => {
  const currentRange = dateRange.value.filter((f) => {
    const date = f.split('-')
    return date[0] === year.toString()
  })
  return currentRange.reverse()
}

const createDateRange = () => {
  const startDateRange = '2019-01-01'
  const start = startDateRange.split('-')
  const end = startDate.split('-')
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
  dateRange.value = dates.reverse()
}

const formatMonth = (month) => {
  return month.split('-')[1]
}

onMounted(() => {
  createDateRange()
})
</script>

<style>
@media (max-width: 768px) {
  #home {
    padding: 10px;
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }
  
  #caption {
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    order: 1;
  }
  
  #caption h1 {
    font-size: 1.8rem;
    text-align: center;
  }
  
  #caption h2 {
    font-size: 1.2rem;
    text-align: center;
    margin: 15px 0;
  }
  
  #caption > div[style*="width: 80%"] {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-direction: row;
    margin: 20px 0;
    width: 100% !important;
  }
  
  #caption svg {
    width: 33%;
    height: auto;
  }
  
  .title-content {
    flex: 1;
  }
  
  .title-content h1 {
    text-align: left;
    margin: 5px 0;
    font-size: 1.5rem;
  }
  
  .title-content h2 {
    text-align: left;
    margin: 5px 0;
    font-size: 0.4rem;
  }
  
  .links {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin: 20px 0;
  }
  
  .links a {
    flex: 1;
    text-align: center;
    padding: 12px;
    box-sizing: border-box;
  }
  
  #archives-section {
    order: 3;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    margin-top: 20px;
  }
  
  .archive-links {
    margin: 10px 0;
    word-wrap: break-word;
  }
  
  .archive-link {
    display: inline-block;
    margin: 5px;
  }
  
  #links {
    width: 100%;
    margin-top: 20px;
    padding: 0 10px;
    box-sizing: border-box;
    order: 2;
  }
}

.links {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.links a {
  flex: 0 0 auto;
  text-align: center;
  padding: 12px 24px;
  box-sizing: border-box;
}
</style>
