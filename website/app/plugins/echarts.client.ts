import { defineNuxtPlugin } from '#app'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreemapChart, BarChart, GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
// ECharts 6 deprecated grid.containLabel in favour of grid.outerBounds; this
// keeps TopPagesChart's `containLabel: true` behaving as it did on ECharts 5.
import { LegacyGridContainLabel } from 'echarts/features'

export default defineNuxtPlugin((nuxtApp) => {
  use([
    CanvasRenderer,
    TreemapChart,
    BarChart,
    GraphChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LegacyGridContainLabel,
  ])
  nuxtApp.vueApp.component('VChart', VChart)
})
