<template>
  <div class="row statistics justify-content-center">
    <statistics-box
      v-for="statisticsValue in statisticsValues"
      :key="statisticsValue.name"
      :title="getStatisticsTitles(statisticsValue.name)"
      :value="statisticsValue.value"
      :additional-value="statisticsValue.additionalValue"
      :ranking="statisticsValue.ranking "
    />
  </div>
</template>

<script>
import moment from 'moment'
import StatisticsBox from './StatisticsBox'

export default {
  components: { StatisticsBox },
  name: 'statistics',
  props: {
    userdata: {
      type: Object
    },
    commitsTotalCount: {
      type: Number
    }
  },
  data () {
    return {
    }
  },
  created: function () {
    this.getStatisticsTitles = (name) => {
      const statisticsTitles = {
        createdAt: 'User since',
        stars: 'Stars',
        followers: 'Followers',
        commits: 'Total commits',
        repos: 'Public repos'
      }
      return statisticsTitles[name]
    }

    this.judgementLimits = {
      commits: new Map([
        [100, 10000],
        [90, 8000],
        [80, 6000],
        [70, 4000],
        [60, 2000],
        [50, 1000],
        [40, 700],
        [30, 500],
        [20, 300],
        [10, 100]
      ]),
      followers: new Map([
        [100, 1000],
        [90, 600],
        [80, 300],
        [70, 150],
        [60, 90],
        [50, 50],
        [40, 30],
        [30, 20],
        [20, 10],
        [10, 5]
      ]),
      repos: new Map([
        [100, 100],
        [90, 80],
        [80, 60],
        [70, 45],
        [60, 35],
        [50, 25],
        [40, 20],
        [30, 15],
        [20, 10],
        [10, 5]
      ]),
      stars: new Map([
        [100, 250],
        [90, 200],
        [80, 150],
        [70, 100],
        [60, 70],
        [50, 50],
        [40, 30],
        [30, 20],
        [20, 10],
        [10, 5]
      ]),
      createdAt: new Map([
        [100, 6 * (365 * 24 * 60 * 60)], // 6 years
        [90, 5 * (365 * 24 * 60 * 60)],
        [80, 4.5 * (365 * 24 * 60 * 60)],
        [70, 4 * (365 * 24 * 60 * 60)],
        [60, 3.5 * (365 * 24 * 60 * 60)],
        [50, 3 * (365 * 24 * 60 * 60)],
        [40, 2.5 * (365 * 24 * 60 * 60)],
        [30, 2 * (365 * 24 * 60 * 60)],
        [20, 1.5 * (365 * 24 * 60 * 60)],
        [10, (365 * 24 * 60 * 60)]
      ])
    }

    this.getOverallRankingValue = (statisticsValues) => {
      return statisticsValues.reduce((rankingAccumulator, statisticsValue) => {
        return rankingAccumulator + statisticsValue.ranking
      }, 0)
    }
    this.getMaxRanking = (statisticsValues) => {
      return 100 * statisticsValues.length
    }

    this.getJudgement = (type, value) => {
      if (this.judgementLimits.hasOwnProperty(type)) {
        for (let [rank, limit] of this.judgementLimits[type]) {
          if (value >= limit) {
            return rank
          }
        }
      }
      return 0
    }
  },
  computed: {
    statisticsValues () {
      let statisticsValues = []
      if (this.userdata && this.commitsTotalCount) {
        const createdAt = new Date(this.userdata.createdAt)
        const createdAtMoment = moment(createdAt)
        const createdAtTimestamp = createdAtMoment.unix()
        const currentTimestamp = moment().unix()
        statisticsValues.push({
          name: 'createdAt',
          value: createdAtMoment.fromNow(),
          additionalValue: createdAtMoment.format('(DD.MM.YYYY)'),
          ranking: this.getJudgement('createdAt', currentTimestamp - createdAtTimestamp)
        })

        const starsCount = this.userdata.repositories.nodes.reduce((starsCount, repo) => {
          return starsCount + repo.stargazers.totalCount
        }, 0)
        statisticsValues.push({
          name: 'stars',
          value: starsCount,
          ranking: this.getJudgement('stars', starsCount)
        })

        const followersValue = this.userdata.followers.totalCount
        statisticsValues.push({
          name: 'followers',
          value: followersValue,
          ranking: this.getJudgement('followers', followersValue)
        })

        const commitsValue = this.commitsTotalCount
        statisticsValues.push({
          name: 'commits',
          value: commitsValue,
          ranking: this.getJudgement('commits', commitsValue)
        })

        const reposValue = this.userdata.repositories.totalCount
        statisticsValues.push({
          name: 'repos',
          value: reposValue,
          ranking: this.getJudgement('repos', reposValue)
        })
      } else {
        statisticsValues = [
          {
            name: 'createdAt',
            value: '-',
            additionalValue: '',
            ranking: 0
          },
          {
            name: 'stars',
            value: 0,
            ranking: 0
          },
          {
            name: 'followers',
            value: 0,
            ranking: 0
          },
          {
            name: 'commits',
            value: 0,
            ranking: 0
          },
          {
            name: 'repos',
            value: 0,
            ranking: 0
          }
        ]
      }

      return statisticsValues
    },
    repositoriesContributedTo () {
      return this.userdata ? this.userdata.repositoriesContributedTo.nodes : []
    },
    overallRankingValue () {
      return this.getOverallRankingValue(this.statisticsValues())
    },
    maxRanking () {
      return this.getMaxRanking(this.statisticsValues())
    }
  }
}
</script>

<style lang="scss">

</style>
