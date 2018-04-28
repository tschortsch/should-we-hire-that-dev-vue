<template>
  <ul v-if="(!isLoading && !userdata && !accessToken) || (userdata && !accessToken)" class="faq list-unstyled">
    <li v-if="!isLoading && !userdata">
      <h2 class="h5">What is this website for?</h2>
      <p>
        This website gathers public information of a given GitHub user and generates statistics about it.
        It also shows the most used programming languages.
      </p>
    </li>
    <li v-if="!accessToken">
      <h2 class="h5">Why do I need to authorize with my GitHub account?</h2>
      <p>
        Since <a href="https://developer.github.com/v3/rate_limit/">GitHub v3 REST API rate limit</a> is pretty low and the <a href="https://developer.github.com/v4/">GitHub v4 GraphQL API</a> doesn't allow to do queries without authorization you need to sign in with your GitHub account first.
      </p>
      <p>The Authorization only grants this website to <strong>request data which is already public</strong> anyway. So, no worries!</p>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Intro',
  props: {
    accessToken: String,
    userdata: Object,
    isLoading: Boolean
  }
}
</script>

<style lang="scss">
  @import '~bootstrap/scss/functions';
  @import '../variables';

  ul.faq {
    border-top: 1px solid $border-color;
    padding-top: $spacer;

    > li {
      border-bottom: 1px solid $border-color;
      padding-bottom: $spacer;
      margin-bottom: $spacer;

      :last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
