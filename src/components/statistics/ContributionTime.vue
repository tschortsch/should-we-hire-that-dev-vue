<template>
  <div class="col-12 mb-5" v-bind:class="{ 'text-muted': commits === null }">
    <h3>Contributions time</h3>
    <p class="small text-muted">(calculated from the last 100 commits)</p>
    <template v-if="commits">
      <ul class="list-inline">
        <li class="list-inline-item"><font-awesome-icon :icon="iconClock" /> {{ contributionTimeSentence }}</li>
        <li class="list-inline-item"><font-awesome-icon :icon="iconCalendarAlt" /> {{ contributionDaySentence }}</li>
      </ul>
      <h4 class="h2 mb-1">{{ daytimeSentence }}</h4>
    </template>
    <template v-else>
      <h4 class="h2 mb-1">???</h4>
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faClock from '@fortawesome/fontawesome-pro-regular/faClock'
import faCalendarAlt from '@fortawesome/fontawesome-pro-regular/faCalendarAlt'

export default {
  name: 'ContributionTime',
  components: {
    FontAwesomeIcon
  },
  props: {
    commits: Object,
    userlogin: {
      type: String,
      required: true
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
    contributionTime () {
      if (this.commits) {
        const condensedContributionTimes = this.commits.items.reduce((commitTimes, commit) => {
          const commitMoment = moment(commit.commit.author.date)
          const hour = parseInt(commitMoment.format('H'))
          const currentHourValue = commitTimes.get(hour) ? commitTimes.get(hour) : 0
          commitTimes.set(hour, currentHourValue + 1)
          return commitTimes
        }, new Map())
        const highestContributionTime = Array.from(condensedContributionTimes).reduce((highestTime, time) => {
          if (time[1] > highestTime[1]) {
            return time
          }
          return highestTime
        }, [ 0, 0 ])
        return highestContributionTime[0]
      }
      return null
    },
    contributionDay () {
      if (this.commits) {
        const condensedContributionDays = this.commits.items.reduce((commitDays, commit) => {
          const commitMoment = moment(commit.commit.author.date)
          const dayOfWeek = commitMoment.format('dddd')
          const currentDayOfWeekValue = commitDays.get(dayOfWeek) ? commitDays.get(dayOfWeek) : 0
          commitDays.set(dayOfWeek, currentDayOfWeekValue + 1)
          return commitDays
        }, new Map())
        const highestContributionDay = Array.from(condensedContributionDays).reduce((highestDay, day) => {
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
