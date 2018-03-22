<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-xl-8 col-lg-10">
        <form class="form-inline mb-3" v-on:submit="submitUsernameForm">
          <div class="form-group">
            <div class="question">
              <div class="label flex-item">Should we hire</div>
              <div class="flex-item">
                <div class="username-input-wrapper">
                  <label for="username" class="sr-only">Please enter GitHub username:</label>
                  <input type="search" name="username" id="username" class="form-control"
                         v-model="username"
                         placeholder="that dev"
                         :disabled="isLoading"
                  />
                  <div class="questionmark">?</div>
                </div>
                <p class="form-text text-muted">Enter GitHub GitHub##ICON## username</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="col-xl-8 col-lg-10 text-center">
        Bla
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

<style lang="scss">
  @import "~bootstrap/scss/functions";
  @import "../variables";
  @import "~bootstrap/scss/mixins";

  .question {
    font-size: $h1-font-size;
    flex: 1;

  @include media-breakpoint-up(md) {
    display: flex;
  }

  > .flex-item {
  @include media-breakpoint-up(md) {
    flex: 1;
  }
  }

  .label {
    margin-right: 0.7rem;

  @include media-breakpoint-up(md) {
    text-align: right;
  }
  }

  .username-input-wrapper {
    display: flex;
    align-items: baseline;

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
