import { defineNuxtPlugin } from '#app'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreemapChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'

export default defineNuxtPlugin((nuxtApp) => {
  use([CanvasRenderer, TreemapChart, BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])
  nuxtApp.vueApp.component('VChart', VChart)
})
