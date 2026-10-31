import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import GroceryForm from '../src/components/GroceryForm.vue'
import { useI18n } from '../src/i18n/useI18n'
import { useGroceryList } from '../src/composables/useGroceryList'

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

/** Fills the form like a user would. */
async function fillForm(wrapper, { name, quantity, unitPrice }) {
  await wrapper.find('#item-name').setValue(name)
  await wrapper.find('#item-quantity').setValue(quantity)
  await wrapper.find('#item-unit-price').setValue(unitPrice)
}

let wrapper

beforeEach(() => {
  useI18n().setLocale('en')
  useGroceryList().items.value = []
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

describe('GroceryForm - validation', () => {
  it('shows an error under each invalid field and sends nothing', async () => {
    wrapper = mount(GroceryForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#item-name-error').text()).toBe('Name cannot be empty.')
    expect(wrapper.find('#item-unit-price-error').text()).toBe('Unit price is required.')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('puts the focus on the first invalid field', async () => {
    // attachTo is needed: focus only works on elements that are in the document
    wrapper = mount(GroceryForm, { attachTo: document.body })

    await wrapper.find('form').trigger('submit')

    expect(document.activeElement).toBe(wrapper.find('#item-name').element)
  })

  it('waits until the user leaves a field before showing its error', async () => {
    wrapper = mount(GroceryForm)
    const nameInput = wrapper.find('#item-name')

    await nameInput.setValue('')
    expect(wrapper.find('#item-name-error').exists()).toBe(false)

    await nameInput.trigger('blur')
    expect(wrapper.find('#item-name-error').exists()).toBe(true)
  })

  it('shows the max value in the message', async () => {
    wrapper = mount(GroceryForm)

    await fillForm(wrapper, { name: 'Egg', quantity: '99999', unitPrice: '1' })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('#item-quantity-error').text()).toBe('Quantity cannot exceed 10000.')
  })
})

describe('GroceryForm - submission', () => {
  it('sends the trimmed item, shows a success message and resets the form', async () => {
    fetch.mockResolvedValue(
      fakeResponse(201, { data: { id: 5, name: 'Banana', quantity: 3, unit_price: 0.35 } }),
    )
    wrapper = mount(GroceryForm)

    await fillForm(wrapper, { name: '  Banana  ', quantity: '3', unitPrice: '0.35' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const [url, options] = fetch.mock.calls[0]
    expect(url).toContain('/grocery_list')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({ name: 'Banana', quantity: 3, unit_price: 0.35 })

    expect(wrapper.text()).toContain('Banana was added to your list.')
    expect(wrapper.find('#item-name').element.value).toBe('')
    // The new item is at the top of the shared list
    expect(useGroceryList().items.value[0].name).toBe('Banana')
  })

  it('shows the translated error returned by the server', async () => {
    fetch.mockResolvedValue(fakeResponse(500, { code: 'INTERNAL_ERROR' }))
    wrapper = mount(GroceryForm)

    await fillForm(wrapper, { name: 'Egg', quantity: '1', unitPrice: '2' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Something went wrong. Please try again later.',
    )
  })

  it('shows a network error when the server cannot be reached', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))
    wrapper = mount(GroceryForm)

    await fillForm(wrapper, { name: 'Egg', quantity: '1', unitPrice: '2' })
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[role="alert"]').text()).toBe(
      'Unable to reach the server. Is the backend running?',
    )
  })
})