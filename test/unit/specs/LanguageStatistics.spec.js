import { shallow } from '@vue/test-utils'
import LanguageStatistics from '@/components/statistics/LanguageStatistics'
import userdataCorrectFixture from '../fixtures/userdata-correct'

describe('Statistics.vue', () => {
  it('should handle empty props', () => {
    const repositoriesContributedTo = []
    const wrapper = shallow(LanguageStatistics, {
      propsData: { repositoriesContributedTo: repositoriesContributedTo }
    })
    const defaultChartData = {
      labels: [],
      datasets: []
    }
    expect(wrapper.vm.chartData).toEqual(defaultChartData)
  })

  it('should compute correct values', () => {
    const userdata = userdataCorrectFixture.data.user
    const repositoriesContributedTo = userdata.repositoriesContributedTo.nodes
    const wrapper = shallow(LanguageStatistics, {
      propsData: { repositoriesContributedTo: repositoriesContributedTo }
    })
    const chartData = {
      'datasets': [
        {
          'backgroundColor': [
            '#96db89',
            '#FFCE56',
            '#ff8668',
            '#FF6384',
            '#9992ff',
            '#36A2EB',
            '#a7e7ff'
          ],
          'data': [77, 7.8, 6.1, 5.5, 2.8, 0.8],
          'hoverBackgroundColor': [
            '#96db89',
            '#FFCE56',
            '#ff8668',
            '#FF6384',
            '#9992ff',
            '#36A2EB',
            '#a7e7ff'
          ]
        }
      ],
      'labels': [
        'PHP',
        'JavaScript',
        'Python',
        'HTML',
        'CSS',
        'Other'
      ]
    }
    expect(wrapper.vm.chartData).toEqual(chartData)
  })
})
