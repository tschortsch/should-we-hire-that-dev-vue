<template>
  <div class="col-md-8 col-10" v-bind:class="[{ 'text-muted': disabled }, rankingClass]">
    <h3>{{ title }}</h3>
    <p class="value">
      <template v-if="typeof value === 'number'">
        <ICountUp :startVal=0 :endVal="value" :duration=2.5 /> / {{ maxRanking }}
      </template>
      <template v-else>
        {{ value }} / {{ maxRanking }}
      </template>
    </p>
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
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    maxRanking: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean
    }
  },
  computed: {
    ranking () {
      if (typeof this.value === 'number' && this.maxRanking > 0) {
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
