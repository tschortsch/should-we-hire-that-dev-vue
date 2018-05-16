import moment from 'moment'
import { EventBus } from '../services/EventBus'

export default {
  accessToken: window.localStorage.getItem('swhtd-gh-access-token'),

  doGraphQlQuery: function (query, accessToken) {
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
      if (response.errors) {
        throw new Error(this.getGraphQLResponseError(response))
      }
      return response
    })
  },

  doRestQuery: function (endpointUrl, accessToken = null, options = null) {
    if (accessToken && options && options.headers) {
      options.headers.append('Authorization', `token ${accessToken}`)
    }
    return fetch(endpointUrl, options).then(responseRaw => {
      if (!responseRaw.ok) {
        const errorMessage = this.handleResponseError(responseRaw, accessToken)
        throw new Error(errorMessage)
      }
      return responseRaw.json()
    })
  },

  fetchUserInfo: function (username, accessToken = null) {
    let userQuery = `https://api.github.com/users/${username}`
    return this.doRestQuery(userQuery, accessToken)
  },

  fetchCommits: function (username, page, accessToken = null) {
    let commitQueryUrl = `https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&page=${page}&per_page=100`
    return this.doRestQuery(commitQueryUrl, accessToken, {
      headers: new Headers({
        'Accept': 'application/vnd.github.cloak-preview'
      })
    })
  },

  fetchOrganizations: function (username, accessToken = null) {
    let organizationsQueryUrl = `https://api.github.com/users/${username}/orgs`
    return this.doRestQuery(organizationsQueryUrl, accessToken)
  },

  handleResponseError: function (response, accessToken = null) {
    if (response.status === 401) {
      if (accessToken) {
        this.removeAccessTokenFromLocalStorage()
        return 'Something is wrong with your access token. Please login again.'
      } else {
        return 'Please authorize with GitHub before searching for a user.'
      }
    } else if (response.status === 404) {
      return 'User not found. Try another username.'
    } else if (this.rateLimitExceeded(response.headers)) {
      return this.getRateLimitReason(response.headers, accessToken)
    }
    return 'Something went wrong!'
  },

  getGraphQLResponseError: function (response) {
    return response.errors[0].message
  },

  rateLimitExceeded: function (headers) {
    const rateLimit = headers.get('X-RateLimit-Remaining')
    return rateLimit && rateLimit <= 0
  },

  getRateLimitReason: function (headers, accessToken = null) {
    const rateLimitReset = headers.get('X-RateLimit-Reset')
    if (rateLimitReset) {
      return 'Your rate limit is exceeded. You have to wait till ' + moment.unix(rateLimitReset).format('DD.MM.YYYY HH:mm:ss') + ' to do another request.'
    } else if (!accessToken) {
      return 'Your rate limit is exceeded. You have to login with GitHub to do another request.'
    } else {
      return 'Your rate limit is exceeded.'
    }
  },

  setAccessToken: function (accessToken = null) {
    if (accessToken) {
      window.localStorage.setItem('swhtd-gh-access-token', accessToken)
    } else {
      window.localStorage.removeItem('swhtd-gh-access-token')
    }
    this.accessToken = accessToken
    EventBus.$emit('token-changed', this.accessToken)
  },

  removeAccessTokenFromLocalStorage: function () {
    this.setAccessToken(null)
  }
}
