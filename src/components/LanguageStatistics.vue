<template>
  <div v-if="this.repositoriesContributedTo.length > 0" class="col-md-6 col-10">
    <h3>Languages</h3>
    <language-pie-chart :chartData="chartData" :options="chartOptions" />
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
    repositoriesContributedTo: Array
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
      }
    }
  },
  computed: {
    chartData () {
      if (this.repositoriesContributedTo.length > 0) {
        console.log(this.repositoriesContributedTo)
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
        console.log(languageStatistics)

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
        console.log(languageStatisticsPercentage)

        const languageStatisticsSorted = new Map([...languageStatisticsPercentage.entries()].sort((a, b) => {
          if (a[1] < b[1]) {
            return 1
          }
          if (a[1] > b[1]) {
            return -1
          }
          return 0
        }))
        console.log(languageStatisticsSorted)
        console.log(totalLanguages)

        let languageStatisticsPieChartData = {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#96db89',
                '#ff80b3',
                '#9992ff',
                '#a7e7ff'
              ],
              hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#96db89',
                '#ff80b3',
                '#9992ff',
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
