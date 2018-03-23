<template>
  <div class="col-md-8 col-10 mb-5" v-bind:class="rankingClass">
    <h3>{{ title }}</h3>
    <p class="value"><ICountUp :startVal=0 :endVal="value" :duration=2.5 /> / {{ maxRanking }}</p>
    <div class="progress">
      <div class="progress-bar" role="progressbar" v-bind:style="{ width: rankingPercent }" v-bind:aria-valuenow="ranking"
      aria-valuemin="0" aria-valuemax="100"></div>
  </div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2'

export default {
  name: 'overall-ranking',
  components: {
    ICountUp
  },
  props: ['title', 'value', 'maxRanking'],
  computed: {
    ranking () {
      if (this.value && this.maxRanking) {
        return this.value * 100 / this.maxRanking
      }
      return 0
    },
    rankingClass () {
      return this.ranking > 0 ? 'rank-' + Math.round(this.ranking / 10) * 10 : ''
    },
    rankingPercent () {
      return this.ranking + '%'
    }
  }
}
</script>

<style>

</style>
