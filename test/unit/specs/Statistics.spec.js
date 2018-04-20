import { shallow } from '@vue/test-utils'
import Statistics from '@/components/Statistics'
import userdataCorrectFixture from '../fixtures/userdata-correct'

describe('Statistics.vue', () => {
  it('should handle empty props', () => {
    const wrapper = shallow(Statistics)
    const defaultStatisticsValues = [
      {
        name: 'createdAt',
        value: '-',
        additionalValue: '',
        ranking: 0
      },
      {
        name: 'stars',
        value: 0,
        ranking: 0
      },
      {
        name: 'followers',
        value: 0,
        ranking: 0
      },
      {
        name: 'commits',
        value: 0,
        ranking: 0
      },
      {
        name: 'repos',
        value: 0,
        ranking: 0
      },
      {
        name: 'pullRequests',
        value: 0,
        ranking: 0
      }
    ]
    expect(wrapper.vm.statisticsValues).toEqual(defaultStatisticsValues)
    expect(wrapper.vm.repositoriesContributedTo).toEqual([])
    expect(wrapper.vm.overallRankingValue).toEqual(0)
    expect(wrapper.vm.maxRanking).toEqual(defaultStatisticsValues.length * 100)
  })

  it('should compute correct values', () => {
    const userdata = userdataCorrectFixture.data.user
    const commitsTotalCount = 100
    const wrapper = shallow(Statistics, {
      propsData: { userdata: userdata, commitsTotalCount: commitsTotalCount }
    })
    const statisticsValues = [
      {
        'additionalValue': '(19.09.2011)',
        'name': 'createdAt',
        'ranking': 100,
        'value': '7 years ago'
      },
      {
        'name': 'stars',
        'ranking': 60,
        'value': 88
      },
      {
        'name': 'followers',
        'ranking': 30,
        'value': 20
      },
      {
        'name': 'commits',
        'ranking': 10,
        'value': 100
      },
      {
        'name': 'repos',
        'ranking': 50,
        'value': 30
      },
      {
        'name': 'pullRequests',
        'ranking': 50,
        'value': 243
      }
    ]
    expect(wrapper.vm.statisticsValues).toEqual(statisticsValues)
    expect(wrapper.vm.repositoriesContributedTo).toEqual(userdata.repositoriesContributedTo.nodes)
    expect(wrapper.vm.overallRankingValue).toEqual(300)
    expect(wrapper.vm.maxRanking).toEqual(statisticsValues.length * 100)
  })

  it('judgment works with unknown type', () => {
    const wrapper = shallow(Statistics)
    expect(wrapper.vm.getJudgement('bla', 0)).toEqual(0)
  })
})
