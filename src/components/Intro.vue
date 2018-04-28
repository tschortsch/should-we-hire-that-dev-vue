<template>
  <ul class="faq list-unstyled">
    <li>
      <h2 class="h5">What is this website for?</h2>
      <p>
        This website gathers public information of a given GitHub user and generates statistics about it.
        It also shows the most used programming languages.
      </p>
    </li>
    <li>
      <h2 class="h5">Why do I need to authorize with my GitHub account?</h2>
      <p>
        Since GitHub doesn't allow to do <a href="https://developer.github.com/v4/">GraphQL queries</a> without authorization you need to sign in with your GitHub account first.
        The Authorization only grants this website to request data which is already public anyway. So, no worries!
      </p>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Intro'
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
