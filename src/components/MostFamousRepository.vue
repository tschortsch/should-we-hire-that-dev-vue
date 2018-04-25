<template>
  <div v-if="repository" class="col-12">
    <h3>Most famous repository</h3>
    <p class="small text-muted">(repository with most stars and forks)</p>
    <h4 class="h2 mb-1">
      <a :href="repository.url">{{ repository.name }}</a>
    </h4>
    <ul class="list-inline">
      <li class="list-inline-item"><font-awesome-icon :icon="iconStar" /> {{ repository.stargazers.totalCount }}</li>
      <li class="list-inline-item"><font-awesome-icon :icon="iconCodeBranch" /> {{ repository.forkCount }}</li>
      <li class="list-inline-item"><font-awesome-icon :icon="iconCode" /> {{ repository.primaryLanguage.name }}</li>
    </ul>
    <p>{{ repository.description }}</p>
    <p></p>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faStar, faCodeBranch, faCode } from '@fortawesome/fontawesome-free-solid'

export default {
  name: 'MostFamousRepository',
  components: {
    FontAwesomeIcon
  },
  props: {
    repository: Object
  },
  computed: {
    iconStar () {
      return faStar
    },
    iconCodeBranch () {
      return faCodeBranch
    },
    iconCode () {
      return faCode
    }
  }
}
</script>

<style lang="scss">

</style>
