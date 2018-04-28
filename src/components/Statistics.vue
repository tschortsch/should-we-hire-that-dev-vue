<template>
  <div class="statistics">
    <div class="row justify-content-center">
      <statistics-box
        v-for="statisticsValue in statisticsValues"
        :key="statisticsValue.name"
        :title="getStatisticsTitles(statisticsValue.name)"
        :value="statisticsValue.value"
        :additional-value="statisticsValue.additionalValue"
        :ranking="statisticsValue.ranking "
      />
      <overall-ranking
        title="Overall ranking"
        :value="overallRankingValue"
        :maxRanking="maxRanking"
      />
    </div>
    <div class="row justify-content-center">
      <language-statistics :repositoriesContributedTo="repositoriesContributedTo" />
    </div>
    <div class="row justify-content-center">
      <most-famous-repository :repository="mostFamousRepository" />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import StatisticsBox from './StatisticsBox'
import OverallRanking from './OverallRanking'
import LanguageStatistics from './LanguageStatistics'
import MostFamousRepository from './MostFamousRepository'

export default {
  components: {
    MostFamousRepository,
    LanguageStatistics,
    OverallRanking,
    StatisticsBox
  },
  name: 'statistics',
  props: {
    userdata: Object,
    commitsTotalCount: Number
  },
  created: function () {
    this.statisticsTitles = {
      createdAt: 'User since',
      stars: 'Stars',
      forks: 'Forks of own repos',
      followers: 'Followers',
      commits: 'Total commits',
      repos: 'Public repos',
      pullRequests: 'Pull requests'
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
      forks: new Map([
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
      ]),
      pullRequests: new Map([
        [100, 1000],
        [90, 800],
        [80, 600],
        [70, 450],
        [60, 300],
        [50, 200],
        [40, 100],
        [30, 50],
        [20, 10],
        [10, 5]
      ])
    }

    this.getStatisticsTitles = (name) => {
      return this.statisticsTitles[name]
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
      if (this.userdata && this.commitsTotalCount !== null) {
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

        const followersValue = this.userdata.followers.totalCount
        statisticsValues.push({
          name: 'followers',
          value: followersValue,
          ranking: this.getJudgement('followers', followersValue)
        })

        if (this.userdata.repositories.nodes) {
          const starsCount = this.userdata.repositories.nodes.reduce((starsCount, repo) => {
            return starsCount + repo.stargazers.totalCount
          }, 0)
          statisticsValues.push({
            name: 'stars',
            value: starsCount,
            ranking: this.getJudgement('stars', starsCount)
          })

          const forksCount = this.userdata.repositories.nodes.reduce((forksCount, repo) => {
            return forksCount + repo.forkCount
          }, 0)
          statisticsValues.push({
            name: 'forks',
            value: forksCount,
            ranking: this.getJudgement('forks', forksCount)
          })
        } else {
          statisticsValues.push({
            name: 'stars',
            value: '???',
            ranking: 0
          })
          statisticsValues.push({
            name: 'forks',
            value: '???',
            ranking: 0
          })
        }

        const commitsValue = this.commitsTotalCount
        statisticsValues.push({
          name: 'commits',
          value: commitsValue,
          ranking: this.getJudgement('commits', commitsValue)
        })

        if (this.userdata.pullRequests) {
          const pullRequestsValue = this.userdata.pullRequests.totalCount
          statisticsValues.push({
            name: 'pullRequests',
            value: pullRequestsValue,
            ranking: this.getJudgement('pullRequests', pullRequestsValue)
          })
        } else {
          statisticsValues.push({
            name: 'pullRequests',
            value: '???',
            ranking: 0
          })
        }

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
            name: 'followers',
            value: 0,
            ranking: 0
          },
          {
            name: 'stars',
            value: 0,
            ranking: 0
          },
          {
            name: 'forks',
            value: 0,
            ranking: 0
          },
          {
            name: 'commits',
            value: 0,
            ranking: 0
          },
          {
            name: 'pullRequests',
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
      return this.userdata && this.userdata.repositoriesContributedTo ? this.userdata.repositoriesContributedTo.nodes : []
    },
    mostFamousRepository () {
      if (!this.userdata || !this.userdata.repositories.nodes) {
        return null
      }

      return this.userdata.repositories.nodes.reduce((mostFamousRepo, repo) => {
        const repoTotalCount = repo.stargazers.totalCount + repo.forkCount
        let currentRepo = repo
        currentRepo.totalCount = repoTotalCount
        if (!mostFamousRepo || repoTotalCount > mostFamousRepo.totalCount) {
          return currentRepo
        }
        return mostFamousRepo
      }, null)
    },
    overallRankingValue () {
      if (this.userdata && this.userdata.requestType === 'rest') {
        return '???'
      }
      return this.getOverallRankingValue(this.statisticsValues)
    },
    maxRanking () {
      return this.getMaxRanking(this.statisticsValues)
    }
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/functions";
@import "../variables";
@import "~bootstrap/scss/mixins";

.statistics {
  h3 {
    font-size: $h5-font-size;
    margin-bottom: 0;
  }
  p {
    margin-bottom: 5px;
  }
  p.value {
    font-size: $h1-font-size;
    margin-bottom: 0;
  }
}

@function get-rank-color($rank) {
  $step: 255 / 5;
  $red: 0;
  $green: 0;
  @if $rank <= 50 {
    $red: 255;
    $green: ($rank / 10 * $step);
  } @else {
    $red: 255 - ((($rank - 50) / 10) * $step);
    @if $red < 0 {
      $red: 0
    }
    $green: 255;
  }
  @return rgb($red, $green, 0);
}
$rank-list: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100;
@each $rank in $rank-list {
  .rank-#{$rank} {
    .progress-bar {
      background-color: get-rank-color($rank);
    }
  }
}
</style>
