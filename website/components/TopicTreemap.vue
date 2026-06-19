<template>
  <div class="treemap-container">
    <ClientOnly>
      <VChart
        :option="chartOption"
        :style="{ height: '420px', width: '100%' }"
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
  topics: {
    type: Array,
    required: true,
  },
})

const chartOption = computed(() => ({
  tooltip: {
    formatter: (info) => {
      const { name, value, data } = info
      return `<strong>${name}</strong><br/>
        ${value.toLocaleString()} occurrences<br/>
        ${data.pageCount} pages`
    },
  },
  series: [
    {
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: true,
        formatter: (params) => `${params.name}\n${params.value.toLocaleString()}`,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#fff',
      },
      itemStyle: {
        borderColor: '#1e293b',
        borderWidth: 2,
        gapWidth: 2,
      },
      data: props.topics.map((t) => ({
        name: t.topic,
        value: t.totalOccurrences,
        pageCount: t.pageCount,
        itemStyle: { color: t.color },
      })),
    },
  ],
}))
</script>

<style scoped>
.treemap-container {
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
}

.chart-placeholder {
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: #0f172a;
  border-radius: 8px;
}
</style>
