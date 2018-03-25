<template>
  <p>You're being redirected...</p>
</template>

<script>
export default {
  name: 'token',
  props: ['token'],
  created: function () {
    window.localStorage.setItem('swhtd-gh-access-token', this.token)
    this.$router.push({ name: 'Main' })
  }
}
</script>
