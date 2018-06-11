<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import '~bootstrap/scss/functions';
@import 'variables';
@import 'bootstrap';

h1, .h1 {
  margin-bottom: $spacer * 1.5;
  font-weight: 400;
}
.last-margin-fix {
  > :last-child {
    margin-bottom: 0;
  }
}

::selection {
  background: $brand-light;
}
::-moz-selection {
  background: $brand-light;
}
</style>
