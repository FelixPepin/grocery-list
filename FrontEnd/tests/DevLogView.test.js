import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DevLogView from '../src/views/DevLogView.vue'
import { devLog } from '../src/data/devLog'
import { useI18n } from '../src/i18n/useI18n'

// Expected values are computed from devLog, so the tests keep working when the times change
const totalMinutes = devLog.reduce((sum, entry) => sum + (entry.minutes ?? 0), 0)

/** 42 → "42 min", 88 → "1 h 28" */
function expectedDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours === 0 ? `${rest} min` : `${hours} h ${String(rest).padStart(2, '0')}`
}

beforeEach(() => {
  useI18n().setLocale('en')
})

describe('DevLogView', () => {
  it('shows one row per step, with durations formatted in hours and minutes', () => {
    const wrapper = mount(DevLogView)
    const shownTimes = wrapper.findAll('tbody td.time').map((cell) => cell.text())
    const expectedTimes = devLog.map((entry) =>
      entry.minutes === null ? 'In progress' : expectedDuration(entry.minutes),
    )

    expect(shownTimes).toEqual(expectedTimes)
  })

  it('shows "In progress" for unfinished steps and leaves them out of the total', () => {
    const wrapper = mount(DevLogView)
    const pendingRows = wrapper.findAll('tbody td.pending')
    const expectedPending = devLog.filter((entry) => entry.minutes === null).length

    expect(pendingRows).toHaveLength(expectedPending)
    pendingRows.forEach((cell) => expect(cell.text()).toBe('In progress'))

    expect(wrapper.find('tfoot td.time').text()).toBe(expectedDuration(totalMinutes))
  })

  it('follows the FR/EN switch', async () => {
    const wrapper = mount(DevLogView)

    useI18n().setLocale('fr')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('h2').text()).toBe('Journal de développement')
    expect(wrapper.find('tbody th').text()).toBe(devLog[0].step.fr)
  })
})
