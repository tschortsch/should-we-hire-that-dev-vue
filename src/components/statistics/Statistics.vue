<template>
  <div class="statistics">
    <div class="row justify-content-center statistics-container">
      <statistics-box
        v-for="statisticsValue in statisticsValues"
        :key="statisticsValue.name"
        :title="getStatisticsTitles(statisticsValue.name)"
        :value="statisticsValue.value"
        :additional-value="statisticsValue.additionalValue"
        :ranking="statisticsValue.ranking"
        :disabled="statisticsValue.disabled || false"
      />
      <overall-ranking
        title="Overall ranking"
        :value="overallRankingValue"
        :maxRanking="maxRanking"
        :disabled="overallRankingValue === '???'"
      />
    </div>
    <div class="row justify-content-center">
      <language-statistics :repositoriesContributedTo="repositoriesContributedTo" />
    </div>
    <div class="row justify-content-center">
      <contribution-time :commits="commits" :userlogin="userlogin" />
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
import ContributionTime from './ContributionTime'

export default {
  components: {
    ContributionTime,
    MostFamousRepository,
    LanguageStatistics,
    OverallRanking,
    StatisticsBox
  },
  name: 'statistics',
  props: {
    userdata: Object,
    commits: Array,
    commitsTotalCount: Number
  },
  created: function () {
    this.statisticsTitles = {
      createdAt: 'User since',
      stars: 'Stars',
      forks: 'Forks of own repos',
      followers: 'Followers',
      commits: 'Total commits',
      commitMessageWordCount: 'Commit message quality',
      repos: 'Public repos',
      pullRequests: 'Pull requests'
    }

    this.commitsLimits = [
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
    ]

    this.commitMessageWordCountLimits = [
      [100, 6],
      [90, 5.5],
      [80, 5],
      [70, 4.5],
      [60, 4],
      [50, 3],
      [40, 4],
      [30, 2.5],
      [20, 2],
      [10, 1.5]
    ]

    this.followersLimits = [
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
    ]

    this.reposLimits = [
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
    ]

    this.starsLimits = [
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
    ]

    this.forksLimits = [
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
    ]

    this.createdAtLimits = [
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
    ]

    this.pullRequestsLimits = [
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
    ]

    this.getStatisticsTitles = (name) => {
      return this.statisticsTitles[name]
    }

    this.getOverallRankingValue = (statisticsValues) => {
      if (this.userdata && this.commitsTotalCount !== null && this.commits) {
        return statisticsValues.reduce((rankingAccumulator, statisticsValue) => {
          return rankingAccumulator + statisticsValue.ranking
        }, 0)
      }
      return 0
    }

    this.getMaxRanking = (statisticsValues) => {
      return 100 * statisticsValues.length
    }

    this.getRanking = (value, limits) => {
      for (let [rank, limit] of limits) {
        if (value >= limit) {
          return rank
        }
      }
      return 0
    }
  },
  computed: {
    statisticsValues () {
      return [
        this.createdAtStatisticsValues,
        this.followerStatisticsValues,
        this.starsStatisticsValues,
        this.forksStatisticsValues,
        this.commitsStatisticsValues,
        this.commitMessageWorkCountStatisticsValues,
        this.pullRequestsStatisticsValues,
        this.repoStatisticsValues
      ]
    },
    createdAtStatisticsValues () {
      if (this.userdata) {
        const createdAt = new Date(this.userdata.createdAt)
        const createdAtMoment = moment(createdAt)
        const createdAtTimestamp = createdAtMoment.unix()
        const currentTimestamp = moment().unix()
        return {
          name: 'createdAt',
          value: createdAtMoment.fromNow(),
          additionalValue: createdAtMoment.format('(DD.MM.YYYY)'),
          ranking: this.getRanking(currentTimestamp - createdAtTimestamp, this.createdAtLimits)
        }
      } else {
        return {
          name: 'createdAt',
          value: '-',
          ranking: 0
        }
      }
    },
    followerStatisticsValues () {
      if (this.userdata) {
        const followersValue = this.userdata.followers.totalCount
        return {
          name: 'followers',
          value: followersValue,
          ranking: this.getRanking(followersValue, this.followersLimits)
        }
      } else {
        return {
          name: 'followers',
          value: 0,
          ranking: 0
        }
      }
    },
    starsStatisticsValues () {
      if (this.userdata) {
        if (this.userdata.repositories.nodes) {
          const starsCount = this.userdata.repositories.nodes.reduce((starsCount, repo) => {
            return starsCount + repo.stargazers.totalCount
          }, 0)
          return {
            name: 'stars',
            value: starsCount,
            ranking: this.getRanking(starsCount, this.starsLimits)
          }
        } else {
          return {
            name: 'stars',
            value: '???',
            ranking: 0,
            disabled: true
          }
        }
      } else {
        return {
          name: 'stars',
          value: 0,
          ranking: 0
        }
      }
    },
    forksStatisticsValues () {
      if (this.userdata) {
        if (this.userdata.repositories.nodes) {
          const forksCount = this.userdata.repositories.nodes.reduce((forksCount, repo) => {
            return forksCount + repo.forkCount
          }, 0)
          return {
            name: 'forks',
            value: forksCount,
            ranking: this.getRanking(forksCount, this.forksLimits)
          }
        } else {
          return {
            name: 'forks',
            value: '???',
            ranking: 0,
            disabled: true
          }
        }
      } else {
        return {
          name: 'forks',
          value: 0,
          ranking: 0
        }
      }
    },
    commitsStatisticsValues () {
      if (this.commitsTotalCount) {
        const commitsValue = this.commitsTotalCount
        return {
          name: 'commits',
          value: commitsValue,
          ranking: this.getRanking(commitsValue, this.commitsLimits)
        }
      } else {
        return {
          name: 'commits',
          value: 0,
          ranking: 0
        }
      }
    },
    commitMessageWorkCountStatisticsValues () {
      if (this.commits) {
        const commitMessageTotalWordCount = this.commits.reduce((totalWords, commit) => {
          const commitMessage = commit.commit.message
          return totalWords + commitMessage.split(/\s+/).length
        }, 0)
        let commitMessageWordCountValue = 0
        if (this.commits.length > 0) {
          commitMessageWordCountValue = (commitMessageTotalWordCount / this.commits.length).toFixed(1)
        }
        return {
          name: 'commitMessageWordCount',
          value: commitMessageWordCountValue,
          additionalValue: '(average word count)',
          ranking: this.getRanking(commitMessageWordCountValue, this.commitMessageWordCountLimits)
        }
      } else {
        return {
          name: 'commitMessageWordCount',
          value: 0,
          ranking: 0
        }
      }
    },
    pullRequestsStatisticsValues () {
      if (this.userdata) {
        if (this.userdata.pullRequests) {
          const pullRequestsValue = this.userdata.pullRequests.totalCount
          return {
            name: 'pullRequests',
            value: pullRequestsValue,
            ranking: this.getRanking(pullRequestsValue, this.pullRequestsLimits)
          }
        } else {
          return {
            name: 'pullRequests',
            value: '???',
            ranking: 0,
            disabled: true
          }
        }
      } else {
        return {
          name: 'pullRequests',
          value: 0,
          ranking: 0
        }
      }
    },
    repoStatisticsValues () {
      if (this.userdata) {
        const reposValue = this.userdata.repositories.totalCount
        return {
          name: 'repos',
          value: reposValue,
          ranking: this.getRanking(reposValue, this.reposLimits)
        }
      } else {
        return {
          name: 'repos',
          value: 0,
          ranking: 0
        }
      }
    },
    userlogin () {
      return this.userdata ? this.userdata.login : ''
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
@import "../../variables";
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

.statistics-container {
  padding-bottom: $spacer * 2;
  margin-bottom: $spacer * 2;
  border-bottom: 1px solid $border-color;
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
