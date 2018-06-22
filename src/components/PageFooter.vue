<template>
  <footer>
    <p class="small text-muted">
      <font-awesome-icon :icon="['far', 'code']" /> with <font-awesome-icon :icon="['far', 'heart']" /> by <a href="https://juerghunziker.ch">Jürg Hunziker</a>
      |
      <font-awesome-icon :icon="['fab', 'github']" /> <a href="https://github.com/tschortsch/should-we-hire-that-dev-vue">GitHub Repo</a>
    </p>
  </footer>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'PageFooter',
  components: {
    FontAwesomeIcon
  }
}
</script>
