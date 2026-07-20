<template>
  <div class="bar-chart-container">
    <ClientOnly>
      <VChart
        :option="chartOption"
        :style="{ height: chartHeight, width: '100%' }"
        autoresize
        @click="onBarClick"
      />
      <template #fallback>
        <div class="chart-placeholder">Loading chart…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
const props = defineProps({
  pages: {
    type: Array,
    required: true,
  },
})

const chartHeight = computed(() => `${Math.max(400, props.pages.length * 28)}px`)

const chartOption = computed(() => {
  const sorted = [...props.pages].sort((a, b) => a.occurrences - b.occurrences)
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        const page = sorted[p.dataIndex]
        return `<strong>${page.title}</strong><br/>
          Topic: ${page.topic}<br/>
          ${page.occurrences} occurrences<br/>
          <em style="color:#94a3b8">Click to open Wikipedia</em>`
      },
    },
    grid: { left: '2%', right: '6%', bottom: '2%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#1e293b' } },
    },
    yAxis: {
      type: 'category',
      data: sorted.map((p) => p.title),
      axisLabel: {
        color: '#e2e8f0',
        fontSize: 12,
        width: 220,
        overflow: 'truncate',
      },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((p) => ({
          value: p.occurrences,
          itemStyle: { color: p.color },
          url: p.url,
        })),
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 11,
        },
      },
    ],
    backgroundColor: 'transparent',
  }
})

function onBarClick(params) {
  if (params.data && params.data.url) {
    window.open(params.data.url, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.bar-chart-container {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
  cursor: pointer;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #0f172a;
  border-radius: 8px;
}
</style>
