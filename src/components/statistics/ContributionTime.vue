<template>
  <div class="col-12 mb-5" v-bind:class="{ 'text-muted': commits === null }">
    <h3>Contributions time</h3>
    <p class="small text-muted">(calculated from the last 100 commits)</p>
    <template v-if="commits">
      <ul class="list-inline">
        <li class="list-inline-item"><font-awesome-icon :icon="iconClock" /> {{ contributionTimeSentence }}</li>
        <li class="list-inline-item"><font-awesome-icon :icon="iconCalendarAlt" /> {{ contributionDaySentence }}</li>
      </ul>
      <h4 class="h2">{{ daytimeSentence }}</h4>
      <h5>Hours</h5>
      <line-chart v-if="contributionTimesChartData" :chartData="contributionTimesChartData" :options="chartOptions" :width="100" :height="33" />
      <h5>Days of week</h5>
      <line-chart v-if="contributionDaysChartData" :chartData="contributionDaysChartData" :options="chartOptions" :width="100" :height="33" />
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

export default {
  name: 'ContributionTime',
  components: {
    LineChart,
    FontAwesomeIcon
  },
  props: {
    commits: Object,
    userlogin: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      chartOptions: {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: 0
            }
          }]
        }
      }
    }
  },
  created: function () {
    this.getDaytimeSentence = (time, username) => {
      const daytimes = [
        [20, `${username} seems to like to do night shifts`],
        [17, `${username} likes to work in the evening`],
        [8, `${username} works mostly during daytime`],
        [6, `${username} is a real early bird`],
        [0, `${username} seems to like to do night shifts`]
      ]
      for (let [startTime, sentence] of daytimes) {
        if (time >= startTime) {
          return sentence
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
        return this.commits.items.reduce((commitTimes, commit) => {
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
        return this.commits.items.reduce((commitDays, commit) => {
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
      if (this.contributionTime) {
        return 'around ' + (this.contributionTime === 0 ? 'midnight' : `${this.contributionTime}:00`)
      }
      return ''
    },
    contributionDaySentence () {
      return this.contributionDay ? `works mostly on a ${this.contributionDay}` : ''
    },
    daytimeSentence () {
      if (this.contributionTime) {
        return this.getDaytimeSentence(this.contributionTime, this.userlogin)
      }
      return ''
    },
    iconClock () {
      return faClock
    },
    iconCalendarAlt () {
      return faCalendarAlt
    }
  }
}
</script>
