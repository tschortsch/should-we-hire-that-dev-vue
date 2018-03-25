<template>
  <div class="col-xl-8 col-lg-10">
    <form v-if="accessToken" class="form-inline mb-3" v-on:submit="submitUsernameForm">
      <div class="form-group">
        <div class="question">
          <div class="label flex-item">Should we hire</div>
          <div class="flex-item">
            <div class="username-input-wrapper">
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
      </div>
    </form>
    <h1 v-else class="text-center">Should we hire that dev?</h1>
  </div>
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
import { faGithub } from '@fortawesome/fontawesome-free-brands'

export default {
  name: 'github-username-input',
  components: {
    FontAwesomeIcon
  },
  props: ['username', 'accessToken', 'isLoading'],
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
        this.clearPlaceholderTimeout()
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
        this.clearPlaceholderTimeout()
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

<style scoped>

</style>
