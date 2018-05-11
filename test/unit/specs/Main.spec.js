import { shallowMount } from '@vue/test-utils'
import Main from '@/components/Main'

describe('Main.vue', () => {
  it('should render correct contents', () => {
    const wrapper = shallowMount(Main)
    expect(wrapper.find('h1').text()).toEqual('Should we hire that dev?')
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
