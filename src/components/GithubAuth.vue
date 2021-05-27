<template>
  <button v-if="!isAuthorized" class="btn btn-primary btn-sm" @click.prevent="handleAuth">Authorize with GitHub <font-awesome-icon :icon="['fab', 'github']" /></button>
  <button v-else class="btn btn-link btn-sm logout-btn" @click.prevent="handleLogout">Logout from GitHub <font-awesome-icon :icon="['fas', 'sign-out-alt']" /></button>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GithubService from '../services/GithubService'

export default {
  name: 'github-auth',
  components: {
    FontAwesomeIcon
  },
  props: {
    isAuthorized: Boolean,
    username: String
  },
  methods: {
    handleAuth: function (e) {
      const clientId = process.env.GH_CLIENT_ID || ''
      if (clientId !== '') {
        let redirectUri = 'https://github.com/login/oauth/authorize?client_id=' + clientId
        if (this.username) {
          redirectUri += '&state=' + encodeURI(this.username)
        }
        window.location.href = redirectUri
      } else {
        console.log('GH_CLIENT_ID environment variable not set!')
      }
    },
    handleLogout: function (e) {
      GithubService.removeAccessTokenFromLocalStorage()
      window.location.reload()
    }
  }
}
</script>

<style lang="scss">
  // bootstrap overwrites
  .btn-primary {
    color: #fff;
  }
  .logout-btn {
    padding-right: 0;
  }
</style>
