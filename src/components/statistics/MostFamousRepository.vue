<template>
  <div class="col-12 statistics-container last-margin-fix" v-bind:class="{ 'text-muted': repository === null }">
    <h3>Most famous repository</h3>
    <p class="small text-muted">(repository with most stars and forks)</p>
    <template v-if="repository">
      <h4 class="h2 mb-1">
        <a :href="repository.url">{{ repository.name }}</a>
      </h4>
      <ul class="list-inline">
        <li class="list-inline-item"><font-awesome-icon :icon="['far', 'star']" /> {{ repository.stargazers.totalCount }}</li>
        <li class="list-inline-item"><font-awesome-icon :icon="['fas', 'code-branch']" /> {{ repository.forkCount }}</li>
        <li v-if="repository.primaryLanguage" class="list-inline-item"><font-awesome-icon :icon="['far', 'code']" /> {{ repository.primaryLanguage.name }}</li>
      </ul>
      <p>{{ repository.description }}</p>
    </template>
    <template v-else>
      <h4 class="h2 mb-1">???</h4>
    </template>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default {
  name: 'MostFamousRepository',
  components: {
    FontAwesomeIcon
  },
  props: {
    repository: Object
  }
}
</script>
