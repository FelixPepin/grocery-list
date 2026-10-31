import { describe, it, expect } from 'vitest'
import { validateItem } from '../src/utils/validateItem'

const validItem = { name: 'Apple', quantity: 3, unit_price: 1.5 }

describe('validateItem', () => {
  it('returns no error for a valid item', () => {
    expect(validateItem(validItem)).toEqual({})
  })

  // Same rules and codes as the API, so both sides stay consistent
  it.each([
    ['name is empty', { name: '' }, 'name', 'NAME_EMPTY'],
    ['name is only spaces', { name: '   ' }, 'name', 'NAME_EMPTY'],
    ['name is too long', { name: 'A'.repeat(51) }, 'name', 'NAME_TOO_LONG'],
    ['quantity is empty', { quantity: '' }, 'quantity', 'QUANTITY_REQUIRED'],
    ['quantity is a decimal', { quantity: 2.5 }, 'quantity', 'QUANTITY_INVALID'],
    ['quantity is 0', { quantity: 0 }, 'quantity', 'QUANTITY_TOO_LOW'],
    ['quantity is too high', { quantity: 10001 }, 'quantity', 'QUANTITY_TOO_HIGH'],
    ['quantity is huge', { quantity: 1.23e21 }, 'quantity', 'QUANTITY_TOO_HIGH'],
    ['unit_price is empty', { unit_price: '' }, 'unit_price', 'UNIT_PRICE_REQUIRED'],
    ['unit_price is not a number', { unit_price: 'abc' }, 'unit_price', 'UNIT_PRICE_INVALID'],
    ['unit_price is 0', { unit_price: 0 }, 'unit_price', 'UNIT_PRICE_TOO_LOW'],
    ['unit_price is too high', { unit_price: 100001 }, 'unit_price', 'UNIT_PRICE_TOO_HIGH'],
  ])('returns an error when %s', (_label, override, field, code) => {
    expect(validateItem({ ...validItem, ...override })).toEqual({ [field]: code })
  })

  it('returns one error per invalid field at the same time', () => {
    expect(validateItem({ name: '', quantity: 0, unit_price: '' })).toEqual({
      name: 'NAME_EMPTY',
      quantity: 'QUANTITY_TOO_LOW',
      unit_price: 'UNIT_PRICE_REQUIRED',
    })
  })
})