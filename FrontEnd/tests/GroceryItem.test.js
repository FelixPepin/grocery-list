import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GroceryItem from '../src/components/GroceryItem.vue'
import { useI18n } from '../src/i18n/useI18n'

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