<template>
  <button v-if="!accessToken" class="btn btn-primary btn-sm" @click.prevent="handleAuth">Authorize with GitHub <font-awesome-icon :icon="iconGithub" /></button>
  <button v-else class="btn btn-link btn-sm logout-btn" @click.prevent="handleLogout">Logout from GitHub <font-awesome-icon :icon="iconSignOut" /></button>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import faGithub from '@fortawesome/fontawesome-free-brands/faGithub'
import faSignOut from '@fortawesome/fontawesome-pro-regular/faSignOut'

export default {
  name: 'github-auth',
  components: {
    FontAwesomeIcon
  },
  props: {
    accessToken: String,
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
      window.localStorage.removeItem('swhtd-gh-access-token')
      window.location.reload()
    }
  },
  computed: {
    iconGithub () {
      return faGithub
    },
    iconSignOut () {
      return faSignOut
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
