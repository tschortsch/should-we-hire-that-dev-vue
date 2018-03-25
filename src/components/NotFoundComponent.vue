<template>
  <div class="container my-5 text-center">
    <h1 class="text-center">Should we hire that dev?</h1>
    <p class="lead">You seem lost. <router-link :to="{ name: 'Main' }">Please start again!</router-link></p>
  </div>
</template>

<script>
export default {
  name: 'not-found-component'
}
</script>

<style scoped>

</style>
