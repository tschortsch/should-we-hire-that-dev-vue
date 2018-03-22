<template>
  <div id="avatar-container" class="mb-4">
    <div id="loading-container" v-bind:class="{ loading: isLoading }"></div>
    <template v-if="userdata && !isLoading">
      <div id="avatar-wrapper">
        <img :src="userdata.avatarUrl" :alt="userdata.name" />
      </div>
      <h2><a :href="userdata.url" id="url">{{ userdata.name }}</a></h2>
      <p class="text-muted"><font-awesome-icon :icon="iconMapMarkerAlt" /> {{ userdata.location }}</p>
      <p>{{ userdata.bio }}</p>
    </template>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faMapMarkerAlt } from '@fortawesome/fontawesome-free-solid'

export default {
  name: 'user-info',
  props: {
    isLoading: {
      type: Boolean
    },
    userdata: {
      type: Object
    }
  },
  components: {
    FontAwesomeIcon
  },
  computed: {
    iconMapMarkerAlt () {
      return faMapMarkerAlt
    }
  }
}
</script>

<style lang="scss" scoped>
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
    left: 50%;
    transform: translateX(-50%);

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
