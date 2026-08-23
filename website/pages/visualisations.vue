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

    <section class="section">
      <h2>Category network</h2>
      <p class="section-description">
        Pages linked when they share Wikipedia categories. Node size is visit count;
        colour is topic. Drag to explore, scroll to zoom, click a node to open its article.
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
      <WikipediaNetworkGraph v-if="network && network.nodes && network.nodes.length" :nodes="network.nodes" :edges="network.edges" />
    </section>
  </div>
</template>

<script setup>
// server: false — these are static public/data files fetched purely for the
// ClientOnly charts below; the prerenderer's internal self-fetch to its own
// public assets 404s, so fetch only once mounted in the browser instead.
const { data: topics } = await useFetch('/data/wikipedia-topics.json', { server: false, default: () => [] })
const { data: topPages } = await useFetch('/data/wikipedia-top-pages.json', { server: false, default: () => [] })
const { data: network } = await useFetch('/data/wikipedia-network.json', { server: false, default: () => ({ nodes: [], edges: [] }) })

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
  background: var(--ink-bg);
  max-width: 100%;
  padding: 32px 24px 64px;
  font-family: var(--font-body);
  color: var(--ink-text);
  text-align: left;
}

#visualisations .page-header {
  max-width: 960px;
  margin: 0 auto 48px;
}

#visualisations .back-link {
  display: inline-block;
  color: var(--ink-muted);
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: color 0.2s;
}

#visualisations .back-link:hover {
  color: var(--ink-text);
}

#visualisations h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  text-align: left;
}

#visualisations .subtitle {
  color: var(--ink-muted);
  font-size: 1rem;
  margin: 0;
  text-align: left;
}

#visualisations .section {
  max-width: 100%;
  margin: 0 0 56px;
}

#visualisations .section h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
  text-align: left;
}

#visualisations .section-description {
  color: var(--ink-muted);
  font-size: 0.875rem;
  margin: 0 0 16px;
  line-height: 1.6;
  text-align: left;
}

#visualisations .section-description code {
  font-family: var(--font-mono);
  background: var(--ink-elevated);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.8rem;
  color: var(--ink-accent);
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
  color: var(--ink-muted);
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
