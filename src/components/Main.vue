<template>
  <div class="container mt-4 mb-2">
    <div class="row justify-content-center">
      <div class="col-12 text-right mb-3">
        <github-auth :accessToken="accessToken" :username="username" />
      </div>
      <div class="col-xl-8 col-lg-10 col-12">
        <h1 class="sr-only">Should we hire that dev?</h1>
        <github-username-input :username="username" :isLoading="isLoading" />
        <div class="text-center">
          <div v-if="errorMessage !== ''" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
          <div v-if="!accessToken && userdata" class="alert alert-warning" role="alert">Please authorize with GitHub to get full statistics</div>
        </div>
        <intro :accessToken="accessToken" :userdata="userdata" :isLoading="isLoading" />
        <div class="text-center">
          <template v-if="errorMessage === '' && ((userdata && commitsTotalCount && organizations) || isLoading)">
            <user-info  :userdata="userdata" :organizations="organizations" :isLoading="isLoading" />
            <statistics :userdata="userdata" :commits-total-count="commitsTotalCount" />
          </template>
        </div>
      </div>
      <div class="col-xl-8 col-lg-10 col-12 text-center">
        <page-footer />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import UserInfo from './userinfo/UserInfo'
import Statistics from './statistics/Statistics'
import GithubAuth from './GithubAuth'
import GithubUsernameInput from './GithubUsernameInput'
import Intro from './Intro'
import PageFooter from './PageFooter'

export default {
  name: 'Main',
  components: {
    PageFooter,
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
      organizations: null,
      errorMessage: '',
      isLoading: false
    }
  },
  watch: {
    username: function (newUsername, oldUsername) {
      if (newUsername) {
        if (this.accessToken) {
          this.fetchUserInfoAuthorized(this.username)
        } else {
          this.fetchUserInfoUnauthorized(this.username)
        }
      } else {
        this.resetState()
        this.errorMessage = 'Please enter username.'
      }
    }
  },
  created: function () {
    this.fetchUserInfoAuthorized = (username) => {
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
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
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
          Promise.all([this.doFetchCommits(username), this.doFetchOrganizations(username)])
            .then(([commitsTotalCount, organizations]) => {
              this.commitsTotalCount = commitsTotalCount
              this.organizations = organizations
              this.isLoading = false
            })
            .catch(reason => {
              this.resetState()
              this.errorMessage = reason
            })
        })
      })
    }

    this.fetchUserInfoUnauthorized = (username) => {
      this.isLoading = true
      this.resetState()

      this.fetchUserInfo(username).then((userResponseRaw) => {
        if (!userResponseRaw.ok) {
          this.resetState()
          if (userResponseRaw.status === 404) {
            this.errorMessage = 'User not found. Try another username.'
          } else if (this.rateLimitExceeded(userResponseRaw.headers)) {
            this.errorMessage = this.getRateLimitReason(userResponseRaw.headers)
          } else {
            this.errorMessage = 'Something went wrong!'
          }
          this.isLoading = false
          return
        }
        userResponseRaw.json().then((userResponse) => {
          console.log('User response', userResponse)
          this.userdata = {
            requestType: 'rest',
            login: userResponse.login,
            name: userResponse.name,
            location: userResponse.location,
            avatarUrl: userResponse.avatar_url,
            bio: userResponse.bio,
            createdAt: userResponse.created_at,
            url: userResponse.url,
            followers: {
              totalCount: userResponse.followers
            },
            pullRequests: null,
            repositories: {
              totalCount: userResponse.public_repos,
              nodes: null
            },
            repositoriesContributedTo: null
          }
        })

        Promise.all([this.doFetchCommits(username), this.doFetchOrganizations(username)])
          .then(([commitsTotalCount, organizations]) => {
            this.commitsTotalCount = commitsTotalCount
            this.organizations = organizations
            this.isLoading = false
          })
          .catch(reason => {
            this.resetState()
            this.errorMessage = reason
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

    this.fetchUserInfo = (username) => {
      let userQuery = 'https://api.github.com/users/' + username
      if (this.accessToken) {
        userQuery += '?access_token=' + this.accessToken
      }
      return fetch(userQuery)
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

    this.doFetchCommits = (username) => {
      return new Promise((resolve, reject) => {
        this.fetchCommits(username).then(commitsResponseRaw => {
          if (this.rateLimitExceeded(commitsResponseRaw.headers)) {
            reject(this.getRateLimitReason(commitsResponseRaw.headers))
          }
          commitsResponseRaw.json().then(commitsResponse => {
            console.log('Commits response', commitsResponse)
            resolve(commitsResponse.total_count)
          })
        })
      })
    }

    this.fetchOrganizations = (username) => {
      let organizationsQueryUrl = 'https://api.github.com/users/' + username + '/orgs'
      if (this.accessToken) {
        organizationsQueryUrl += '?access_token=' + this.accessToken
      }
      return fetch(organizationsQueryUrl)
    }

    this.doFetchOrganizations = (username) => {
      return new Promise((resolve, reject) => {
        this.fetchOrganizations(username).then(organizationsResponseRaw => {
          if (this.rateLimitExceeded(organizationsResponseRaw.headers)) {
            reject(this.getRateLimitReason(organizationsResponseRaw.headers))
          }
          organizationsResponseRaw.json().then(organizationsResponse => {
            console.log('Organizations response', organizationsResponse)
            resolve(organizationsResponse)
          })
        })
      })
    }

    this.resetState = () => {
      this.userdata = null
      this.commitsTotalCount = null
      this.organizations = null
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
      if (this.accessToken) {
        this.fetchUserInfoAuthorized(this.username)
      } else {
        this.fetchUserInfoUnauthorized(this.username)
      }
    }
  }
}
</script>
