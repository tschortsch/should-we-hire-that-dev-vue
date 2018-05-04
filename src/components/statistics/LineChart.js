import { Line, mixins } from 'vue-chartjs'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: Object,
    options: Object
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
