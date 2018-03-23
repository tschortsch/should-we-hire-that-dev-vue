<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <github-auth :accessToken="accessToken" />
      <github-username-input :accessToken="accessToken" :isLoading="isLoading" />
      <div class="col-xl-8 col-lg-10 text-center">
        <div v-if="errorMessage !== ''" class="text-danger">{{ errorMessage }}</div>
        <p v-if="!accessToken">
          Since GitHub doesn't allow to do <a href="https://developer.github.com/v4/">GraphQL queries</a> without authorization please sign in with your GitHub account first.
          The Authorization only grants this website to request data which is already public anyway. So, no worries!
        </p>
        <user-info :userdata="userdata" :isLoading="isLoading" />
        <statistics v-if="(userdata && commitsTotalCount) || isLoading" :userdata="userdata" :commits-total-count="commitsTotalCount" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import UserInfo from './UserInfo'
import Statistics from './Statistics'
import GithubAuth from './GithubAuth'
import GithubUsernameInput from './GithubUsernameInput'

export default {
  name: 'main',
  components: {
    GithubUsernameInput,
    GithubAuth,
    Statistics,
    UserInfo
  },
  data () {
    return {
      accessToken: window.localStorage.getItem('swhtd-gh-access-token'),
      username: this.$route.params.username,
      userdata: null,
      commitsTotalCount: null,
      errorMessage: '',
      isLoading: false
    }
  },
  watch: {
    '$route' (to, from) {
      if (to.params.username) {
        this.username = to.params.username
        this.fetchUserInfo(this.username)
      } else {
        this.username = ''
        this.resetState()
        this.errorMessage = 'Please enter username.'
      }
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
        if (!responseRaw.ok) {
          this.resetState()
          if (responseRaw.status === 401) {
            if (this.accessToken) {
              this.errorMessage = 'Something is wrong with your access_token. Please login again.'
              this.removeAccessTokenFromLocalStorage()
            } else {
              this.errorMessage = 'Please authorize with GitHub before searching for a user.'
            }
          } else if (responseRaw.status === 404) {
            this.errorMessage = 'User not found. Try another username.'
          } else if (this.rateLimitExceeded(responseRaw.headers)) {
            this.errorMessage = this.getRateLimitReason(responseRaw.headers)
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
            this.isLoading = false
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

    // fetch userinfo on load if username is passed in url
    if (this.username) {
      this.fetchUserInfo(this.username)
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
