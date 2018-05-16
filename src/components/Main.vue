<template>
  <div class="container mt-4 mb-2">
    <div class="row justify-content-center">
      <div class="col-12 text-right mb-3">
        <github-auth :isAuthorized="isAuthorized" :username="username" />
      </div>
      <div class="col-xl-8 col-lg-10 col-12">
        <h1 class="sr-only">Should we hire that dev?</h1>
        <github-username-input
          :username="username"
          :isLoading="isLoading"
          :isAuthorized="isAuthorized"
        />
        <div class="text-center">
          <div v-if="errorMessage !== ''" class="alert alert-danger" role="alert">{{ errorMessage }}</div>
          <div v-if="!isAuthorized && userdata" class="alert alert-warning" role="alert">Please authorize with GitHub to get all statistics</div>
        </div>
        <intro :isAuthorized="isAuthorized" :userdata="userdata" :isLoading="isLoading" />
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
      userdata: null,
      repositories: null,
      repositoriesContributedTo: null,
      commits: null,
      commitsTotalCount: null,
      organizations: null,
      errorMessage: '',
      isLoading: false,
      isAuthorized: GithubService.isAuthorized()
    }
  },
  watch: {
    username: function (newUsername, oldUsername) {
      if (newUsername) {
        if (this.isAuthorized) {
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
    EventBus.$on('token-changed', (token, isAuthorized) => {
      this.isAuthorized = isAuthorized
    })

    this.fetchUserInfoAuthorized = (username) => {
      this.isLoading = true
      this.resetState()

      GithubService.fetchUserInfo(username)
        .then((userResponse) => {
          let userinfo = userResponse.data.user
          this.userdata = userinfo
          console.log('Userdata', this.userdata)

          const repositoriesPromise = new Promise((resolve, reject) => {
            if (userinfo.repositories.pageInfo.hasNextPage) {
              GithubService.fetchFurtherRepositories(username, userinfo.repositories.pageInfo.endCursor, 2)
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
              GithubService.fetchFurtherRepositoriesContributedTo(username, userinfo.repositoriesContributedTo.pageInfo.endCursor, 2)
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

      GithubService.fetchUserInfoRest(username)
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
      if (this.isAuthorized) {
        this.fetchUserInfoAuthorized(this.username)
      } else {
        this.fetchUserInfoUnauthorized(this.username)
      }
    }
  }
}
</script>
