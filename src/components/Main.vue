<template>
  <div class="container mt-4 mb-2">
    <div class="row justify-content-center">
      <div class="col-12 text-right mb-3">
        <github-auth :accessToken="accessToken" :username="username" />
      </div>
      <div class="col-xl-8 col-lg-10 col-12">
        <h1 class="sr-only">Should we hire that dev?</h1>
        <github-username-input
          :username="username"
          :isLoading="isLoading"
          :fetchUsernameSuggest="fetchUsernameSuggest"
          :usernameSuggestEnabled="isAuthorized"
          :accessToken="accessToken"
        />
        <div class="text-center">
          <div v-if="errorMessage !== ''" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
          <div v-if="!accessToken && userdata" class="alert alert-warning" role="alert">Please authorize with GitHub to get all statistics</div>
        </div>
        <intro :accessToken="accessToken" :userdata="userdata" :isLoading="isLoading" />
        <div class="text-center">
          <template v-if="errorMessage === '' && ((userdata && commits && commitsTotalCount && organizations) || isLoading)">
            <user-info  :userdata="userdata" :organizations="organizations" :isLoading="isLoading" />
            <statistics
              :userdata="userdata"
              :commits="commits"
              :commits-total-count="commitsTotalCount"
              :repositories="repositories"
              :repositoriesContributedTo="repositoriesContributedTo"
              :isAuthorized="isAuthorized"
            />
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
      repositories: null,
      repositoriesContributedTo: null,
      commits: null,
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
          this.fetchUserInfoAuthorized(this.username, this.accessToken)
        } else {
          this.fetchUserInfoUnauthorized(this.username)
        }
      } else {
        this.resetState()
        this.errorMessage = 'Please enter username.'
      }
    }
  },
  computed: {
    isAuthorized () {
      return this.accessToken && this.accessToken !== ''
    }
  },
  created: function () {
    this.fetchUserInfoAuthorized = (username, accessToken) => {
      this.isLoading = true
      this.resetState()

      this.doGraphQlQuery(this.getUserQuery(username), accessToken)
        .then((userResponse) => {
          let userinfo = userResponse.data.user
          this.userdata = userinfo
          console.log('Userdata', this.userdata)

          const repositoriesPromise = new Promise((resolve, reject) => {
            if (userinfo.repositories.pageInfo.hasNextPage) {
              this.fetchFurtherRepositories(username, userinfo.repositories.pageInfo.endCursor, 2, accessToken)
                .then(repositories => {
                  resolve([...userinfo.repositories.nodes, ...repositories])
                })
                .catch(err => {
                  reject(err)
                })
            } else {
              resolve(userinfo.repositories.nodes)
            }
          }).then((repositories) => {
            this.repositories = repositories
          })

          const repositoriesContributedToPromise = new Promise((resolve, reject) => {
            if (userinfo.repositoriesContributedTo.pageInfo.hasNextPage) {
              this.fetchFurtherRepositoriesContributedTo(username, userinfo.repositoriesContributedTo.pageInfo.endCursor, 2, accessToken)
                .then(repositoriesContributedTo => {
                  resolve([...userinfo.repositoriesContributedTo.nodes, ...repositoriesContributedTo])
                })
                .catch(err => {
                  reject(err)
                })
            } else {
              resolve(userinfo.repositoriesContributedTo.nodes)
            }
          }).then((repositoriesContributedTo) => {
            this.repositoriesContributedTo = repositoriesContributedTo
          })

          const commitsFirstPagePromise = this.fetchCommits(username, 1, accessToken)
          const commitsSecondPagePromise = this.fetchCommits(username, 2, accessToken)
          Promise.all([commitsFirstPagePromise, commitsSecondPagePromise])
            .then(([commitsFirstPage, commitsSecondPage]) => {
              console.log('Commits 1. Page', commitsFirstPage)
              console.log('Commits 2. Page', commitsSecondPage)
              this.commits = [...commitsFirstPage.items, ...commitsSecondPage.items]
              this.commitsTotalCount = commitsFirstPage.total_count
            })

          const organizationsPromise = this.fetchOrganizations(username, accessToken)
            .then(organizations => {
              console.log('Organizations', organizations)
              this.organizations = organizations
            })

          Promise.all([
            repositoriesPromise,
            repositoriesContributedToPromise,
            commitsFirstPagePromise,
            commitsSecondPagePromise,
            organizationsPromise
          ])
            .then(() => {
              this.isLoading = false
            })
            .catch(err => {
              this.resetState()
              this.errorMessage = err.message
              this.isLoading = false
            })
        })
        .catch(err => {
          this.resetState()
          this.errorMessage = err.message
          this.isLoading = false
        })
    }

    this.fetchUserInfoUnauthorized = (username) => {
      this.isLoading = true
      this.resetState()

      this.fetchUserInfo(username)
        .then((userResponse) => {
          console.log('User response', userResponse)
          this.userdata = {
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
            repositories: {
              totalCount: userResponse.public_repos
            }
          }

          const commitsFirstPagePromise = this.fetchCommits(username, 1)
          const commitsSecondPagePromise = this.fetchCommits(username, 2)
          Promise.all([commitsFirstPagePromise, commitsSecondPagePromise])
            .then(([commitsFirstPage, commitsSecondPage]) => {
              console.log('Commits 1. Page', commitsFirstPage)
              console.log('Commits 2. Page', commitsSecondPage)
              this.commits = [...commitsFirstPage.items, ...commitsSecondPage.items]
              this.commitsTotalCount = commitsFirstPage.total_count
            })

          const organizationsPromise = this.fetchOrganizations(username)
            .then(organizations => {
              console.log('Organizations', organizations)
              this.organizations = organizations
            })

          Promise.all([commitsFirstPagePromise, commitsSecondPagePromise, organizationsPromise])
            .then(() => {
              this.isLoading = false
            })
            .catch(err => {
              this.resetState()
              this.errorMessage = err.message
              this.isLoading = false
            })
        }).catch(err => {
          this.resetState()
          this.errorMessage = err.message
          this.isLoading = false
        })
    }

    this.getUserQuery = (username) => (`
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
            pageInfo {
              hasNextPage,
              endCursor
            },
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
            pageInfo {
              hasNextPage,
              endCursor
            },
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
          }
        }
      }`)

    this.getFurtherRepositoriesQuery = (username, cursor) => {
      return `
        query {
          user(login: "${username}") {
            repositories(first: 100, after: "${cursor}") {
              pageInfo {
                hasNextPage,
                endCursor
              },
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
            }
          }
        }`
    }

    this.fetchFurtherRepositories = (username, cursor, currentPage, accessToken, furtherRepositories = []) => {
      const maxPages = 5
      return this.doGraphQlQuery(this.getFurtherRepositoriesQuery(username, cursor), accessToken)
        .then(repositoriesResponse => {
          const repositories = repositoriesResponse.data.user.repositories.nodes
          furtherRepositories.push(...repositories)
          const pageInfo = repositoriesResponse.data.user.repositories.pageInfo
          if (currentPage < maxPages && pageInfo.hasNextPage) {
            return this.fetchFurtherRepositories(username, pageInfo.endCursor, currentPage + 1, accessToken, furtherRepositories)
          }
          return furtherRepositories
        })
    }

    this.getFurtherRepositoriesContributedToQuery = (username, cursor) => {
      return `
        query {
          user(login: "${username}") {
            repositoriesContributedTo(first: 100, after: "${cursor}") {
              pageInfo {
                hasNextPage,
                endCursor
              },
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
            }
          }
        }`
    }

    this.fetchFurtherRepositoriesContributedTo = (username, cursor, currentPage, accessToken, furtherRepositorieContributedTo = []) => {
      const maxPages = 5
      return this.doGraphQlQuery(this.getFurtherRepositoriesContributedToQuery(username, cursor), accessToken)
        .then(repositoriesContributedToResponse => {
          const repositoriesContributedto = repositoriesContributedToResponse.data.user.repositoriesContributedTo.nodes
          furtherRepositorieContributedTo.push(...repositoriesContributedto)
          const pageInfo = repositoriesContributedToResponse.data.user.repositoriesContributedTo.pageInfo
          if (currentPage < maxPages && pageInfo.hasNextPage) {
            return this.fetchFurtherRepositoriesContributedTo(username, pageInfo.endCursor, currentPage + 1, accessToken, furtherRepositorieContributedTo)
          }
          return furtherRepositorieContributedTo
        })
    }

    this.fetchUsernameSuggest = (currentUsernameValue, accessToken) => {
      const query = `
      query {
        search(query: "${currentUsernameValue}", type: USER, first: 5) {
          userCount
          edges {
            node {
              ... on User {
                login
                name
                avatarUrl
              }
            }
          }
        }
      }`
      return this.doGraphQlQuery(query, accessToken)
    }

    this.doGraphQlQuery = (query, accessToken) => {
      const ghGraphQlEndpointUrl = 'https://api.github.com/graphql'
      return fetch(ghGraphQlEndpointUrl, {
        method: 'POST',
        body: JSON.stringify({query}),
        headers: new Headers({
          'Authorization': 'bearer ' + accessToken
        })
      }).then(responseRaw => {
        if (!responseRaw.ok) {
          const errorMessage = this.handleResponseError(responseRaw, accessToken)
          throw new Error(errorMessage)
        }
        return responseRaw.json()
      }).then(response => {
        const responseError = this.checkGraphQLResponseError(response)
        if (responseError !== '') {
          throw new Error(responseError)
        }
        return response
      })
    }

    this.doRestQuery = (endpointUrl, options = {}, accessToken = '') => {
      return fetch(endpointUrl, options).then(responseRaw => {
        if (!responseRaw.ok) {
          const errorMessage = this.handleResponseError(responseRaw, accessToken)
          throw new Error(errorMessage)
        }
        return responseRaw.json()
      })
    }

    this.fetchUserInfo = (username, accessToken = '') => {
      let userQuery = `https://api.github.com/users/${username}`
      if (accessToken !== '') {
        userQuery += `?access_token=${accessToken}`
      }
      return this.doRestQuery(userQuery)
    }

    this.fetchCommits = (username, page, accessToken = '') => {
      let commitQueryUrl = `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&page=${page}&per_page=100`
      if (accessToken !== '') {
        commitQueryUrl += `&access_token=${accessToken}`
      }
      return this.doRestQuery(commitQueryUrl, {
        headers: new Headers({
          'Accept': 'application/vnd.github.cloak-preview'
        })
      })
    }

    this.fetchOrganizations = (username, accessToken = '') => {
      let organizationsQueryUrl = `https://api.github.com/users/${username}/orgs`
      if (accessToken !== '') {
        organizationsQueryUrl += `?access_token=${accessToken}`
      }
      return this.doRestQuery(organizationsQueryUrl)
    }

    this.resetState = () => {
      this.userdata = null
      this.commits = null
      this.commitsTotalCount = null
      this.organizations = null
      this.repositories = null
      this.repositoriesContributedTo = null
      this.errorMessage = ''
    }

    this.handleResponseError = (response, accessToken = '') => {
      console.log(response)
      if (response.status === 401) {
        if (accessToken !== '') {
          this.removeAccessTokenFromLocalStorage()
          return 'Something is wrong with your access_token. Please login again.'
        } else {
          return 'Please authorize with GitHub before searching for a user.'
        }
      } else if (response.status === 404) {
        return 'User not found. Try another username.'
      } else if (this.rateLimitExceeded(response.headers)) {
        return this.getRateLimitReason(response.headers)
      }
      return 'Something went wrong!'
    }

    this.checkGraphQLResponseError = (response) => {
      if (response.errors) {
        return response.errors[0].message
      }
      return ''
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
        this.fetchUserInfoAuthorized(this.username, this.accessToken)
      } else {
        this.fetchUserInfoUnauthorized(this.username)
      }
    }
  }
}
</script>
