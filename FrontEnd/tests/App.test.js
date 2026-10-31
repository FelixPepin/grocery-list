import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../src/App.vue'
import { useI18n } from '../src/i18n/useI18n'
import { useGroceryList } from '../src/composables/useGroceryList'

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

beforeEach(() => {
  useI18n().setLocale('en')
  const { items, errorCode } = useGroceryList()
  items.value = []
  errorCode.value = ''
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows the items once they are loaded', async () => {
    fetch.mockResolvedValue(
      fakeResponse(200, { data: [{ id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 }] }),
    )

    const wrapper = mount(App)
    // Waits for onMounted → fetchItems() to finish
    await flushPromises()

    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(wrapper.text()).toContain('Apple')
  })

  it('shows a translated error when the server cannot be reached', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Unable to reach the server. Is the backend running?',
    )
  })

  it('shows a message when the list is empty', async () => {
    fetch.mockResolvedValue(fakeResponse(200, { data: [] }))

    const wrapper = mount(App)
    await flushPromises()

    expect(wrapper.text()).toContain('Your list is empty')
    expect(wrapper.find('li').exists()).toBe(false)
  })
})