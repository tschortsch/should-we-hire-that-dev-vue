<template>
  <p>You're being redirected...</p>
</template>

<script>
export default {
  name: 'token',
  props: {
    token: {
      type: String,
      required: true
    }
  },
  created: function () {
    // save token to localstorage
    window.localStorage.setItem('swhtd-gh-access-token', this.token)
    // redirect to main route
    this.$router.push({ name: 'Main' })
  }
}
</script>
