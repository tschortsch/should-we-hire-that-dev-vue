import Vue from 'vue'
import Main from '@/components/Main'

describe('Main.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Main)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('h1').textContent)
      .toEqual('Should we hire that dev?')
  })

  it('sets the correct default data', () => {
    expect(typeof Main.data).toBe('function')
    const defaultData = Main.data()
    expect(defaultData.userdata).toBe(null)
    expect(defaultData.commitsTotalCount).toBe(null)
    expect(defaultData.errorMessage).toBe('')
    expect(defaultData.isLoading).toBe(false)
  })
})
