<template>
  <ul v-if="organizations.length > 0" class="list-inline">
    <li v-for="organization in organizations" v-bind:key="organization.id" class="list-inline-item">
      <a :href="organization.url"><img class="organization-avatar" :src="organization.avatar_url" :alt="organization.login" :title="organization.login" /></a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'organizations',
  props: {
    organizations: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss">
  .organization-avatar {
    width: 35px;
    height: 35px;
    border-radius: 3px;
    margin-bottom: 5px;
  }
</style>
