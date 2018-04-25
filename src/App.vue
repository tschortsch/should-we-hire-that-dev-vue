<template>
  <div id="app">
    <sitelinks-searchbox />
    <router-view/>
  </div>
</template>

<script>
import SitelinksSearchbox from './components/structured-data/SitelinksSearchbox'
export default {
  name: 'App',
  components: {
    SitelinksSearchbox
  }
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
</style>
