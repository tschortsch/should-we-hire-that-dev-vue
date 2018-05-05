<template>
  <div class="col-12 statistics-container" v-bind:class="{ 'text-muted': commits === null }">
    <h3>Most productive</h3>
    <p class="small text-muted">(calculated from the last {{ commitsCount }} commits)</p>
    <template v-if="commits">
      <div class="daytime">
        <div class="icon">
          <font-awesome-icon :icon="daytimeIcon" />
        </div>
        <h4 class="h2 sentence">{{ daytimeSentence }}</h4>
      </div>
      <ul class="list-inline">
        <li class="list-inline-item"><font-awesome-icon :icon="iconClock" /> {{ contributionTimeSentence }}</li>
        <li class="list-inline-item"><font-awesome-icon :icon="iconCalendarAlt" /> {{ contributionDaySentence }}</li>
      </ul>
      <h5>Time of the day</h5>
      <line-chart v-if="contributionTimesChartData" class="contribution-chart" :chartData="contributionTimesChartData" :options="chartOptions" />
      <h5>Days of the week</h5>
      <line-chart v-if="contributionDaysChartData" class="contribution-chart" :chartData="contributionDaysChartData" :options="chartOptions" />
    </template>
    <template v-else>
      <h4 class="h2">???</h4>
    </template>
  </div>
</template>

<script>
import LineChart from './LineChart'
import moment from 'moment'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faClock from '@fortawesome/fontawesome-pro-regular/faClock'
import faCalendarAlt from '@fortawesome/fontawesome-pro-regular/faCalendarAlt'
import faMoon from '@fortawesome/fontawesome-pro-regular/faMoon'
import faSun from '@fortawesome/fontawesome-pro-regular/faSun'
import faCoffee from '@fortawesome/fontawesome-pro-regular/faCoffee'
import faCouch from '@fortawesome/fontawesome-pro-regular/faCouch'

export default {
  name: 'ContributionTime',
  components: {
    LineChart,
    FontAwesomeIcon
  },
  props: {
    commits: Array,
    userlogin: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: 0
            }
          }]
        },
        animation: {
          duration: 2000
        }
      }
    }
  },
  created: function () {
    this.getDaytimeSentence = (time, username) => {
      const daytimes = [
        [21, `${username} seems to love night shifts`],
        [18, `${username} likes to work in the evening`],
        [8, `${username} works mostly during daytime`],
        [6, `${username} is a real early bird`],
        [0, `${username} seems to love night shifts`]
      ]
      for (let [startTime, sentence] of daytimes) {
        if (time >= startTime) {
          return sentence
        }
      }
    }
    this.getDaytimeIcon = (time) => {
      const daytimes = [
        [21, this.iconMoon],
        [18, this.iconCouch],
        [8, this.iconSun],
        [6, this.iconCoffee],
        [0, this.iconMoon]
      ]
      for (let [startTime, icon] of daytimes) {
        if (time >= startTime) {
          return icon
        }
      }
    }
  },
  computed: {
    contributionTimesChartData () {
      if (this.contributionTimes) {
        return {
          labels: [...this.contributionTimes.keys()].map(hour => `${hour}:00`),
          datasets: [
            {
              label: 'Commits',
              data: [...this.contributionTimes.values()],
              borderWidth: 1,
              borderColor: '#fe9b40',
              backgroundColor: '#fedfb9',
              pointBorderColor: '#fe9b40',
              pointBackgroundColor: '#fedfb9'
            }
          ]
        }
      }
      return null
    },
    contributionTimes () {
      if (this.commits) {
        let emptyHoursMap = new Map()
        for (let i = 0; i < 24; i++) {
          emptyHoursMap.set(i, 0)
        }
        return this.commits.reduce((commitTimes, commit) => {
          const commitMoment = moment(commit.commit.author.date)
          const hour = parseInt(commitMoment.format('H'))
          const currentHourValue = commitTimes.get(hour) ? commitTimes.get(hour) : 0
          commitTimes.set(hour, currentHourValue + 1)
          return commitTimes
        }, emptyHoursMap)
      }
      return null
    },
    contributionTime () {
      if (this.contributionTimes) {
        const highestContributionTime = Array.from(this.contributionTimes).reduce((highestTime, time) => {
          if (time[1] > highestTime[1]) {
            return time
          }
          return highestTime
        }, [ 0, 0 ])
        return highestContributionTime[0]
      }
      return null
    },
    contributionDaysChartData () {
      if (this.contributionDays) {
        return {
          labels: [...this.contributionDays.keys()],
          datasets: [
            {
              label: 'Commits',
              data: [...this.contributionDays.values()],
              borderWidth: 1,
              borderColor: '#03a7ff',
              backgroundColor: '#a8d9ff',
              pointBorderColor: '#03a7ff',
              pointBackgroundColor: '#a8d9ff'
            }
          ]
        }
      }
      return null
    },
    contributionDays () {
      if (this.commits) {
        let emptyDaysMap = new Map([
          ['Monday', 0],
          ['Tuesday', 0],
          ['Wednesday', 0],
          ['Thursday', 0],
          ['Friday', 0],
          ['Saturday', 0],
          ['Sunday', 0]
        ])
        return this.commits.reduce((commitDays, commit) => {
          const commitMoment = moment(commit.commit.author.date)
          const dayOfWeek = commitMoment.format('dddd')
          const currentDayOfWeekValue = commitDays.get(dayOfWeek) ? commitDays.get(dayOfWeek) : 0
          commitDays.set(dayOfWeek, currentDayOfWeekValue + 1)
          return commitDays
        }, emptyDaysMap)
      }
      return null
    },
    contributionDay () {
      if (this.contributionDays) {
        const highestContributionDay = Array.from(this.contributionDays).reduce((highestDay, day) => {
          if (day[1] > highestDay[1]) {
            return day
          }
          return highestDay
        }, [ 0, 0 ])
        return highestContributionDay[0]
      }
      return null
    },
    contributionTimeSentence () {
      if (this.contributionTime !== null) {
        return 'around ' + (this.contributionTime === 0 ? 'midnight' : `${this.contributionTime}:00`)
      }
      return ''
    },
    contributionDaySentence () {
      return this.contributionDay ? `on ${this.contributionDay}` : ''
    },
    daytimeSentence () {
      if (this.contributionTime !== null) {
        return this.getDaytimeSentence(this.contributionTime, this.userlogin)
      }
      return ''
    },
    daytimeIcon () {
      if (this.contributionTime !== null) {
        return this.getDaytimeIcon(this.contributionTime)
      }
      return ''
    },
    commitsCount () {
      return this.commits ? this.commits.length : 0
    },
    iconClock () {
      return faClock
    },
    iconCalendarAlt () {
      return faCalendarAlt
    },
    iconMoon () {
      return faMoon
    },
    iconSun () {
      return faSun
    },
    iconCoffee () {
      return faCoffee
    },
    iconCouch () {
      return faCouch
    }
  }
}
</script>

<style lang="scss">
  @import "~bootstrap/scss/functions";
  @import "../../variables";
  @import "~bootstrap/scss/mixins";

  .contribution-chart {
    height: 300px;
  }
  .icon {
    font-size: 100px;
    color: $gray-200;
    line-height: 1.2;
  }
</style>
