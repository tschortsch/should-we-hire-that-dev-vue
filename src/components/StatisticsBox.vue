<template>
  <div class="col-md-6 mb-5" v-bind:class="rankingClass">
    <h3>{{ title }}</h3>
    <p class="value">
      <template v-if="Number.isInteger(value)">
        <ICountUp :startVal=0 :endVal="value" :duration=2.5 />
      </template>
      <template v-else>
        {{ value }}
      </template>
    </p>
    <p v-if="additionalValue !== ''">{{ additionalValue }}</p>
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
  props: [
    'title',
    'value',
    'additionalValue',
    'ranking'
  ],
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

<style lang="scss" scoped>

</style>
