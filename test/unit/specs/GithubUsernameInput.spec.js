import { mount } from '@vue/test-utils'
import GithubUsernameInput from '@/components/GithubUsernameInput'

describe('StatisticsBox.vue', () => {
  it('should handle empty values', () => {
    const username = ''
    const isLoading = false
    const wrapper = mount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.value).toEqual('')
    expect(wrapper.find('#username').element.disabled).toBe(false)
  })

  it('should be disabled during loading', () => {
    const username = ''
    const isLoading = true
    const wrapper = mount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.disabled).toBe(true)
  })

  it('should have username as value', () => {
    const username = 'tschortsch'
    const isLoading = false
    const wrapper = mount(GithubUsernameInput, {
      propsData: { username: username, isLoading: isLoading }
    })
    expect(wrapper.find('#username').element.value).toEqual(username)
  })
})
