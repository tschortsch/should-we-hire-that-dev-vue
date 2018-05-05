import { mount } from '@vue/test-utils'
import StatisticsBox from '@/components/statistics/StatisticsBox'

describe('StatisticsBox.vue', () => {
  it('should compute correct values', () => {
    const title = 'Total commits'
    const value = 430
    const additionalValue = 'Additional value'
    const ranking = 60
    const wrapper = mount(StatisticsBox, {
      propsData: { title: title, value: value, additionalValue: additionalValue, ranking: ranking }
    })
    expect(wrapper.vm.rankingClass).toEqual('rank-60')
    expect(wrapper.vm.rankingPercent).toEqual('60%')
  })

  it('should be able to handle empty values', () => {
    const title = 'Total commits'
    const value = 0
    const ranking = 0
    const wrapper = mount(StatisticsBox, {
      propsData: { title: title, value: value, ranking: ranking }
    })
    expect(wrapper.vm.rankingClass).toEqual('')
    expect(wrapper.vm.rankingPercent).toEqual('0%')
  })

  it('should show correct values', (done) => {
    const title = 'Total commits'
    const value = 430
    const additionalValue = 'Additional value'
    const ranking = 60
    const wrapper = mount(StatisticsBox, {
      propsData: { title: title, value: value, additionalValue: additionalValue, ranking: ranking }
    })
    expect(wrapper.find('h3').text()).toEqual(title)
    expect(wrapper.find('p.additional-value').text()).toEqual(additionalValue)

    // wait till countup animation has finished
    setTimeout(() => {
      expect(wrapper.find('p.value').text()).toEqual(value.toString())
      done()
    }, 2500)
  })

  it('should handle string values', () => {
    const title = 'User since'
    const value = '6 years ago'
    const ranking = 60
    const wrapper = mount(StatisticsBox, {
      propsData: { title: title, value: value, ranking: ranking }
    })
    expect(wrapper.find('h3').text()).toEqual(title)
    expect(wrapper.find('p.additional-value').exists()).toBe(false)
    expect(wrapper.find('p.value').text()).toEqual(value.toString())
  })
})
