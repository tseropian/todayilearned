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

<script setup>
import axios from 'axios'

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

const dates = ref([])
const links = ref([])

const generateDates = async () => {
  const dateMove = new Date(props.end)
  let strDate = props.end
  while (strDate < props.start) {
    strDate = dateMove.toISOString().slice(0, 10)
    dates.value.push(strDate)
    dateMove.setDate(dateMove.getDate() + 1)
  }
  dates.value.reverse()

  const linksByDate = await getLinks(dates.value.join(','))
  links.value = linksByDate.filter(l => l.length > 0)
}

const getLinks = async (date) => {
  const config = useRuntimeConfig()
  const url = config.public.TIL_API_HOST + 'links/' + date
  const response = await axios.get(url)
  console.log('Links response:', response.data)
  return response.data.result
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
    padding: 10px;
    background: #f9f9f9;
    border-radius: 5px;
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
    color: white;
    text-decoration: none;
  }
}
</style>
