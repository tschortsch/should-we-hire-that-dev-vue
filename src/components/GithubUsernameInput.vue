<template>
  <form class="mb-3" v-on:submit="submitUsernameForm">
    <div class="question d-md-flex">
      <div class="label flex-item">Should we hire</div>
      <div class="flex-item">
        <div class="username-input-wrapper d-flex align-items-baseline">
          <label for="username" class="sr-only">Please enter GitHub username:</label>
          <input type="search" name="username" id="username" class="form-control"
                 v-model="usernameInputValue"
                 :placeholder="placeholder"
                 :disabled="isLoading"
                 v-on:focus="handleUsernameFocus"
                 v-on:blur="handleUsernameBlur"
          />
          <div class="questionmark">?</div>
        </div>
        <p class="form-text text-muted">Enter GitHub <font-awesome-icon :icon="iconGithub" /> username</p>
      </div>
    </div>
  </form>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/fontawesome-free-brands'

export default {
  name: 'github-username-input',
  components: {
    FontAwesomeIcon
  },
  props: {
    username: String,
    isLoading: Boolean
  },
  data () {
    return {
      placeholder: 'that dev',
      placeholderTimeout: null,
      usernameInputValue: this.username
    }
  },
  watch: {
    username: function (newUsername, oldUsername) {
      if (newUsername) {
        this.usernameInputValue = newUsername
      } else {
        this.usernameInputValue = ''
      }
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      e.preventDefault()
      if (this.usernameInputValue === '') {
        this.$router.push({ name: 'Main' })
      } else {
        this.$router.push({ name: 'Main', params: { username: this.usernameInputValue } })
      }
    },
    handleUsernameFocus: function (e) {
      this.clearPlaceholderTimeout()
      this.placeholder = 'that dev'
    },
    handleUsernameBlur: function (e) {
      if (e.target.value === '') {
        this.startUsernameAnimation()
      }
    }
  },
  computed: {
    iconGithub () {
      return faGithub
    }
  },
  created: function () {
    /**
     * Username Placeholder Animation
     */
    this.startUsernameAnimation = () => {
      this.clearPlaceholderTimeout()
      this.placeholderTimeout = setTimeout(this.usernameAnimation, 5000)
    }

    this.clearPlaceholderTimeout = () => {
      if (this.placeholderTimeout) {
        clearTimeout(this.placeholderTimeout)
        this.placeholderTimeout = null
      }
    }

    this.sleep = (ms) => {
      return new Promise(resolve => {
        this.placeholderTimeout = setTimeout(resolve, ms)
      })
    }

    this.usernameAnimation = () => {
      new Promise(resolve => {
        this.placeholder = ''
        this.type('tschortsch', resolve)
      }).then(
        () => this.sleep(2000)
      ).then(
        () => {
          return new Promise((resolve) => {
            this.erase(resolve)
          })
        }
      ).then(
        () => this.sleep(1000)
      ).then(
        () => {
          return new Promise((resolve) => {
            this.type('GitHub username', resolve)
          })
        }
      ).then(
        () => this.sleep(2000)
      ).then(
        () => {
          return new Promise((resolve) => {
            this.erase(resolve)
          })
        }
      ).then(
        () => this.sleep(1000)
      ).then(
        () => {
          return new Promise((resolve) => {
            this.type('that dev', resolve, 150)
          })
        }
      )
    }

    this.type = (text, resolve, speed = 300) => {
      let textLength = text.length

      if (textLength > 0) {
        const nextCharacter = text.charAt(0)
        const remainingText = text.substr(1, textLength)
        this.placeholder = this.placeholder + nextCharacter
        this.placeholderTimeout = setTimeout(() => {
          this.type(remainingText, resolve)
        }, speed)
      } else {
        resolve()
      }
    }

    this.erase = (resolve, speed = 150) => {
      const currentPlaceholderText = this.placeholder
      this.placeholder = currentPlaceholderText.substr(0, currentPlaceholderText.length - 1)
      if (this.placeholder.length > 0) {
        this.placeholderTimeout = setTimeout(() => {
          this.erase(resolve)
        }, speed)
      } else {
        resolve()
      }
    }

    this.startUsernameAnimation()
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/functions";
@import "../variables";
@import "~bootstrap/scss/mixins";

.question {
  font-size: $h1-font-size;

  .flex-item {
    flex: 1;
  }

  .label {
    margin-right: 0.7rem;

    @include media-breakpoint-up(md) {
      text-align: right;
    }
  }

  .username-input-wrapper {
    .questionmark {
      margin-left: 0.7rem;
    }
  }

  .form-text {
    font-size: $font-size-sm;
  }

  #username {
    border: none;
    border-bottom: solid $body-color 3px;
    border-radius: 0;
    font-size: $h1-font-size;
    padding: 0;
    line-height: $line-height-base;
    color: $body-color;
    width: 100%;
  }
}
</style>
