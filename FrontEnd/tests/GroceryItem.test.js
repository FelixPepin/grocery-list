import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroceryItem from '../src/components/GroceryItem.vue'
import { useI18n } from '../src/i18n/useI18n'
import { useGroceryList } from '../src/composables/useGroceryList'

beforeEach(() => {
  useI18n().setLocale('en')
})

describe('GroceryItem', () => {
  it('shows the name, quantity, unit price and subtotal', () => {
    const wrapper = mount(GroceryItem, {
      props: { item: { id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 } },
    })

    expect(wrapper.text()).toContain('Apple')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('$1.50')
    // 3 × $1.50
    expect(wrapper.text()).toContain('$4.50')
  })

  it('rounds the subtotal correctly despite floating-point errors', () => {
    // In JavaScript, 3 × 0.35 = 1.0499999999999998
    const wrapper = mount(GroceryItem, {
      props: { item: { id: 1, name: 'Banana', quantity: 3, unit_price: 0.35 } },
    })

    expect(wrapper.text()).toContain('$1.05')
  })
})

describe('GroceryItem - edit and delete', () => {
  const apple = { id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 }

  function fakeResponse(status, body) {
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  }

  beforeEach(() => {
    useGroceryList().items.value = [apple]
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('asks for a confirmation and deletes the item on "Yes"', async () => {
    fetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn() })
    const wrapper = mount(GroceryItem, { props: { item: apple } })

    await wrapper.find('button[aria-label="Delete Apple"]').trigger('click')
    expect(wrapper.find('dialog').attributes('open')).toBeDefined()

    await wrapper.find('dialog button.danger').trigger('click')
    await flushPromises()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/grocery_list/1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(useGroceryList().items.value).toEqual([])
  })

  it('deletes nothing when the user answers "No"', async () => {
    const wrapper = mount(GroceryItem, { props: { item: apple } })

    await wrapper.find('button[aria-label="Delete Apple"]').trigger('click')
    // "No" is the first button of the modal
    await wrapper.find('dialog button').trigger('click')

    expect(wrapper.find('dialog').attributes('open')).toBeUndefined()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('opens the form filled with the item and saves the changes', async () => {
    fetch.mockResolvedValue(fakeResponse(200, { data: { ...apple, quantity: 5 } }))
    const wrapper = mount(GroceryItem, { props: { item: apple } })

    await wrapper.find('button[aria-label="Edit Apple"]').trigger('click')
    // The edit form uses unique ids (edit-<id>-...) so it never clashes with the add form
    expect(wrapper.find('#edit-1-item-name').element.value).toBe('Apple')

    await wrapper.find('#edit-1-item-quantity').setValue('5')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      name: 'Apple',
      quantity: 5,
      unit_price: 1.5,
    })
    // The form closes once the item is saved
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('closes the form without saving on "Cancel"', async () => {
    const wrapper = mount(GroceryItem, { props: { item: apple } })

    await wrapper.find('button[aria-label="Edit Apple"]').trigger('click')
    await wrapper.find('button.secondary').trigger('click')

    expect(wrapper.find('form').exists()).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })
})
