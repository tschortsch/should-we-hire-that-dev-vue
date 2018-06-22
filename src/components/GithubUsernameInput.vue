<template>
  <form class="mb-3" @submit.prevent="submitUsernameForm">
    <div class="question d-md-flex">
      <div class="label flex-item">Should we hire</div>
      <div class="flex-item">
        <div class="username-questionmark-wrapper d-flex">
          <div class="username-input-wrapper d-flex align-items-center">
            <label for="username" class="sr-only">Please enter GitHub username:</label>
            <input type="search"
                   name="username"
                   id="username"
                   class="form-control"
                   autocapitalize="none"
                   autocorrect="off"
                   autocomplete="off"
                   spellcheck="false"
                   ref="usernameInput"
                   v-model="usernameInputValue"
                   :placeholder="placeholder"
                   :disabled="isLoading"
                   @focus="handleUsernameFocus"
                   @blur="handleUsernameBlur"
                   @keyup.esc.prevent="handleUsernameEscape"
                   @keydown.up.prevent="handleUsernameUp"
                   @keydown.down.prevent="handleUsernameDown"
                   @keydown.enter.prevent="handleUsernameSelect"
            />
            <ul class="username-suggest-list list-unstyled" v-if="usersSuggestListOpen">
              <li v-for="(user, index) in usersSuggestList"
                  v-bind:key="index"
                  :class="{ highlight: index === usersSuggestListPointer }"
              >
                <a href="#" @mousedown.prevent="handleUsernameMousedown(user.login)">
                  <div class="d-flex align-items-center">
                    <img v-if="user.avatarUrl" class="avatar" :src="user.avatarUrl" :alt="user.name || user.login" />
                    <div class="login text-truncate" v-html="getHighligthedUsername(user.login)"></div>
                  </div>
                </a>
              </li>
            </ul>
            <button type="submit" class="sr-only" tabindex="-1">Submit user search</button>
            <button class="clear-button" v-visible="usernameInputValue" @click.prevent="handleClearButtonClick">
              <span aria-label="Clear username">&times;</span>
            </button>
          </div>
          <div class="questionmark">?</div>
        </div>
        <p class="form-text text-muted">Enter GitHub <font-awesome-icon name="github" :icon="['fab', 'github']" /> username</p>
      </div>
    </div>
  </form>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GithubService from '../services/GithubService'

