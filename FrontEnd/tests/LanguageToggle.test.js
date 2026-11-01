import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageToggle from '../src/components/LanguageToggle.vue'
import { useI18n } from '../src/i18n/useI18n'

describe('LanguageToggle', () => {
  it('switches the language and marks the active button', async () => {
    const { locale, setLocale } = useI18n()
    setLocale('fr')
    const wrapper = mount(LanguageToggle)
    const [frButton, enButton] = wrapper.findAll('button')

    expect(frButton.attributes('aria-pressed')).toBe('true')

    await enButton.trigger('click')

    expect(locale.value).toBe('en')
    expect(enButton.attributes('aria-pressed')).toBe('true')
    expect(frButton.attributes('aria-pressed')).toBe('false')
  })
})
