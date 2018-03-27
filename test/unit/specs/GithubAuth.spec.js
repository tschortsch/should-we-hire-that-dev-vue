import Vue from 'vue'
import GithubAuth from '@/components/GithubAuth'

// helper function that mounts and returns the rendered text
function getRenderedText (Component, propsData, querySelector) {
  const Constructor = Vue.extend(Component)
  const vm = new Constructor({ propsData: propsData }).$mount()
  if (querySelector) {
    return vm.$el.querySelector(querySelector).textContent
  } else {
    return vm.$el.textContent
  }
}

describe('GithubAuth.vue', () => {
  it('should render logout button if accessToken is passed', () => {
    const renderedText = getRenderedText(GithubAuth, { accessToken: '1234' }, 'button')
    expect(renderedText).toEqual(expect.stringContaining('Logout'))
  })
  it('should render authorize button if accessToken is missing', () => {
    const renderedText = getRenderedText(GithubAuth, { accessToken: null }, 'button')
    expect(renderedText).toEqual(expect.stringContaining('Authorize'))
  })
})
