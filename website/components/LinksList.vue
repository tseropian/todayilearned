<template>
  <div id="list">
    <Spinner v-if="loading" class="list-loading" label="Loading links…" />
    <p v-if="loadError" class="load-error">
      Could not load links from the API.
    </p>
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

<script setup>
import { eachDayOfInterval, parseISO, format } from 'date-fns'

const props = defineProps({
  start: {
    type: String,
    default: '2021-07-01'
  },
  end: {
    type: String,
    default: '2021-06-01'
  }
})

const links = ref([])
const loadError = ref(false)
const loading = ref(false)

const generateDates = async () => {
  loadError.value = false
  loading.value = true
  try {
    const dates = eachDayOfInterval({
      start: parseISO(props.end),
      end: parseISO(props.start)
    }).map(day => format(day, 'yyyy-MM-dd')).reverse()

    const linksByDate = await getLinks(dates.join(','))
    links.value = (linksByDate || []).filter(l => l.length > 0)
  } catch (err) {
    console.error('Failed to load links', err)
    loadError.value = true
    links.value = []
  } finally {
    loading.value = false
  }
}

const getLinks = async (date) => {
  const config = useRuntimeConfig()
  const host = String(config.public.TIL_API_HOST || '').replace(/\/?$/, '/')
  const url = host + 'links/' + date
  const data = await $fetch(url)
  return data.result
}

const getDate = (item) => {
  if (item.length > 0) {
    return item[0].postDate
  }
  return ''
}

const formatLink = (url) => {
  const title = url.split('/wiki/')[1]
  if (title) { 
    return decodeURI(title.replaceAll('_', ' ')) 
  }
  return ''
}

onMounted(() => {
  generateDates()
})
</script>

<style>
.list-loading {
  grid-column: 1 / -1;
}

.load-error {
  grid-column: 1 / -1;
  color: #b45309;
}

.single-day {
  overflow: hidden;
  margin-bottom: 20px;
}

#links-per-day li {
  width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 768px) {
  #list {
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  
  .single-day {
    margin-bottom: 15px;
    padding: 10px 14px;
    background: var(--print);
    width: 100%;
    box-sizing: border-box;
  }
  
  .single-day p {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  #links-per-day {
    padding-left: 15px;
  }
  
  #links-per-day li {
    margin-bottom: 8px;
    font-size: 0.95rem;
    line-height: 1.4;
  }
  
  #links-per-day a {
    color: var(--overprint);
    text-decoration: none;
  }
}
</style>
