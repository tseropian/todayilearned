
<template>
  <div id="home">
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

const siteUrl = useRuntimeConfig().public.siteUrl
const description = "A nerdy list of the things I'm (not) learning on Wikipedia."

useSeoMeta({
  title: 'Today I Learned',
  description,
  ogTitle: 'Today I Learned',
  ogDescription: description,
  ogUrl: siteUrl,
  twitterTitle: 'Today I Learned',
  twitterDescription: description
})
useHead({
  link: [{ rel: 'canonical', href: siteUrl }]
})

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

#archives-section h2 {
  font-size: 1.6rem;
  margin-top: 1.2em;
  color: var(--blue);
}
</style>
