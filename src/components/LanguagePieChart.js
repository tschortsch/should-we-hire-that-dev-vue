import { Pie } from 'vue-chartjs'

export default {
  extends: Pie,
  props: ['data', 'options'],
  computed: {
    chartData: function () {
      return this.data
    }
  },
  watch: {
    data: function () {
      if (this._chart) {
        this._chart.destroy()
      }
      this.renderChart(this.chartData, this.options)
    }
  }
}
