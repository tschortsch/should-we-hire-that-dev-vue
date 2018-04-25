<template>
  <div class="container mt-4 mb-5">
    <div class="row justify-content-center">
      <div class="col-12 text-right mb-3">
        <github-auth :accessToken="accessToken" />
      </div>
      <div class="col-xl-8 col-lg-10 col-12">
        <template v-if="accessToken">
          <h1 class="sr-only">Should we hire that dev?</h1>
          <github-username-input v-if="accessToken" :username="username" :isLoading="isLoading" />
          <div class="text-center">
            <div v-if="errorMessage !== ''" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
            <template v-if="(userdata && commitsTotalCount !== null) || isLoading">
              <user-info  :userdata="userdata" :isLoading="isLoading" />
              <statistics :userdata="userdata" :commits-total-count="commitsTotalCount" />
            </template>
          </div>
        </template>
        <template v-else>
          <intro />
        </template>
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
import Intro from './Intro'

export default {
  name: 'Main',
  components: {
    Intro,
    GithubUsernameInput,
    GithubAuth,
    Statistics,
    UserInfo
  },
  props: {
    username: String
  },
  data () {
    return {
      accessToken: window.localStorage.getItem('swhtd-gh-access-token'),
      userdata: null,
      commitsTotalCount: null,
      errorMessage: '',
      isLoading: false
    }
  },
  watch: {
    username: function (newUsername, oldUsername) {
      if (newUsername) {
        this.fetchUserInfo(this.username)
      } else {
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
          login,
          name,
          location,
          avatarUrl,
          bio,
          createdAt,
          url,
          followers {
            totalCount
          },
          organizations(first: 100) {
            totalCount
            edges {
              node {
                id,
                name,
                url,
                avatarUrl
              }
            }
          }
          pullRequests(first: 1) {
            totalCount
          },
          repositories(first: 100) {
            totalCount,
            nodes {
              name,
              url,
              description,
              stargazers {
                totalCount
              },
              forkCount,
              primaryLanguage {
                name
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
          console.log('Userdata', this.userdata)

          // TODO replace with graphql query
          let fetchCommitsPromise = new Promise((resolve, reject) => {
            this.fetchCommits(username).then(commitsResponseRaw => {
              if (this.rateLimitExceeded(commitsResponseRaw.headers)) {
                reject(new Error(this.getRateLimitReason(commitsResponseRaw.headers)))
              }
              commitsResponseRaw.json().then(commitsResponse => {
                console.log('Commits response', commitsResponse)
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
    if (this.accessToken && this.username) {
      this.fetchUserInfo(this.username)
    }
  }
}
</script>

<style lang="scss">

</style>
