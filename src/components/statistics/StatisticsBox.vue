<template>
  <div class="col-md-6 mb-5" v-bind:class="[{ 'text-muted': disabled }, rankingClass]">
    <h3>{{ title }}</h3>
    <p class="value">
      <template v-if="typeof value === 'number'">
        <ICountUp :startVal=0 :endVal="value" :duration=2.5 />
      </template>
      <template v-else>
        {{ value }}
      </template>
    </p>
    <p class="additional-value" v-if="additionalValue">{{ additionalValue }}</p>
    <div class="row justify-content-center">
      <div class="col-6">
        <div class="progress">
          <div class="progress-bar" role="progressbar" v-bind:style="{ width: rankingPercent }" v-bind:aria-valuenow="ranking" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ICountUp from 'vue-countup-v2'

export default {
  name: 'statistics-box',
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
    additionalValue: {
      type: String
    },
    ranking: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    rankingClass () {
      return this.ranking > 0 ? 'rank-' + this.ranking : ''
    },
    rankingPercent () {
      return this.ranking + '%'
    }
  }
}
</script>
