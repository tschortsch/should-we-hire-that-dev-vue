import { mount } from '@vue/test-utils'
import OverallRanking from '@/components/statistics/OverallRanking'

describe('OverallRanking.vue', () => {
  it('should compute correct values', () => {
    const title = 'Overall ranking'
    const value = 430
    const maxRanking = 500
    const wrapper = mount(OverallRanking, {
      propsData: { title: title, value: value, maxRanking: maxRanking }
    })
    expect(wrapper.vm.ranking).toEqual(86)
    expect(wrapper.vm.rankingClass).toEqual('rank-90')
    expect(wrapper.vm.rankingPercent).toEqual('86%')
  })

  it('should be able to handle empty values', () => {
    const title = 'Overall ranking'
    const value = 0
    const maxRanking = 0
    const wrapper = mount(OverallRanking, {
      propsData: { title: title, value: value, maxRanking: maxRanking }
    })
    expect(wrapper.vm.ranking).toEqual(0)
    expect(wrapper.vm.rankingClass).toEqual('')
    expect(wrapper.vm.rankingPercent).toEqual('0%')
  })

  it('should show correct values', (done) => {
    const title = 'Overall ranking'
    const value = 430
    const maxRanking = 500

    const wrapper = mount(OverallRanking, { propsData: { title: title, value: value, maxRanking: maxRanking } })
    expect(wrapper.find('h3').text()).toEqual(title)

    // wait till countup animation has finished
    setTimeout(() => {
      expect(wrapper.find('p.value').text()).toEqual('430 / 500')
      done()
    }, 2500)
  })
})
