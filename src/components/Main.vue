<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-xl-8 col-lg-10 text-center">
        <form v-on:submit="submitUsernameForm">
          <input v-model="username" placeholder="that dev" :disabled="isLoading">
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'main',
  data () {
    return {
      username: '',
      isLoading: false
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      e.preventDefault()
      this.fetchUserInfo(this.username)
    },
    fetchUserInfo: function (username) {
      this.isLoading = true
      console.log('fetching ' + username)
    }
  }
}
</script>

<style scoped>

</style>
