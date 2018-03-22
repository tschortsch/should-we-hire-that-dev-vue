<template>
  <div class="col-md-6 mb-5" v-bind:class="rankingClass">
    <h3>{{ title }}</h3>
    <p class="value">
      {{ value }}
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
export default {
  name: 'statistics-box',
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
  @import "~bootstrap/scss/functions";
  @import "../variables";
  @import "~bootstrap/scss/mixins";

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
