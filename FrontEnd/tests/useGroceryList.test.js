import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGroceryList } from '../src/composables/useGroceryList'

const { items, isLoading, errorCode, fetchItems } = useGroceryList()
const apple = { id: 1, name: 'Apple', quantity: 3, unit_price: 1.5 }

/** Builds a fake fetch response, like the one the browser returns. */
function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

beforeEach(() => {
  // The state is shared by the whole app: reset it between tests
  items.value = []
  errorCode.value = ''
  // fetch is replaced by a fake: the tests never call the real API
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