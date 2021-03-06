import { shallowMount } from '@vue/test-utils'
import GithubAuth from '@/components/GithubAuth'

describe('GithubAuth.vue', () => {
  it('should render logout button if authorized', () => {
    const wrapper = shallowMount(GithubAuth, {
      propsData: { isAuthorized: true }
    })
    expect(wrapper.html()).toContain('Logout')
  })
  it('should render authorize button not authorized', () => {
    const wrapper = shallowMount(GithubAuth, {
      propsData: { isAuthorized: false }
    })
    expect(wrapper.html()).toContain('Authorize')
  })
})
