<template>
  <div id="avatar-container" class="mb-4">
    <div id="loading-container" v-bind:class="{ loading: isLoading }"></div>
    <template v-if="userdata && !isLoading">
      <div id="avatar-wrapper">
        <img :src="userdata.avatarUrl" :alt="name" />
      </div>
      <h2><a :href="userdata.url">{{ name }}</a></h2>
      <p v-if="userdata.location" class="text-muted"><font-awesome-icon :icon="iconMapMarkerAlt" /> {{ userdata.location }}</p>
      <p v-if="userdata.bio">{{ userdata.bio }}</p>
      <organizations :organizations="userdata.organizations.edges" />
    </template>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faMapMarkerAlt } from '@fortawesome/fontawesome-free-solid'
import Organizations from './Organizations'

export default {
  name: 'user-info',
  props: {
    isLoading: Boolean,
    userdata: Object
  },
  components: {
    Organizations,
    FontAwesomeIcon
  },
  computed: {
    iconMapMarkerAlt () {
      return faMapMarkerAlt
    },
    name () {
      return this.userdata && this.userdata.name ? this.userdata.name : this.userdata.login
    }
  }
}
</script>

<style lang="scss">
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  $avatar-size: 150px;
  $avatar-border-size: 5px;

  #avatar-container {
    position: relative;
  }

  #avatar-wrapper {
    position: absolute;
    top: $avatar-border-size;
    width: 100%;

    img {
      width: $avatar-size;
      height: $avatar-size;
      border-radius: 50%;
    }
  }

  #loading-container {
    display: inline-block;
    width: $avatar-size + 2 * $avatar-border-size;
    height: $avatar-size + 2 * $avatar-border-size;
    border-radius: 50%;
    border: $avatar-border-size solid transparent;

    &.loading {
      border: $avatar-border-size solid rgba(105, 105, 105, 0.2);
      border-top-color: #a7a7a7;
      animation: spin 1s infinite linear;
    }
  }
</style>
