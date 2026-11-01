import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../src/App.vue'
import { routes } from '../src/router'
import { useI18n } from '../src/i18n/useI18n'

async function mountAt(path) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(path)
  await router.isReady()

  const wrapper = mount(App, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router }
}

beforeEach(() => {
  useI18n().setLocale('en')
  // The list page calls fetch on mount
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [] }) }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App - navigation', () => {
  it('shows the grocery list on "/" and marks its link as the current page', async () => {
    const { wrapper } = await mountAt('/')

    expect(wrapper.find('form').exists()).toBe(true)

    // RouterLink sets aria-current="page" on the active link, which screen readers announce


    expect(wrapper.find('nav a[aria-current="page"]').text()).toBe('Grocery list')
  })

  it('opens the development log when its link is clicked', async () => {
    const { wrapper, router } = await mountAt('/')

    await wrapper.findAll('nav a')[1].trigger('click')

    // Lazy-loaded page: wait for it to render
    await vi.waitFor(() => expect(wrapper.find('table').exists()).toBe(true))
    expect(router.currentRoute.value.path).toBe('/dev-log')
    expect(wrapper.find('nav a[aria-current="page"]').text()).toBe('Development log')
  })

  it('redirects an unknown URL to the grocery list', async () => {
    const { router } = await mountAt('/does-not-exist')

    expect(router.currentRoute.value.path).toBe('/')
  })
})
