import { shallowMount } from '@vue/test-utils'
import GithubUsernameInput from '@/components/GithubUsernameInput'

// import custom directive
import Vue from 'vue'
import VueVisible from 'vue-visible'
Vue.use(VueVisible)

describe('StatisticsBox.vue', () => {
  it('should handle empty values', () => {
    const username = ''
    const isLoading = false
    const wrapper = shallowMount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.value).toEqual('')
    expect(wrapper.find('#username').element.disabled).toBe(false)
  })

  it('should be disabled during loading', () => {
    const username = ''
    const isLoading = true
    const wrapper = shallowMount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.disabled).toBe(true)
  })

  it('should have username as value', () => {
    const username = 'tschortsch'
    const isLoading = false
    const wrapper = shallowMount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.value).toEqual(username)
  })
})
