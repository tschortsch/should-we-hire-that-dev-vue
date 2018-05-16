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
          <template v-if="errorMessage === '' && (userdata || isLoading)">
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
import UserInfo from './userinfo/UserInfo'
import Statistics from './statistics/Statistics'
import GithubAuth from './GithubAuth'
import GithubUsernameInput from './GithubUsernameInput'
import Intro from './Intro'
import PageFooter from './PageFooter'
import { EventBus } from '../services/EventBus'
import GithubService from '../services/GithubService'

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
      accessToken: GithubService.accessToken,
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
    EventBus.$on('token-changed', (token) => {
      console.log(token)
      this.accessToken = token
    })

    this.fetchUserInfoAuthorized = (username, accessToken) => {
      this.isLoading = true
      this.resetState()

      GithubService.doGraphQlQuery(this.getUserQuery(username), accessToken)
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

          const commitsFirstPagePromise = GithubService.fetchCommits(username, 1, accessToken)
          const commitsSecondPagePromise = GithubService.fetchCommits(username, 2, accessToken)
          Promise.all([commitsFirstPagePromise, commitsSecondPagePromise])
            .then(([commitsFirstPage, commitsSecondPage]) => {
              console.log('Commits 1. Page', commitsFirstPage)
              console.log('Commits 2. Page', commitsSecondPage)
              this.commits = [...commitsFirstPage.items, ...commitsSecondPage.items]
              this.commitsTotalCount = commitsFirstPage.total_count
            })

          const organizationsPromise = GithubService.fetchOrganizations(username, accessToken)
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

      GithubService.fetchUserInfo(username)
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

          const commitsFirstPagePromise = GithubService.fetchCommits(username, 1)
          const commitsSecondPagePromise = GithubService.fetchCommits(username, 2)
          Promise.all([commitsFirstPagePromise, commitsSecondPagePromise])
            .then(([commitsFirstPage, commitsSecondPage]) => {
              console.log('Commits 1. Page', commitsFirstPage)
              console.log('Commits 2. Page', commitsSecondPage)
              this.commits = [...commitsFirstPage.items, ...commitsSecondPage.items]
              this.commitsTotalCount = commitsFirstPage.total_count
            })

          const organizationsPromise = GithubService.fetchOrganizations(username)
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
      return GithubService.doGraphQlQuery(this.getFurtherRepositoriesQuery(username, cursor), accessToken)
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
      return GithubService.doGraphQlQuery(this.getFurtherRepositoriesContributedToQuery(username, cursor), accessToken)
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
        search(query: "in:login ${currentUsernameValue}", type: USER, first: 5) {
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
      return GithubService.doGraphQlQuery(query, accessToken)
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
