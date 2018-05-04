<template>
  <div class="col-12 mb-5" v-bind:class="{ 'text-muted': commits === null }">
    <h3>Contributions time</h3>
    <p class="small text-muted">(calculated from the last 100 commits)</p>
    <template v-if="commits">
      <h4 class="h2 mb-1">{{ contributionTime }}</h4>
    </template>
    <template v-else>
      <h4 class="h2 mb-1">???</h4>
    </template>
  </div>
</template>

<script>
import moment from 'moment'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faStar from '@fortawesome/fontawesome-pro-regular/faStar'

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
        console.log(startTime)
        console.log(time)

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
          const currentHourValue = commitTimes[0].get(hour) ? commitTimes[0].get(hour) : 0
          commitTimes[0].set(hour, currentHourValue + 1)
          const dayOfWeek = parseInt(commitMoment.format('d'))
          const currentDayOfWeekValue = commitTimes[1].get(dayOfWeek) ? commitTimes[1].get(dayOfWeek) : 0
          commitTimes[1].set(dayOfWeek, currentDayOfWeekValue + 1)
          return commitTimes
        }, [new Map(), new Map()])
        const highestContributionTime = Array.from(condensedContributionTimes[0]).reduce((highestTime, time) => {
          if (time[1] > highestTime[1]) {
            return time
          }
          return highestTime
        }, [ 0, 0 ])
        console.log('Time with most contributions', highestContributionTime[0])
        const highestContributionDayOfWeek = Array.from(condensedContributionTimes[1]).reduce((highestDayOfWeek, dayOfWeek) => {
          if (dayOfWeek[1] > highestDayOfWeek[1]) {
            return dayOfWeek
          }
          return highestDayOfWeek
        }, [ 0, 0 ])
        console.log('Day of week with most contributions', highestContributionDayOfWeek[0])
        return this.getDaytimeSentence(highestContributionTime[0], this.userlogin)
      }
      return null
    },
    iconStar () {
      return faStar
    }
  }
}
</script>
