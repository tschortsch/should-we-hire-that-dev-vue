import { mount } from '@vue/test-utils'
import GithubAuth from '@/components/GithubAuth'

describe('GithubAuth.vue', () => {
  it('should render logout button if accessToken is passed', () => {
    const wrapper = mount(GithubAuth, {
      propsData: {accessToken: '1234'}
    })
    expect(wrapper.html()).toContain('Logout')
  })
  it('should render authorize button if accessToken is missing', () => {
    const wrapper = mount(GithubAuth, {
      propsData: { accessToken: null }
    })
    expect(wrapper.html()).toContain('Authorize')
  })
})
