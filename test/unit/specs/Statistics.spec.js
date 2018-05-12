import { shallowMount } from '@vue/test-utils'
import moment from 'moment'
import Statistics from '@/components/statistics/Statistics'
import userdataCorrectFixture from '../fixtures/userdata-correct'
import commitsCorrectFixture from '../fixtures/commits-correct'

describe('Statistics.vue', () => {
  it('should handle empty props', () => {
    const wrapper = shallowMount(Statistics)
    const defaultStatisticsValues = [
      {
        name: 'createdAt',
        value: '-',
        ranking: 0
      },
      {
        name: 'followers',
        value: 0,
        ranking: 0
      },
      {
        disabled: true,
        name: 'stars',
        value: '???',
        ranking: 0
      },
      {
        disabled: true,
        name: 'forks',
        value: '???',
        ranking: 0
      },
      {
        name: 'commits',
        value: 0,
        ranking: 0
      },
      {
        name: 'commitMessageWordCount',
        ranking: 0,
        value: 0
      },
      {
        disabled: true,
        name: 'pullRequests',
        value: '???',
        ranking: 0
      },
      {
        name: 'repos',
        value: 0,
        ranking: 0
      }
    ]
    expect(wrapper.vm.statisticsValues).toEqual(defaultStatisticsValues)
    expect(wrapper.vm.overallRankingValue).toEqual('???')
    expect(wrapper.vm.maxRanking).toEqual(defaultStatisticsValues.length * 100)
  })

  it('should compute correct values', () => {
    const userdata = userdataCorrectFixture.data.user
    // overwrite createdAt date to fix calculated value
    const twoYearsAgo = moment().subtract(2, 'years')
    userdata.createdAt = twoYearsAgo.format('YYYY-MM-DD')
    const commits = commitsCorrectFixture.items
    const commitsTotalCount = 100
    const wrapper = shallowMount(Statistics, {
      propsData: {
        userdata: userdata,
        commitsTotalCount: commitsTotalCount,
        commits: commits,
        repositories: userdata.repositories.nodes,
        repositoriesContributedTo: userdata.repositoriesContributedTo.nodes,
        isAuthorized: true
      }
    })
    const statisticsValues = [
      {
        additionalValue: '(' + twoYearsAgo.format('DD.MM.YYYY') + ')',
        name: 'createdAt',
        ranking: 30,
        value: '2 years ago'
      },
      {
        name: 'followers',
        ranking: 30,
        value: 21
      },
      {
        name: 'stars',
        ranking: 60,
        value: 88
      },
      {
        name: 'forks',
        ranking: 40,
        value: 32
      },
      {
        name: 'commits',
        ranking: 10,
        value: 100
      },
      {
        additionalValue: '(average word count)',
        name: 'commitMessageWordCount',
        ranking: 100,
        value: '6.5'
      },
      {
        name: 'pullRequests',
        ranking: 50,
        value: 244
      },
      {
        name: 'repos',
        ranking: 50,
        value: 30
      }
    ]
    expect(wrapper.vm.statisticsValues).toEqual(statisticsValues)
    expect(wrapper.vm.repositoriesContributedTo).toEqual(userdata.repositoriesContributedTo.nodes)
    expect(wrapper.vm.overallRankingValue).toEqual(370)
    expect(wrapper.vm.maxRanking).toEqual(statisticsValues.length * 100)
  })
})
