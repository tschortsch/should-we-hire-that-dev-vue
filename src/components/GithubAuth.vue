<template>
  <div class="col-12 text-right">
    <button v-if="!accessToken" class="btn btn-primary btn-sm" v-on:click="handleAuth">Authorize with GitHub <font-awesome-icon :icon="iconGithub" /></button>
    <button v-else class="btn btn-link btn-sm" v-on:click="handleLogout">Logout from GitHub <font-awesome-icon :icon="iconSignOutAlt" /></button>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/fontawesome-free-brands'
import { faSignOutAlt } from '@fortawesome/fontawesome-free-solid'

export default {
  name: 'github-auth',
  components: {
    FontAwesomeIcon
  },
  props: ['accessToken'],
  methods: {
    handleAuth: function (e) {
      e.preventDefault()
      window.localStorage.setItem('swhtd-gh-access-token', 'blabla')
      window.location.reload()
      // TODO redirect to auth page
      // window.location.href = './github-auth.php'
    },
    handleLogout: function (e) {
      e.preventDefault()
      window.localStorage.removeItem('swhtd-gh-access-token')
      window.location.reload()
    }
  },
  computed: {
    iconGithub () {
      return faGithub
    },
    iconSignOutAlt () {
      return faSignOutAlt
    }
  }
}
</script>

<style lang="scss">
  // bootstrap overwrites
  .btn-primary {
    color: #fff;
  }
</style>
