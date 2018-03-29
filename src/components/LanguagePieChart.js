import { Pie, mixins } from 'vue-chartjs'

export default {
  extends: Pie,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: Object,
    options: Object
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