export default {
  name: 'github-username-input',
  components: {
    FontAwesomeIcon
  },
  props: {
    username: String,
    isLoading: Boolean,
    isAuthorized: Boolean
  },
  data () {
    return {
      placeholder: 'that dev',
      placeholderTimeout: null,
      usernameInputValue: this.username,
      originalUsernameInputValue: null,
      usernameFetchTimeout: null,
      usersSuggestList: [],
      usersSuggestListOpen: false,
      usersSuggestListPointer: -1
    }
  },
  watch: {
    username: function (newUsername, oldUsername) {
      if (newUsername) {
        this.usernameInputValue = newUsername
      } else {
        this.usernameInputValue = ''
      }
    },
    usersSuggestList () {
      // deselect when list changes
      this.usersSuggestListPointer = -1
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      if (this.usernameInputValue === '') {
        this.$router.push({ name: 'Main' })
      } else if (this.usernameInputValue !== this.username) {
        // remove focus to username input field
        this.$refs.usernameInput.blur()
        this.$router.push({ name: 'Main', params: { username: this.usernameInputValue } })
      }
    },
    handleUsernameFocus: function (e) {
      if (this.usersSuggestList.length > 0) {
        this.usersSuggestListOpen = true
      }
      this.clearPlaceholderTimeout()
      this.placeholder = 'that dev'
    },
    handleUsernameBlur: function (e) {
      this.usersSuggestListOpen = false
      if (e.target.value === '') {
        this.startUsernameAnimation()
      }
    },
    /**
     * Move the usersSuggestListPointer visually up the list by
     * subtracting the current index by one.
     * @return {void}
     */
    handleUsernameUp () {
      if (this.usersSuggestListPointer > 0) {
        this.usersSuggestListPointer--
        if (this.usersSuggestList[this.usersSuggestListPointer]) {
          this.usernameSelect(this.usersSuggestList[this.usersSuggestListPointer].login)
        }
      } else if (this.usersSuggestListPointer === 0) {
        this.usersSuggestListPointer--
        this.usernameSelect(this.originalUsernameInputValue)
      }
    },
    /**
     * Move the usersSuggestListPointer visually down the list by
     * adding the current index by one.
     * @return {void}
     */
    handleUsernameDown () {
      if (this.usersSuggestListPointer < this.usersSuggestList.length - 1) {
        this.usersSuggestListPointer++
        if (this.usersSuggestList[this.usersSuggestListPointer]) {
          this.usernameSelect(this.usersSuggestList[this.usersSuggestListPointer].login)
        }
      }
    },
    /**
     * Select the option at the current usersSuggestListPointer position.
     * @return {void}
     */
    handleUsernameSelect () {
      if (this.usersSuggestListOpen && this.usersSuggestList[this.usersSuggestListPointer]) {
        this.usernameSelect(this.usersSuggestList[this.usersSuggestListPointer].login)
      } else if (this.usernameInputValue.length) {
        this.usernameSelect(this.usernameInputValue)
      }
      this.clearUsersSuggestList()
      this.submitUsernameForm()
    },
    handleUsernameEscape: function (e) {
      // TODO prevent input clear when suggest list is open
      if (this.usersSuggestListOpen) {
        this.usersSuggestListOpen = false
      } else {
        this.usernameInputValue = ''
      }
    },
    handleClearButtonClick: function (e) {
      this.usernameInputValue = ''
      // set focus to username input field
      this.$refs.usernameInput.focus()
    },
    handleUsernameChange: function (usernameValue) {
      GithubService.fetchUsernameSuggest(usernameValue).then(userList => {
        this.usersSuggestList = userList.data.search.edges.map(({ node: user }) => {
          return user
        })
        this.originalUsernameInputValue = usernameValue
        this.usersSuggestListOpen = true
      })
    },
    handleUsernameMousedown: function (username) {
      this.usernameSelect(username)
      this.clearUsersSuggestList()
      this.submitUsernameForm()
    },
    getHighligthedUsername: function (username) {
      if (!username || this.usernameInputValue.length < 1) {
        return username
      }
      const match = username.match(new RegExp(`^(${this.escapeRegExp(this.usernameInputValue)})(.*)`, 'i'))
      if (!match) {
        return username
      }

      let usernameHtml = `<span class="highlight">${match[1]}</span>`
      if (match.length > 2) {
        usernameHtml += match[2]
      }
      return usernameHtml
    }
  },
  created: function () {
    this.escapeRegExp = (str) => {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
    }

    this.usernameInputValueWatcher = (newUsernameValue, oldUsernameValue) => {
      const requestDelay = 500
      const autocompleteCharacterLimit = 2
      this.clearUsernameFetchTimeout()

      if (newUsernameValue !== oldUsernameValue) {
        if (newUsernameValue.length >= autocompleteCharacterLimit) {
          this.usernameFetchTimeout = setTimeout(
            () => {
              this.handleUsernameChange(newUsernameValue)
            },
            requestDelay
          )
        } else {
          this.clearUsersSuggestList()
        }
      }
    }

    if (this.isAuthorized) {
      // Dynamically add watcher to be able to disable it
      this.unwatchUsernameInputValue = this.$watch(
        'usernameInputValue',
        this.usernameInputValueWatcher
      )
    }

    this.clearUsernameFetchTimeout = () => {
      if (this.usernameFetchTimeout) {
        clearTimeout(this.usernameFetchTimeout)
        this.usernameFetchTimeout = null
      }
    }

    this.usernameSelect = option => {
      if (this.isAuthorized) {
        this.unwatchUsernameInputValue()
        this.usernameInputValue = option
        this.unwatchUsernameInputValue = this.$watch(
          'usernameInputValue',
          this.usernameInputValueWatcher
        )
      } else {
        this.usernameInputValue = option
      }
    }

    this.clearUsersSuggestList = () => {
      this.usersSuggestList = []
      this.usersSuggestListOpen = false
    }

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
            this.type('GitHub user', resolve)
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
          this.placeholder = 'that dev'
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

    // start username animation if input field is empty
    if (!this.usernameInputValue || this.usernameInputValue === '') {
      this.startUsernameAnimation()
    }
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
    flex: 0 0 50%;
  }

  .label {
    @include media-breakpoint-up(md) {
      padding-right: 0.7rem;
      text-align: right;
    }
  }

  .form-text {
    font-size: $font-size-sm;
  }

  .username-input-wrapper {
    position: relative;
    flex: 1;
    border-bottom: solid $body-color 3px;
  }

  .questionmark {
    flex: 0 0 auto;
    margin-left: 0.7rem;
  }

  #username {
    flex: 1;
    border: none;
    border-radius: 0;
    font-size: $h1-font-size;
    padding: 0;
    line-height: $line-height-base;
    height: 60px;
    color: $body-color;
    // allow input to shrink (see: https://stackoverflow.com/questions/42421361/input-button-elements-not-shrinking-in-a-flex-container)
    width: 100%;
    min-width: 0;

    &:focus {
      box-shadow: none;
    }
  }

  .clear-button {
    flex: 0 0 auto;
    color: $gray-600;
    font-size: $h2-font-size;
    line-height: $line-height-base;
    height: $input-height-lg;
    padding: 0 0.3rem;
    cursor: pointer;
    border: 0;
    background: transparent;
  }
  // Disable native clear button in IE10 & IE11
  #username::-ms-clear {
    display: none;
  }

  .username-suggest-list {
    position: absolute;
    top: 63px;
    left: 0;
    background-color: hsla(0, 0%, 100%, .9);
    backdrop-filter: blur(2px);
    z-index: 100;
    width: 100%;
    box-shadow: 0 0 10px 0 rgba(125, 125, 125, .5);
    font-size: $font-size-base;

    li {
      margin-bottom: 5px;

      &:last-child {
        margin-bottom: 0;
      }

      img.avatar {
        width: 50px;
        height: 50px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .login {
        padding: 0 8px;
        > .highlight {
          color: $brand;
        }
      }

      a {
        display: block;
        color: $body-color;

        @include hover-focus {
          text-decoration: none;
        }
      }
      &:hover {
        cursor: pointer;
      }
      &.highlight,
      &:hover,
      &:focus {
        background-color: $brand-light;
      }
    }
  }
}
</style>
