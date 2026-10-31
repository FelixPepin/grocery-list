import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL

// Declared outside useGroceryList(): every component shares the same list
const items = ref([])
const isLoading = ref(false)
// Stores the error CODE (not a message) so the component can translate it
const errorCode = ref('')

export function useGroceryList() {
  /**
   * Loads every item from the API (GET /grocery_list).
   * On failure, errorCode is set and the current list is kept.
   */
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
      // fetch throws when the server can't be reached at all (backend stopped, wrong URL...)
      errorCode.value = 'NETWORK_ERROR'
    } finally {
      isLoading.value = false
    }
  }

  return { items, isLoading, errorCode, fetchItems }
}