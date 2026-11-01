import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroceryList from '../src/components/GroceryList.vue'
import { useI18n } from '../src/i18n/useI18n'
import { useGroceryList } from '../src/composables/useGroceryList'

const items = [
  { id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 },
  { id: 2, name: 'Banana', quantity: 6, unit_price: 0.35 },
]

beforeEach(() => {
  useI18n().setLocale('en')
  useGroceryList().items.value = [...items]
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GroceryList', () => {
  it('shows one card per item and the total of the list', () => {
    const wrapper = mount(GroceryList, { props: { items } })

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.find('.total').text()).toContain('$6.60')
  })

  it('clears the whole list after confirmation', async () => {
    fetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn() })
    const wrapper = mount(GroceryList, { props: { items } })

    await wrapper.find('.summary button.danger').trigger('click')
    // The last dialog is the one of the list (each card has its own for its delete)
    const dialogs = wrapper.findAll('dialog')
    await dialogs[dialogs.length - 1].find('button.danger').trigger('click')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/grocery_list$/),
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(useGroceryList().items.value).toEqual([])
  })
})