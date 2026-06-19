<template>
  <div id="visualisations">
    <div class="page-header">
      <NuxtLink to="/" class="back-link">← Today I Learned</NuxtLink>
      <h1>Wikipedia Visualisations</h1>
      <p class="subtitle">
        Exploring {{ totalPages.toLocaleString() }} Wikipedia pages across
        {{ totalOccurrences.toLocaleString() }} visits
      </p>
    </div>

    <section class="section">
      <h2>Topics by visit count</h2>
      <p class="section-description">
        Pages grouped by topic, sized by total number of visits.
        Run <code>node tools/fetch-wikipedia-metadata.js</code> then
        <code>node tools/build-visualisation-data.js</code> to regenerate with full Wikipedia category data.
      </p>
      <TopicTreemap v-if="topics && topics.length" :topics="topics" />
    </section>

    <section class="section">
      <h2>Top {{ topPages && topPages.length }} most-visited pages</h2>
      <p class="section-description">
        Click any bar to open the Wikipedia article.
      </p>
      <div class="legend">
        <span
          v-for="topic in topics"
          :key="topic.topic"
          class="legend-item"
        >
          <span class="legend-dot" :style="{ background: topic.color }" />
          {{ topic.topic }}
        </span>
      </div>
      <TopPagesChart v-if="topPages && topPages.length" :pages="topPages" />
    </section>
  </div>
</template>

<script setup>
const { data: topics } = await useFetch('/data/wikipedia-topics.json', { default: () => [] })
const { data: topPages } = await useFetch('/data/wikipedia-top-pages.json', { default: () => [] })

const totalOccurrences = computed(() =>
  (topics.value || []).reduce((sum, t) => sum + t.totalOccurrences, 0),
)

const totalPages = computed(() =>
  (topics.value || []).reduce((sum, t) => sum + t.pageCount, 0),
)
</script>

<style>
#visualisations {
  min-height: 100vh;
  background: #0f172a;
  max-width: 100%;
  padding: 32px 24px 64px;
  font-family: 'Helvetica Neue', sans-serif;
  color: #e2e8f0;
  text-align: left;
}

#visualisations .page-header {
  max-width: 960px;
  margin: 0 auto 48px;
}

#visualisations .back-link {
  display: inline-block;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: color 0.2s;
}

#visualisations .back-link:hover {
  color: #e2e8f0;
}

#visualisations h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px;
  text-align: left;
}

#visualisations .subtitle {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
  text-align: left;
}

#visualisations .section {
  max-width: 960px;
  margin: 0 auto 56px;
}

#visualisations .section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 8px;
  text-align: left;
}

#visualisations .section-description {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 16px;
  line-height: 1.6;
  text-align: left;
}

#visualisations .section-description code {
  background: #1e293b;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.8rem;
  color: #93c5fd;
}

#visualisations .legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

#visualisations .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #94a3b8;
}

#visualisations .legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  #visualisations {
    padding: 20px 16px 48px;
  }

  #visualisations h1 {
    font-size: 1.5rem;
  }
}
</style>
