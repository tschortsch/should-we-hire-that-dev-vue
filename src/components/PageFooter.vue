<template>
  <footer>
    <p class="small text-muted"><font-awesome-icon :icon="iconCode" /> with <font-awesome-icon :icon="iconHeart" /> by <a href="https://juerghunziker.ch">Jürg Hunziker</a></p>
  </footer>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faHeart, faCode } from '@fortawesome/fontawesome-pro-regular'

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
    }
  }
}
</script>

<style lang="scss">

</style>
