<template>
  <p>You're being redirected...</p>
</template>

<script>
import GithubService from '../services/GithubService'

export default {
  name: 'token',
  props: {
    token: {
      type: String,
      required: true
    },
    state: String
  },
  created: function () {
    // save token to localstorage
    GithubService.setAccessToken(this.token)
    // redirect to main route
    if (this.state) {
      this.$router.push({ name: 'Main', params: { username: decodeURI(this.state) } })
    } else {
      this.$router.push({ name: 'Main' })
    }
  }
}
</script>
