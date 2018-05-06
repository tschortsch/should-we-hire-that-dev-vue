<template>
  <footer>
    <p class="small text-muted">
      <font-awesome-icon :icon="iconCode" /> with <font-awesome-icon :icon="iconHeart" /> by <a href="https://juerghunziker.ch">Jürg Hunziker</a>
      |
      <font-awesome-icon :icon="iconGithub" /> <a href="https://github.com/tschortsch/should-we-hire-that-dev-vue">GitHub Repo</a>
    </p>
  </footer>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faHeart from '@fortawesome/fontawesome-pro-regular/faHeart'
import faCode from '@fortawesome/fontawesome-pro-regular/faCode'
import faGithub from '@fortawesome/fontawesome-free-brands/faGithub'

export default {
  name: 'PageFooter',
  components: {
    FontAwesomeIcon
  },
  computed: {
    iconCode () {
      return faCode
    },
    iconHeart () {
      return faHeart
    },
    iconGithub () {
      return faGithub
    }
  }
}
</script>
