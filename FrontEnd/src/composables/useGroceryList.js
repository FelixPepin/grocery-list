import { computed, ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL

// Outside the function so all components share the same list
const items = ref([])
const isLoading = ref(false)
const errorCode = ref('')

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
)

/**
 * Shared list state and API calls. Every component uses the same list, so no Pinia needed.
 * Actions never throw: they return { success: true, item? } or { success: false, code }.
 */
export function useGroceryList() {
  async function fetchItems() {
    isLoading.value = true
    errorCode.value = ''

    try {
      const response = await fetch(`${API_URL}/grocery_list`)
      const body = await response.json()

      if (!response.ok) {
        errorCode.value = body.code || 'INTERNAL_ERROR'
        return
      }

      items.value = body.data
    } catch {
      errorCode.value = 'NETWORK_ERROR'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Creates an item (POST /grocery_list) and adds it at the top of the list.
   * Returns { success: true, item } or { success: false, code } so the form can react.
   */
  async function createItem(item) {
    try {
      const response = await fetch(`${API_URL}/grocery_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      const body = await response.json()

      if (!response.ok) {
        return { success: false, code: body.code || 'INTERNAL_ERROR' }
      }

      // Newest first, same order as the API
      items.value.unshift(body.data)
      return { success: true, item: body.data }
    } catch {
      return { success: false, code: 'NETWORK_ERROR' }
    }
  }

  /**
   * Updates an item (PUT /grocery_list/:id) and replaces it in the list.
   * Returns { success: true, item } or { success: false, code }.
   */
  async function updateItem(id, item) {
    try {
      const response = await fetch(`${API_URL}/grocery_list/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      const body = await response.json()

      if (!response.ok) {
        return { success: false, code: body.code || 'INTERNAL_ERROR' }
      }

      items.value = items.value.map((existing) => (existing.id === id ? body.data : existing))
      return { success: true, item: body.data }
    } catch {
      return { success: false, code: 'NETWORK_ERROR' }
    }
  }

  /**
   * Deletes an item (DELETE /grocery_list/:id) and removes it from the list.
   * Returns { success: true } or { success: false, code }.
   */
  async function deleteItem(id) {
    try {
      const response = await fetch(`${API_URL}/grocery_list/${id}`, { method: 'DELETE' })

      // Only read the body on error: a 204 has none
      if (!response.ok) {
        const body = await response.json()
        return { success: false, code: body.code || 'INTERNAL_ERROR' }
      }

      items.value = items.value.filter((item) => item.id !== id)
      return { success: true }
    } catch {
      return { success: false, code: 'NETWORK_ERROR' }
    }
  }

  /**
   * Deletes every item (DELETE /grocery_list).
   * Returns { success: true } or { success: false, code }.
   */
  async function deleteAllItems() {
    try {
      const response = await fetch(`${API_URL}/grocery_list`, { method: 'DELETE' })

      if (!response.ok) {
        const body = await response.json()
        return { success: false, code: body.code || 'INTERNAL_ERROR' }
      }

      items.value = []
      return { success: true }
    } catch {
      return { success: false, code: 'NETWORK_ERROR' }
    }
  }

  return {
    items,
    isLoading,
    errorCode,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    deleteAllItems,
    total,
  }
}
