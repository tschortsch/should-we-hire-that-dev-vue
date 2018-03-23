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
                     v-model="username"
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
  props: ['accessToken', 'isLoading'],
  data () {
    return {
      username: this.$route.params.username,
      placeholder: 'that dev',
      placeholderTimeout: null
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.params.username) {
        this.username = to.params.username
      } else {
        this.username = ''
      }
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      e.preventDefault()
      if (this.username === '') {
        this.$router.push({ name: 'Main' })
      } else {
        this.$router.push({ name: 'Main', params: { username: this.username } })
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

    this.usernameAnimation = () => {
      new Promise((resolve) => {
        this.placeholder = ''
        this.type('tschortsch', resolve)
      }).then(() => {
        this.clearPlaceholderTimeout()
        this.placeholderTimeout = setTimeout(() => {
          new Promise((resolve) => {
            this.erase(resolve)
          }).then(() => {
            new Promise((resolve) => {
              this.clearPlaceholderTimeout()
              this.placeholderTimeout = setTimeout(() => {
                this.type('GitHub username', resolve)
              }, 1000)
            }).then(() => {
              this.clearPlaceholderTimeout()
              this.placeholderTimeout = setTimeout(() => {
                new Promise((resolve) => {
                  this.erase(resolve)
                }).then(() => {
                  this.clearPlaceholderTimeout()
                  this.placeholderTimeout = setTimeout(() => {
                    this.placeholder = 'that dev'
                  }, 1000)
                })
              }, 2000)
            })
          })
        }, 2000)
      })
    }

    this.type = (text, resolve) => {
      let textLength = text.length

      if (textLength > 0) {
        const nextCharacter = text.charAt(0)
        const remainingText = text.substr(1, textLength)
        this.placeholder = this.placeholder + nextCharacter
        this.clearPlaceholderTimeout()
        this.placeholderTimeout = setTimeout(() => {
          this.type(remainingText, resolve)
        }, 300)
      } else {
        this.clearPlaceholderTimeout()
        resolve()
      }
    }

    this.erase = (resolve) => {
      const currentPlaceholderText = this.placeholder
      this.placeholder = currentPlaceholderText.substr(0, currentPlaceholderText.length - 1)
      if (this.placeholder.length > 0) {
        this.clearPlaceholderTimeout()
        this.placeholderTimeout = setTimeout(() => {
          this.erase(resolve)
        }, 150)
      } else {
        this.clearPlaceholderTimeout()
        resolve()
      }
    }

    this.startUsernameAnimation()
  }
}
</script>

<style scoped>

</style>
