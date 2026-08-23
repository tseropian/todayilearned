<template>
  <div class="network-container">
    <ClientOnly>
      <VChart
        :option="chartOption"
        :style="{ height: '640px', width: '100%' }"
        autoresize
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
    enterable: true,
    triggerOn: 'click',
    formatter: (info) => {
      if (info.dataType !== 'node') return ''
      const node = info.data
      const categories = (node.topCategories || []).join(', ')
      const categoriesIcon = categories
        ? `<span
            class="category-hint"
            title="${categories.replace(/"/g, '&quot;')}"
          >?</span>`
        : ''
      const linkIcon = node.url
        ? `<a
            class="wikipedia-link-icon"
            href="${node.url}"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Wikipedia page"
          >🔗</a>`
        : ''
      return `<strong>${node.name}</strong> ${categoriesIcon} ${linkIcon}<br/>
        Topic: ${node.topic}<br/>
        ${node.occurrences} occurrences`
    },
  },
  series: [
    {
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      selectedMode: 'single',
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
        label: { show: true, color: '#ece8f1', fontSize: 11 },
        lineStyle: { opacity: 0.6 },
      },
      select: {
        focus: 'adjacency',
        label: { show: true, color: '#ece8f1', fontSize: 11 },
        itemStyle: { borderColor: '#ece8f1', borderWidth: 1.5 },
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
</script>

<style scoped>
.network-container {
  background: var(--ink-surface);
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
}

.chart-placeholder {
  height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-muted);
  background: var(--ink-surface);
  border-radius: 8px;
}
</style>

<style>
/* Unscoped: ECharts renders the tooltip in a floating div outside this
   component's DOM, so scoped styles never reach it. */
.category-hint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid #4a4756;
  border-radius: 50%;
  font-size: 10px;
  line-height: 1;
  color: #a49fb0;
  cursor: help;
}

.wikipedia-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
}
</style>
