<template>
  <div class="network-container">
    <ClientOnly>
      <VChart
        :option="chartOption"
        :style="{ height: '640px', width: '100%' }"
        autoresize
        @click="onNodeClick"
      />
      <template #fallback>
        <div class="chart-placeholder">Loading chart…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
const props = defineProps({
  nodes: {
    type: Array,
    required: true,
  },
  edges: {
    type: Array,
    required: true,
  },
})

const MIN_SYMBOL_SIZE = 6
const MAX_SYMBOL_SIZE = 44

const symbolSizeScale = computed(() => {
  const occurrences = props.nodes.map((n) => n.occurrences)
  const min = Math.min(...occurrences)
  const max = Math.max(...occurrences)
  return (value) => {
    if (max === min) return (MIN_SYMBOL_SIZE + MAX_SYMBOL_SIZE) / 2
    const t = Math.sqrt((value - min) / (max - min))
    return MIN_SYMBOL_SIZE + t * (MAX_SYMBOL_SIZE - MIN_SYMBOL_SIZE)
  }
})

const chartOption = computed(() => ({
  tooltip: {
    formatter: (info) => {
      if (info.dataType !== 'node') return ''
      const node = info.data
      const categories = (node.topCategories || []).join(', ')
      return `<strong>${node.name}</strong><br/>
        Topic: ${node.topic}<br/>
        ${node.occurrences} occurrences<br/>
        ${categories ? `${categories}<br/>` : ''}
        <em style="color:#94a3b8">Click to open Wikipedia</em>`
    },
  },
  series: [
    {
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      force: {
        repulsion: 40,
        edgeLength: [15, 70],
        gravity: 0.05,
        friction: 0.2,
      },
      label: { show: false },
      lineStyle: {
        color: 'source',
        opacity: 0.15,
        curveness: 0,
      },
      emphasis: {
        focus: 'adjacency',
        label: { show: true, color: '#e2e8f0', fontSize: 11 },
        lineStyle: { opacity: 0.6 },
      },
      data: props.nodes.map((n) => ({
        id: n.id,
        name: n.label,
        symbolSize: symbolSizeScale.value(n.occurrences),
        itemStyle: { color: n.color },
        topic: n.topic,
        occurrences: n.occurrences,
        topCategories: n.topCategories,
        url: n.url,
      })),
      links: props.edges.map((e) => ({
        source: e.source,
        target: e.target,
        value: e.weight,
      })),
    },
  ],
  backgroundColor: 'transparent',
}))

function onNodeClick(params) {
  if (params.dataType === 'node' && params.data && params.data.url) {
    window.open(params.data.url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.network-container {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
}

.chart-placeholder {
  height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #0f172a;
  border-radius: 8px;
}
</style>
