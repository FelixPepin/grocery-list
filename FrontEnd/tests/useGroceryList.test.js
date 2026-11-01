import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGroceryList } from '../src/composables/useGroceryList'

const { items, isLoading, errorCode, total, fetchItems, updateItem, deleteItem, deleteAllItems } =
  useGroceryList()
const apple = { id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 }

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

beforeEach(() => {
  // Reset the shared state between tests
  items.value = []
  errorCode.value = ''
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useGroceryList - fetchItems', () => {
  it('loads the items returned by the API', async () => {
    fetch.mockResolvedValue(fakeResponse(200, { data: [apple] }))

    await fetchItems()

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/grocery_list'))
    expect(items.value).toEqual([apple])
    expect(errorCode.value).toBe('')
  })

  it('keeps the error code sent by the API', async () => {
    fetch.mockResolvedValue(fakeResponse(500, { code: 'INTERNAL_ERROR' }))

    await fetchItems()

    expect(errorCode.value).toBe('INTERNAL_ERROR')
  })

  it('sets NETWORK_ERROR when the server cannot be reached', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await fetchItems()

    expect(errorCode.value).toBe('NETWORK_ERROR')
  })

  it('shows the loading state only while the request is running', async () => {
    fetch.mockResolvedValue(fakeResponse(200, { data: [] }))

    const request = fetchItems()
    expect(isLoading.value).toBe(true)

    await request
    expect(isLoading.value).toBe(false)
  })
})

describe('useGroceryList - update, delete and total', () => {
  const banana = { id: 2, name: 'Banana', quantity: 6, unit_price: 0.35 }

  beforeEach(() => {
    items.value = [apple, banana]
  })

  it('replaces the updated item with the version returned by the API', async () => {
    const updated = { ...apple, quantity: 10 }
    fetch.mockResolvedValue(fakeResponse(200, { data: updated }))

    const result = await updateItem(1, { name: 'Apple', quantity: 10, unit_price: 1.5 })

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/grocery_list/1'),
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(result).toEqual({ success: true, item: updated })
    expect(items.value).toEqual([updated, banana])
  })

  it('keeps the list unchanged when the update fails', async () => {
    fetch.mockResolvedValue(fakeResponse(500, { code: 'INTERNAL_ERROR' }))

    const result = await updateItem(1, { name: 'Apple', quantity: 10, unit_price: 1.5 })

    expect(result).toEqual({ success: false, code: 'INTERNAL_ERROR' })
    expect(items.value).toEqual([apple, banana])
  })

  it('removes the deleted item without reading the empty 204 body', async () => {
    const json = vi.fn()
    fetch.mockResolvedValue({ ok: true, status: 204, json })

    const result = await deleteItem(1)

    expect(json).not.toHaveBeenCalled()
    expect(result).toEqual({ success: true })
    expect(items.value).toEqual([banana])
  })

  it('keeps the item when the delete fails', async () => {
    fetch.mockResolvedValue(fakeResponse(404, { code: 'ITEM_NOT_FOUND' }))

    const result = await deleteItem(1)

    expect(result).toEqual({ success: false, code: 'ITEM_NOT_FOUND' })
    expect(items.value).toEqual([apple, banana])
  })

  it('empties the list when every item is deleted', async () => {
    fetch.mockResolvedValue({ ok: true, status: 204, json: vi.fn() })

    await deleteAllItems()

    expect(items.value).toEqual([])
  })

  it('computes the total of the list', () => {
    // 3 × 1.50 + 6 × 0.35 = 6.60
    expect(total.value).toBeCloseTo(6.6)
  })
})
