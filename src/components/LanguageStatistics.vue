<template>
  <div class="col-md-6 col-10 mb-5">
    <h3>Most used languages</h3>
    <language-pie-chart v-if="this.repositoriesContributedTo.length > 0" :chartData="chartData" :options="chartOptions" />
    <language-pie-chart v-else :chartData="chartDataDisabled" :options="chartOptions" />
  </div>
</template>

<script>
import LanguagePieChart from './LanguagePieChart'

export default {
  name: 'language-statistics',
  components: {
    LanguagePieChart
  },
  props: {
    repositoriesContributedTo: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      chartOptions: {
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              const value = data.datasets[0].data[tooltipItem.index]
              return data.labels[tooltipItem.index] + ': ' + value + '%'
            }
          }
        },
        animation: {
          duration: 2000
        }
      },
      chartDataDisabled: {
        labels: [
          'Language X',
          'Language Y',
          'Language Z'
        ],
        datasets: [
          {
            data: [
              20, 35, 45
            ],
            backgroundColor: [
              '#b3b3b3',
              '#8d8d8d',
              '#494949'
            ],
            hoverBackgroundColor: [
              '#b3b3b3',
              '#8d8d8d',
              '#494949'
            ]
          }]
      }
    }
  },
  computed: {
    chartData () {
      if (this.repositoriesContributedTo.length > 0) {
        let totalLanguages = 0
        const languageStatistics = this.repositoriesContributedTo.reduce((accumulator, repository) => {
          repository.languages.edges.forEach(language => {
            let count = accumulator.get(language.node.name)
            if (count) {
              count += language.size
            } else {
              count = language.size
            }
            accumulator.set(language.node.name, count)
            totalLanguages += language.size
          })
          return accumulator
        }, new Map())

        const languageStatisticsPercentage = [...languageStatistics.entries()].reduce((accumulator, language) => {
          const languagePercentage = this.getPercentage(language[1], totalLanguages)
          if (languagePercentage < 2) {
            let otherCount = accumulator.get('Other')
            otherCount += languagePercentage
            accumulator.set('Other', otherCount)
          } else {
            accumulator.set(language[0], languagePercentage)
          }
          return accumulator
        }, new Map([['Other', 0]]))

        const languageStatisticsSorted = new Map([...languageStatisticsPercentage.entries()].sort((a, b) => {
          if (a[1] < b[1]) {
            return 1
          }
          if (a[1] > b[1]) {
            return -1
          }
          return 0
        }))

        let languageStatisticsPieChartData = {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [
                '#96db89',
                '#FFCE56',
                '#ff8668',
                '#FF6384',
                '#9992ff',
                '#36A2EB',
                '#a7e7ff'
              ],
              hoverBackgroundColor: [
                '#96db89',
                '#FFCE56',
                '#ff8668',
                '#FF6384',
                '#9992ff',
                '#36A2EB',
                '#a7e7ff'
              ]
            }]
        }
        languageStatisticsSorted.forEach((languagePercentage, language) => {
          const languagePercentageRounded = this.round(languagePercentage)
          languageStatisticsPieChartData.labels.push(language)
          languageStatisticsPieChartData.datasets[0].data.push(languagePercentageRounded)
        })

        return languageStatisticsPieChartData
      }
      return {
        labels: [],
        datasets: []
      }
    }
  },
  created () {
    this.getPercentage = (value, total) => value * 100 / total
    this.round = (num) => Math.round(num * 10) / 10
  }
}
</script>

<style scoped>

</style>
