<template>

</template>

<script>
export default {
  name: 'token',
  created: function () {
    window.localStorage.setItem('swhtd-gh-access-token', this.$route.params.token)
    this.$router.push({ name: 'Main' })
  }
}
</script>

<style scoped>

</style>
