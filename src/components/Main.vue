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
import moment from 'moment'

export default {
  name: 'main',
  data () {
    return {
      accessToken: window.localStorage.getItem('swhtd-gh-access-token'),
      username: '',
      userdata: null,
      commitsTotalCount: null,
      errorMessage: '',
      isLoading: false
    }
  },
  methods: {
    submitUsernameForm: function (e) {
      e.preventDefault()
      this.fetchUserInfo(this.username)
    }
  },
  created: function () {
    this.fetchUserInfo = (username) => {
      this.isLoading = true
      this.resetState()

      const query = `
      query {
        user(login: "${username}") {
          name,
          location,
          avatarUrl,
          bio,
          createdAt,
          url,
          followers {
            totalCount
          },
          organizations {
            totalCount
          },
          repositories(first: 100) {
            totalCount,
            nodes {
              stargazers {
                totalCount
              }
            }
          },
          repositoriesContributedTo(first: 100) {
            totalCount,
            nodes {
              languages(first: 10) {
                edges {
                  size,
                  node {
                    name
                  }
                },
              }
            }
          },
        }
      }`
      let userCheckPromise = this.doGraphQlQuery(query)

      userCheckPromise.then((responseRaw) => {
        if (this.rateLimitExceeded(responseRaw.headers)) {
          this.resetState()
          this.errorMessage = this.getRateLimitReason(responseRaw.headers)
          return
        }
        if (!responseRaw.ok) {
          this.resetState()
          if (responseRaw.status === 401) {
            this.errorMessage = 'Something is wrong with your access_token. Please login again.'
            this.removeAccessTokenFromLocalStorage()
          } else if (responseRaw.status === 404) {
            this.errorMessage = 'User not found. Try another username.'
          } else {
            this.errorMessage = 'Something went wrong!'
          }
          this.isLoading = false
          return
        }
        responseRaw.json().then((userResponse) => {
          if (userResponse.errors) {
            this.resetState()
            this.errorMessage = userResponse.errors[0].message
            return
          }
          this.userdata = userResponse.data.user
          console.log(this.userdata)

          // TODO replace with graphql query
          let fetchCommitsPromise = new Promise((resolve, reject) => {
            this.fetchCommits(username).then(commitsResponseRaw => {
              if (this.rateLimitExceeded(commitsResponseRaw.headers)) {
                reject(new Error(this.getRateLimitReason(commitsResponseRaw.headers)))
              }
              commitsResponseRaw.json().then(commitsResponse => {
                this.commitsTotalCount = commitsResponse.total_count
                resolve()
              })
            })
          }).catch(reason => {
            this.resetState()
            this.errorMessage = reason
          })

          fetchCommitsPromise.then(() => {
            this.isLoading = false
          })
        })
      })
    }

    this.doGraphQlQuery = (query) => {
      const ghGraphQlEndpointUrl = 'https://api.github.com/graphql'
      return fetch(ghGraphQlEndpointUrl, {
        method: 'POST',
        body: JSON.stringify({query}),
        headers: new Headers({
          'Authorization': 'bearer ' + this.accessToken
        })
      })
    }

    this.fetchCommits = (username) => {
      let commitQueryUrl = 'https://api.github.com/search/commits?q=author:' + username + '&sort=author-date&order=desc&per_page=1'
      if (this.accessToken) {
        commitQueryUrl += '&access_token=' + this.accessToken
      }
      return fetch(commitQueryUrl, {
        headers: {
          'Accept': 'application/vnd.github.cloak-preview'
        }
      })
    }

    this.resetState = () => {
      this.userdata = null
      this.commitsTotalCount = null
      this.errorMessage = ''
    }

    this.rateLimitExceeded = (headers) => {
      const rateLimit = headers.get('X-RateLimit-Remaining')
      return rateLimit && rateLimit <= 0
    }

    this.getRateLimitReason = (headers) => {
      let reason = 'Your rate limit is exceeded. You have to login with GitHub to do another request.'
      const rateLimitReset = headers.get('X-RateLimit-Reset')
      if (rateLimitReset) {
        reason = 'Your rate limit is exceeded. You have to wait till ' + moment.unix(rateLimitReset).format('DD.MM.YYYY HH:mm:ss') + ' to do another request.'
      }
      return reason
    }

    this.removeAccessTokenFromLocalStorage = () => {
      window.localStorage.removeItem('swhtd-gh-access-token')
      this.accessToken = false
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
