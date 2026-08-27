<template>
  <div id="visualisations">
    <div class="page-header">
      <h1>Wikipedia Visualisations</h1>
      <p class="subtitle">
        Exploring {{ totalPages.toLocaleString() }} Wikipedia pages across
        {{ totalOccurrences.toLocaleString() }} visits
      </p>
      <p v-if="formattedCreatedAt" class="data-freshness">
        Data as of {{ formattedCreatedAt }}
      </p>
    </div>

    <section class="section">
      <h2>Topics by visit count</h2>
      <p class="section-description">
        Pages grouped by topic, sized by total number of visits.
        Data is refreshed daily by the <code>til-build-visualisation-data</code> Lambda.
      </p>
      <Spinner v-if="topicsPending" label="Loading topics…" />
      <TopicTreemap v-else-if="topics && topics.length" :topics="topics" />
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
      <Spinner v-if="topPagesPending" label="Loading pages…" />
      <TopPagesChart v-else-if="topPages && topPages.length" :pages="topPages" />
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
      <Spinner v-if="networkPending" label="Loading network…" />
      <WikipediaNetworkGraph v-else-if="network && network.nodes && network.nodes.length" :nodes="network.nodes" :edges="network.edges" />
    </section>
  </div>
</template>

<script setup>
const siteUrl = useRuntimeConfig().public.siteUrl
const vizTitle = 'Wikipedia Visualisations — Today I Learned'
const vizDescription = 'Explore the Wikipedia pages behind Today I Learned: a topic treemap, the most-visited pages, and a category-similarity network graph.'
const vizUrl = `${siteUrl}/visualisations`

useSeoMeta({
  title: vizTitle,
  description: vizDescription,
  ogTitle: vizTitle,
  ogDescription: vizDescription,
  ogUrl: vizUrl,
  twitterTitle: vizTitle,
  twitterDescription: vizDescription
})
useHead({
  link: [{ rel: 'canonical', href: vizUrl }]
})

// Fetch the freshly-published data from the serve Lambda at runtime
// (client-side) so the statically-generated site reflects the latest daily
// pipeline run — including when it ran — without a rebuild. One request backs
// all three sections and carries the createdAt date.
const { public: { TIL_DATA_API } } = useRuntimeConfig()

const { data: viz, pending } = await useFetch(TIL_DATA_API, {
  server: false,
  default: () => ({ createdAt: null, topics: [], topPages: [], network: { nodes: [], edges: [] } }),
})

const topics = computed(() => viz.value?.topics || [])
const topPages = computed(() => viz.value?.topPages || [])
const network = computed(() => viz.value?.network || { nodes: [], edges: [] })

// The single request backs every section, so they share one pending flag.
const topicsPending = pending
const topPagesPending = pending
const networkPending = pending

const formattedCreatedAt = computed(() => {
  const createdAt = viz.value?.createdAt
  if (!createdAt) return ''
  return new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })
})

const totalOccurrences = computed(() =>
  topics.value.reduce((sum, t) => sum + t.totalOccurrences, 0),
)

const totalPages = computed(() =>
  topics.value.reduce((sum, t) => sum + t.pageCount, 0),
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

#visualisations h1 {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--char);
  margin: 0 0 8px;
  text-align: left;
}

#visualisations .subtitle {
  color: var(--ink-muted);
  font-size: 1rem;
  margin: 0;
  text-align: left;
}

#visualisations .data-freshness {
  color: var(--dim);
  font-size: 0.8rem;
  margin: 6px 0 0;
  text-align: left;
}

#visualisations .section {
  max-width: 100%;
  margin: 0 0 56px;
}

#visualisations .section h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--blue);
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
  color: var(--overprint);
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

/* Retune the spinner for the dark data panels */
#visualisations .spinner__ring {
  border-color: var(--ink-border);
  border-top-color: var(--ink-accent);
}

#visualisations .spinner__label {
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
