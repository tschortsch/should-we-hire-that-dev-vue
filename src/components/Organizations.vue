<template>
  <ul v-if="organizations.length > 0" id="organizations" class="list-inline">
    <li v-for="organization in organizations" v-bind:key="organization.node.id" class="list-inline-item">
      <a :href="organization.node.url"><img :src="organization.node.avatarUrl" :alt="organization.node.name" /></a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'organizations',
  props: {
    organizations: Array,
    required: true
  }
}
</script>

<style lang="scss">
  #organizations img {
    width: 35px;
    height: 35px;
    border-radius: 3px;
    margin-bottom: 5px;
  }
</style>
