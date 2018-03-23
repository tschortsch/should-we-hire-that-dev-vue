<template>
  <div class="col-xl-8 col-lg-10">
    <form v-if="accessToken" class="form-inline mb-3" v-on:submit="submitUsernameForm">
      <div class="form-group">
        <div class="question">
          <div class="label flex-item">Should we hire</div>
          <div class="flex-item">
            <div class="username-input-wrapper">
              <label for="username" class="sr-only">Please enter GitHub username:</label>
              <input type="search" name="username" id="username" class="form-control"
                     v-model="username"
                     placeholder="that dev"
                     :disabled="isLoading"
              />
              <div class="questionmark">?</div>
            </div>
            <p class="form-text text-muted">Enter GitHub <font-awesome-icon :icon="iconGithub" /> username</p>
          </div>
        </div>
      </div>
    </form>
    <h1 v-else class="text-center">Should we hire that dev?</h1>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/fontawesome-free-brands'

export default {
  name: 'github-username-input',
  components: {
    FontAwesomeIcon
  },
  props: ['accessToken', 'isLoading'],
  data () {
    return {
      username: this.$route.params.username
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.params.username) {
        this.username = to.params.username
      } else {
        this.username = ''
      }
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      e.preventDefault()
      if (this.username === '') {
        this.$router.push({ name: 'Main' })
      } else {
        this.$router.push({ name: 'Main', params: { username: this.username } })
      }
    }
  },
  computed: {
    iconGithub () {
      return faGithub
    }
  }
}
</script>

<style scoped>

</style>
